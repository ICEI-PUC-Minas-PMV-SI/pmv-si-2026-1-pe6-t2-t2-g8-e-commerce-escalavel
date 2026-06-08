# Front-end Móvel

O front-end móvel do e-commerce escalável é desenvolvido com **React Native via Expo**, entregando uma experiência nativa em iOS e Android a partir de uma única base de código. O módulo de catálogo é o coração da aplicação: permite que clientes naveguem por produtos organizados em categorias, filtrem por nome, visualizem variantes de cor e tamanho com estoque em tempo real e adicionem itens ao carrinho. Administradores têm, na mesma interface, acesso a ações de criação, edição e exclusão de produtos, variantes e SKUs.

---

## Projeto da Interface

A interface do catálogo é organizada em quatro telas principais conectadas por navegação em pilha (Expo Router). O fluxo do usuário começa no **AppShell** (tela inicial com abas), onde a aba "Home" renderiza o catálogo. A partir daí, o usuário pode navegar para categorias, listar produtos por categoria e chegar ao detalhe de produto.

### Telas do Catálogo

#### 1. Tela Principal — Catálogo (`CatalogScreen`)
**Arquivo:** `src/mobile/src/screens/CatalogScreen.tsx`

A tela inicial exibe todos os produtos disponíveis com as seguintes funcionalidades:

- **Saudação personalizada** com base no horário (Bom dia / Boa tarde / Boa noite) e nome do usuário
- **Contador de produtos** visível como badge
- **Barra de busca** com filtragem local em tempo real pelo nome do produto
- **Chips de categoria** em scroll horizontal para filtrar produtos por categoria (a seleção de uma categoria dispara nova requisição à API)
- **Grade de produtos** em 2 colunas com cards clicáveis
- **Skeleton loading** durante o carregamento inicial
- **Pull-to-refresh** para recarregar manualmente
- **Estado de erro** com botão de repetir
- **FAB de criação** (apenas administradores) para abrir o formulário de produto
- **Long-press** nos cards (apenas administradores) para editar ou excluir produto

#### 2. Tela de Categorias (`CategoriesScreen`)
**Arquivo:** `src/mobile/app/catalog/categories.tsx`  
**Rota:** `/catalog/categories`

- Grade de 2 colunas com cards de categoria
- Skeleton loading e pull-to-refresh
- Long-press para editar ou excluir (admin)
- FAB para criar nova categoria (admin)
- Modal inline de criação/edição de categoria

#### 3. Tela de Produtos por Categoria
**Arquivo:** `src/mobile/app/catalog/products.tsx`  
**Rota:** `/catalog/products?categoryId=<id>&categoryName=<nome>`

- Título dinâmico com o nome da categoria recebido via query param
- Grade 2 colunas igual ao catálogo principal, porém filtrada por categoria
- Toque em qualquer produto navega para o detalhe

#### 4. Tela de Detalhe do Produto
**Arquivo:** `src/mobile/app/catalog/product/[id].tsx`  
**Rota:** `/catalog/product/[id]`

Tela mais rica do módulo, apresenta:

- **Imagem do produto** com fallback para ícone em caso de falha de carregamento
- **Badge de categoria**
- **Nome e descrição** do produto
- **Preço dinâmico**: exibe o menor preço disponível quando nenhum SKU está selecionado; atualiza para o preço exato ao selecionar variante + SKU
- **Seleção de variante** (cor): swatches circulares com visualização de cor; variantes esgotadas aparecem com opacidade reduzida e riscadas
- **Seleção de SKU** (tamanho/código com preço): chips com preço; SKUs sem estoque são desabilitados
- **Seletor de quantidade**: botões ± com input numérico, limitado ao estoque disponível menos itens já no carrinho
- **Botão "Adicionar ao Carrinho"**: feedback visual de confirmação após adição
- **Botões de admin** (editar / excluir) visíveis apenas para administradores

#### 5. Formulário de Produto (Admin)
**Arquivo:** `src/mobile/app/catalog/admin/product-form.tsx`  
**Rota:** `/catalog/admin/product-form?id=<id>` (apresentado como modal)

Formulário completo para criar ou editar produtos:

| Campo | Tipo | Obrigatório |
|---|---|---|
| Nome | Texto | Sim |
| Descrição | Texto longo | Não |
| URL da imagem | Texto (URL) | Não |
| Categoria | Dropdown | Não |

**Seção de Variantes:**
- Adicionar/remover variantes (cada variante representa uma cor)
- Seletor de cor com paleta de cores pré-definidas e preview visual
- Cards expansíveis mostrando os SKUs da variante

**Seção de SKUs (por variante):**

| Campo | Tipo | Obrigatório |
|---|---|---|
| Tamanho | Texto | Sim |
| Código | Texto | Sim |
| Preço | Numérico (R$) | Sim (≥ 0) |

SKUs existentes têm tamanho e código somente-leitura; apenas o preço pode ser atualizado.

---

### Componentes

#### `ProductCard`
**Arquivo:** `src/mobile/src/components/ProductCard.tsx`

Card reutilizável para exibição de produto na grade. Exibe imagem, tag de categoria, nome e preço mínimo. Suporta `onPress` (navegar ao detalhe) e `onLongPress` (menu de ações admin).

#### `CategoryFormModal`
**Arquivo:** `src/mobile/src/components/modals/CategoryFormModal.tsx`

Modal de formulário para criação e edição de categorias. Campos: nome (obrigatório) e descrição. Exibe banner de erro e indicador de carregamento.

---

### Wireframes

**Catálogo Principal:**
```
┌─────────────────────────────┐
│  Bom dia, Gabriel           │
│  12 produtos encontrados    │
│                             │
│  [🔍 Buscar produto...]     │
│                             │
│  [Todos][Camisetas][Calças] │
│                             │
│  ┌──────┐  ┌──────┐        │
│  │ IMG  │  │ IMG  │        │
│  │ Cat  │  │ Cat  │        │
│  │Nome  │  │Nome  │        │
│  │R$ XX │  │R$ XX │        │
│  └──────┘  └──────┘        │
│  ┌──────┐  ┌──────┐        │
│  │  ...  │  │  ...  │       │
│  └──────┘  └──────┘        │
│                          [+]│
└─────────────────────────────┘
```

**Detalhe de Produto:**
```
┌─────────────────────────────┐
│  ←  Produto                 │
│                             │
│  ┌─────────────────────┐   │
│  │        IMAGEM        │   │
│  └─────────────────────┘   │
│  [Categoria]                │
│  Nome do Produto            │
│  Descrição do produto...    │
│                             │
│  Cor:                       │
│  ● ● ○ (swatches)          │
│                             │
│  Tamanho:                   │
│  [P R$50] [M R$55] [G R$60]│
│                             │
│  Quantidade:  [-] 1 [+]    │
│                             │
│  [  Adicionar ao Carrinho  ]│
└─────────────────────────────┘
```

---

### Design Visual

A interface adota o **Material Design 3** via React Native Paper, com as seguintes diretrizes visuais:

**Paleta de Cores:**
- Primária: definida pelo tema do `PaperProvider` (padrão MD3)
- Superfícies: branco e cinza claro para cards
- Destaque: cor da variante selecionada (anel de borda)
- Estados desabilitados: opacidade 0.4, riscado no swatch de cor

**Tipografia:**
- Títulos: `titleLarge` e `titleMedium` do Paper
- Corpo: `bodyMedium`
- Preços: fonte em negrito, tamanho `20sp`
- Tags de categoria: `labelSmall` sobre fundo colorido arredondado

**Ícones:**
- `MaterialCommunityIcons` (via `@expo/vector-icons`) para ações e placeholders
- `image-off` para fallback de imagem de produto

**Layout:**
- Grade de 2 colunas com `gap: 12` entre cards
- Scroll vertical com `FlatList` (suporte a `ListHeaderComponent` e `columnWrapperStyle`)
- `SafeAreaView` em todas as telas para compatibilidade com notch e barra de navegação

---

## Fluxo de Dados

### Fluxo de Leitura (Cliente)

```
Usuário abre o app
    │
    ▼
CatalogScreen.useEffect()
    ├── catalogService.getCategories() ──► GET /catalog/categories
    └── catalogService.getProducts()   ──► GET /catalog/products
            │
            ▼
        useState(products, categories)
            │
            ▼
        Renderiza grade de ProductCards
            │
    Usuário toca num card
            │
            ▼
    router.push('/catalog/product/[id]')
            │
            ▼
    ProductDetailScreen.useEffect()
        ├── catalogService.getProductById(id) ──► GET /catalog/products/{id}
        └── stockService.getBySku(skuId) [paralelo para cada SKU]
                                          ──► GET /stock/{skuId}
            │
            ▼
        useState(product, skuStock)
            │
    Usuário seleciona variante + SKU + quantidade
            │
            ▼
    handleAddToCart() ──► CartContext.addItem(item)
```

### Fluxo de Escrita (Administrador)

```
Admin acessa ProductFormScreen
    │
    ├── [Edição] catalogService.getProductById(id)
    │
    ▼
Preenche formulário (produto + variantes + SKUs)
    │
    ▼
handleSubmit()
    ├── createProduct() ou updateProduct()
    │       └── POST/PUT /catalog/products[/{id}]
    │
    └── Para cada variante:
            ├── [Nova] createVariant()
            │       └── POST /catalog/products/{id}/variants
            │
            └── Para cada SKU:
                    ├── [Novo]     createSku()
                    │            └── POST /catalog/variants/{id}/skus
                    └── [Existente] updateSku()
                                 └── PATCH /catalog/skus/{id}
```

### Modelo de Dados do Catálogo

```
Produto
 ├── id, name, description, urlImg, active
 ├── category: { id, name, description }
 └── variants[]: Variante
          ├── id, color
          └── skus[]: SKU
                   ├── id, size, code
                   └── price

Estoque (serviço separado)
 └── StockItem: { skuId, quantityAvailable, quantityReserved, costPrice }

Carrinho (estado local)
 └── CartItem: { skuId, productId, productName, unitPrice, quantity, size, color }
```

---

## Tecnologias Utilizadas

| Tecnologia | Versão | Papel |
|---|---|---|
| **React Native** | 0.81.5 | Framework base para UI nativa |
| **Expo** | ~54 | Toolchain, build e APIs nativas |
| **Expo Router** | 6.0.23 | Navegação file-based com rotas tipadas |
| **React Native Paper** | 5.15.2 | Componentes Material Design 3 |
| **TypeScript** | ~5.8 | Tipagem estática em todo o projeto |
| **expo-image** | — | Carregamento otimizado de imagens |
| **@expo/vector-icons** | — | Ícones MaterialCommunityIcons |
| **react-native-safe-area-context** | — | Compatibilidade com notch/barra |
| **react-native-gesture-handler** | — | Suporte a gestos nativos |
| **React Context API** | — | Estado global (Auth, Cart) |

**Serviços de Backend consumidos pelo catálogo:**
- `GET/POST/PUT/DELETE /catalog/products` — CRUD de produtos
- `GET/POST/PUT/DELETE /catalog/categories` — CRUD de categorias
- `POST/DELETE /catalog/products/{id}/variants` — Variantes
- `POST/PATCH/DELETE /catalog/variants/{id}/skus` — SKUs
- `GET /stock/{skuId}` — Estoque por SKU

---

## Considerações de Segurança

### Autenticação e Autorização
- Requisições de escrita (criação, edição, exclusão) enviam o token JWT no cabeçalho `Authorization: Bearer <token>` via `httpClient.ts`
- O controle de visibilidade de funcionalidades admin (`user?.role === 'admin'`) é feito no front-end como UX, mas o back-end aplica a validação de autorização real em cada endpoint protegido
- O `AuthContext` fornece o papel do usuário (`admin` | `customer`) para toda a aplicação

### Validação de Dados
- Formulários validam localmente antes de chamar a API: nome obrigatório, preço ≥ 0, variantes sem cor bloqueiam o envio
- Erros retornados pela API são exibidos em banners visuais sem expor detalhes internos ao usuário
- A quantidade máxima adicionável ao carrinho é limitada pelo `quantityAvailable` retornado do serviço de estoque, evitando pedidos acima do disponível

### Gestão de Tokens
- Tokens são armazenados via `tokenStore` (módulo centralizado); não são persistidos em texto claro em `AsyncStorage` sem criptografia
- Requisições com token inválido ou expirado recebem erro 401, que deve ser tratado com logout automático (a implementar)

### Proteção contra Dados Maliciosos
- URLs de imagem relativas são prefixadas com o `IMAGE_BASE_URL` configurado, impedindo que conteúdo externo arbitrário seja carregado
- Erros de carregamento de imagem são capturados e exibem um placeholder seguro em vez de tentar renderizar conteúdo inválido
- Respostas HTML inesperadas (erros de gateway) são detectadas e traduzidas em mensagens de erro amigáveis

---

## Implantação

### Pré-requisitos

- **Node.js** 20+ e **npm** ou **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **EAS CLI** (para build em nuvem): `npm install -g eas-cli`
- Conta no [Expo](https://expo.dev) para builds e atualizações OTA
- Android Studio (emulador Android) ou Xcode (simulador iOS) para testes locais

### Variáveis de Ambiente

Criar o arquivo `src/mobile/.env` com:

```env
EXPO_PUBLIC_API_URL=https://api.seu-dominio.com/api
EXPO_PUBLIC_IMAGE_BASE_URL=https://api.seu-dominio.com/images/products
```

### Execução em Desenvolvimento

```bash
cd src/mobile
npm install
npx expo start
```

Escanear o QR Code com o app **Expo Go** (iOS/Android) ou pressionar `a` (Android) / `i` (iOS) para abrir no emulador.

### Build para Produção

**Build local (APK Android):**
```bash
cd src/mobile
eas build --platform android --profile preview
```

**Build para loja (AAB/IPA):**
```bash
eas build --platform all --profile production
```

**Atualização OTA (sem passar por loja):**
```bash
eas update --branch production --message "Atualização do catálogo"
```

---

## Testes

### Estratégia de Testes

| Tipo | Ferramenta | Escopo |
|---|---|---|
| Unitário | Jest + React Native Testing Library | Lógica de `catalogService`, helpers (`imageResolver`, filtros) |
| Componente | React Native Testing Library | `ProductCard`, `CategoryFormModal`, seletores de variante/SKU |
| Integração | Jest + MSW (Mock Service Worker) | Fluxo completo: tela → service → API mockada |
| End-to-End | Detox | Jornada do usuário: buscar produto → selecionar variante → adicionar ao carrinho |
| Manual | Expo Go + dispositivo físico | Verificação visual, responsividade, fallback de imagem |

### Casos de Teste Prioritários

**Catálogo:**
- [ ] Exibe lista de produtos ao carregar
- [ ] Filtra produtos por texto de busca em tempo real
- [ ] Filtra produtos ao selecionar categoria
- [ ] Exibe skeleton durante carregamento
- [ ] Exibe mensagem de erro e botão de retry em falha de rede
- [ ] Pull-to-refresh recarrega a lista

**Detalhe de Produto:**
- [ ] Exibe preço mínimo quando nenhum SKU está selecionado
- [ ] Atualiza preço ao selecionar SKU específico
- [ ] Desabilita variante quando todos os SKUs têm estoque zero
- [ ] Desabilita SKU com estoque zero
- [ ] Limita quantidade máxima ao estoque disponível
- [ ] Adiciona item ao carrinho com variante, SKU e quantidade corretos
- [ ] Exibe fallback de imagem em erro de carregamento

**Formulário Admin:**
- [ ] Bloqueia envio sem nome de produto
- [ ] Bloqueia envio com preço negativo
- [ ] Bloqueia envio de variante sem cor
- [ ] Cria produto com variantes e SKUs corretamente
- [ ] Atualiza preço de SKU existente sem recriar

---

# Referências

- [Expo Documentation](https://docs.expo.dev/) — Guia oficial do Expo e Expo Router
- [React Native Paper](https://callstack.github.io/react-native-paper/) — Componentes Material Design 3 para React Native
- [React Native Documentation](https://reactnative.dev/docs/getting-started) — Documentação oficial do React Native
- [Expo Router – File-based routing](https://docs.expo.dev/router/introduction/) — Sistema de navegação por arquivos
- [EAS Build](https://docs.expo.dev/build/introduction/) — Build e distribuição com Expo Application Services
- [React Context API](https://react.dev/reference/react/createContext) — Gerenciamento de estado global com Context
- [Material Design 3](https://m3.material.io/) — Sistema de design base da interface
