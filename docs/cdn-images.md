# Imagens de produto — arquitetura

## Princípio

Imagens são servidas por **object storage + CDN**. API não serve bytes binários.

**DB armazena apenas o `key`** (filename dentro do bucket, ex.: `polo-preta.webp`). Clientes prefixam `IMAGE_BASE_URL` próprio em runtime → mesma row do DB funciona em dev e prod sem migração.

```
            DB (products.url_img = "polo-preta.webp")
                            │
       ┌────────────────────┼─────────────────────┐
       ▼                    ▼                     ▼
[web - VITE_IMAGE_BASE_URL] [mobile - EXPO_PUBLIC_IMAGE_BASE_URL]
       │                    │
       └──────► <BASE>/polo-preta.webp ──────► [storage/CDN]
```

## Por que `key` em vez de URL completa?

| Approach | DB armazena | Multi-env? | Migração ao trocar CDN? |
|----------|-------------|------------|--------------------------|
| URL completa | `http://localhost:7000/images/products/x.webp` | ❌ um DB por env | sim, UPDATE em massa |
| **Key (atual)** | `x.webp` | ✅ mesmo DB | só env var muda |

## Dev (local, via Docker Compose)

| Componente            | Função                                  | Porta            |
|-----------------------|-----------------------------------------|------------------|
| `minio`               | S3-compatível, guarda os bytes          | 9000 (S3 API), 9001 (console) |
| `minio-init`          | Cria bucket `products`, libera leitura pública, faz upload de `seed-data/images/*` | — (one-shot) |
| `gateway` (nginx)     | Proxy `/images/products/<key>` → `minio:9000/products/<key>` | 7000 |

**Env vars dos clientes** (default):
- Web: `VITE_IMAGE_BASE_URL=http://localhost:7000/images/products`
- Mobile: `EXPO_PUBLIC_IMAGE_BASE_URL=http://localhost:7000/images/products` (físico precisa LAN IP)

`gateway` **não depende de minio**: se MinIO cair, gateway segue, só `/images/products/*` retorna 502.

Path com 2 segmentos (`/images/<bucket>/<key>`) permite futuras categorias (`/images/users/`, `/images/categories/`) sem mudar contrato dos clientes.

Console MinIO: `http://localhost:9001` (`minioadmin`/`minioadmin`, configurável via `MINIO_ROOT_USER`/`MINIO_ROOT_PASSWORD`).

### Adicionar nova imagem em dev

1. Drop em `src/seed-data/images/<file>`.
2. `docker compose up -d --force-recreate minio-init` (re-roda upload).
3. Cadastrar produto com `urlImg = "<file>"` (só o nome).

### Migrar produtos legados (DB com URLs completas)

Script PowerShell extrai o filename de qualquer formato e regrava só a key:

```powershell
pwsh src/scripts/fix-product-image-urls.ps1
```

Conversões:
- `/assets/polo-preta.webp` → `polo-preta.webp`
- `http://localhost:3000/assets/x.webp` → `x.webp`
- `http://localhost:7000/images/products/x.webp` → `x.webp`
- `https://placehold.co/600x600/png?text=Camiseta` → `<slug-do-nome>.webp` (precisa existir no bucket)
- `null` → skip

## Produção

| Recurso           | Opção A (AWS)         | Opção B (Cloudflare)        |
|-------------------|------------------------|------------------------------|
| Storage           | S3 bucket privado      | R2 bucket                    |
| CDN               | CloudFront distribution| Cloudflare (built-in)        |
| Upload (admin)    | Pre-signed PUT URL emitido pela Catalog API | Idem (R2 fala protocolo S3) |
| Env clientes      | `IMAGE_BASE_URL=https://cdn.dominio.com/images/products` | Idem |

**DB não muda entre envs.** Só a env var do cliente.

### Migração dev → prod

1. Provisionar bucket + CDN.
2. `mc mirror local/products s3/<bucket>/products`.
3. Build de prod com `VITE_IMAGE_BASE_URL=https://cdn.dominio.com/images/products` e `EXPO_PUBLIC_IMAGE_BASE_URL=https://cdn.dominio.com/images/products`.
4. Nenhuma migração de dados. Mesmo DB.

### Catalog API — pre-signed upload (próximo passo)

- `POST /catalog/products/:id/image/upload-url` → retorna pre-signed PUT URL + key.
- Admin faz `PUT` direto no storage (bytes não passam pela API).
- Após sucesso, cliente chama `PUT /catalog/products/:id` com `urlImg = <key>`.

## Por que não...

- **URL completa no DB?** Acopla DB a env. Cada deploy/troca de CDN exige migração.
- **Servir imagens pelo Catalog API?** Mistura responsabilidades, API vira gargalo de banda, perde cache de CDN.
- **Bundle no app?** Catálogo dinâmico — admin não rebuilda app pra adicionar produto.
- **Backend hidrata URL (B2)?** Mais limpo (single source of truth), porém exige mudança em Java. Adiar até precisar.
- **Cloudinary/imgix?** Boa opção em produção; fora do escopo acadêmico (vendor lock, conta paga em escala).
