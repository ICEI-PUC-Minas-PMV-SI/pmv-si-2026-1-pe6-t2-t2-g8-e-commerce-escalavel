# Exemplos de Configurações Alternativas do Workflow
# Este arquivo contém exemplos de como customizar o workflow de rastreamento
# NÃO renomeie este arquivo - ele é apenas para referência
# Para usar, copie a seção desejada para contribution-tracker.yml

# ========================================
# EXEMPLO 1: Execução Diária
# ========================================
# Use este exemplo se quiser relatórios diários em vez de semanais

# on:
#   schedule:
#     # Roda todo dia às 00:00 UTC
#     - cron: '0 0 * * *'
#   workflow_dispatch:
#   push:
#     branches:
#       - main
#     paths:
#       - 'src/**'
#       - 'docs/**'

# ========================================
# EXEMPLO 2: Múltiplas Execuções Semanais
# ========================================
# Use este para ter relatórios às segundas e quintas

# on:
#   schedule:
#     # Roda às segundas e quintas às 00:00 UTC
#     - cron: '0 0 * * 1,4'
#   workflow_dispatch:
#   push:
#     branches:
#       - main
#     paths:
#       - 'src/**'
#       - 'docs/**'

# ========================================
# EXEMPLO 3: Apenas Execução Manual
# ========================================
# Use este se quiser apenas executar manualmente (sem automação)

# on:
#   workflow_dispatch:

# ========================================
# EXEMPLO 4: Apenas em Push (Sem Schedule)
# ========================================
# Gera relatório automaticamente apenas quando há commits novos

# on:
#   workflow_dispatch:
#   push:
#     branches:
#       - main
#     paths:
#       - 'src/**'
#       - 'docs/**'

# ========================================
# EXEMPLO 5: Workflow Completo com Notificação
# ========================================
# Envia notificação por e-mail quando o relatório é gerado
# REQUER: Configurar segredo NOTIFICATION_EMAIL nos settings do repo

# name: Contribution Tracker with Notifications
#
# on:
#   schedule:
#     - cron: '0 0 * * 1'
#   workflow_dispatch:
#   push:
#     branches:
#       - main
#     paths:
#       - 'src/**'
#       - 'docs/**'
#
# permissions:
#   contents: write
#   pull-requests: read
#
# jobs:
#   track-contributions:
#     runs-on: ubuntu-latest
#
#     steps:
#       - name: Checkout repository
#         uses: actions/checkout@v4
#         with:
#           fetch-depth: 0
#
#       - name: Set up Python
#         uses: actions/setup-python@v5
#         with:
#           python-version: '3.11'
#
#       - name: Install dependencies
#         run: |
#           pip install requests PyGithub matplotlib pandas tabulate
#
#       - name: Generate contribution report
#         env:
#           GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
#           REPOSITORY: ${{ github.repository }}
#         run: |
#           python .github/scripts/generate_contribution_report.py
#
#       - name: Commit and push report
#         run: |
#           git config --local user.email "github-actions[bot]@users.noreply.github.com"
#           git config --local user.name "github-actions[bot]"
#           git add docs/CONTRIBUTION_REPORT.md docs/img/contribution-*.png || true
#           git diff --staged --quiet || git commit -m "📊 Atualizar relatório de contribuições [skip ci]"
#           git push || true
#
#       - name: Send notification (opcional)
#         if: success()
#         uses: dawidd6/action-send-mail@v3
#         with:
#           server_address: smtp.gmail.com
#           server_port: 587
#           username: ${{ secrets.NOTIFICATION_EMAIL }}
#           password: ${{ secrets.EMAIL_PASSWORD }}
#           subject: "Relatório de Contribuições Atualizado - ${{ github.repository }}"
#           body: "O relatório de contribuições foi atualizado. Veja em: ${{ github.server_url }}/${{ github.repository }}/blob/main/docs/CONTRIBUTION_REPORT.md"
#           to: ${{ secrets.NOTIFICATION_EMAIL }}
#           from: GitHub Actions

# ========================================
# EXEMPLO 6: Workflow para Múltiplas Branches
# ========================================
# Gera relatórios separados para diferentes branches (ex: dev, staging, main)

# name: Contribution Tracker Multi-Branch
#
# on:
#   schedule:
#     - cron: '0 0 * * 1'
#   workflow_dispatch:
#   push:
#     branches:
#       - main
#       - dev
#       - staging
#     paths:
#       - 'src/**'
#       - 'docs/**'
#
# permissions:
#   contents: write
#
# jobs:
#   track-contributions:
#     runs-on: ubuntu-latest
#
#     steps:
#       - name: Checkout repository
#         uses: actions/checkout@v4
#         with:
#           fetch-depth: 0
#
#       - name: Set up Python
#         uses: actions/setup-python@v5
#         with:
#           python-version: '3.11'
#
#       - name: Install dependencies
#         run: |
#           pip install matplotlib pandas tabulate
#
#       - name: Generate contribution report
#         run: |
#           python .github/scripts/generate_contribution_report.py
#
#       - name: Commit and push report
#         run: |
#           git config --local user.email "github-actions[bot]@users.noreply.github.com"
#           git config --local user.name "github-actions[bot]"
#           git add docs/CONTRIBUTION_REPORT.md docs/img/contribution-*.png || true
#           git diff --staged --quiet || git commit -m "📊 Atualizar relatório de contribuições [${{ github.ref_name }}] [skip ci]"
#           git push || true

# ========================================
# EXEMPLO 7: Workflow com Upload de Artefatos
# ========================================
# Salva relatórios como artefatos do GitHub (sem commit)

# name: Contribution Tracker with Artifacts
#
# on:
#   schedule:
#     - cron: '0 0 * * 1'
#   workflow_dispatch:
#
# permissions:
#   contents: read
#
# jobs:
#   track-contributions:
#     runs-on: ubuntu-latest
#
#     steps:
#       - name: Checkout repository
#         uses: actions/checkout@v4
#         with:
#           fetch-depth: 0
#
#       - name: Set up Python
#         uses: actions/setup-python@v5
#         with:
#           python-version: '3.11'
#
#       - name: Install dependencies
#         run: |
#           pip install matplotlib pandas tabulate
#
#       - name: Generate contribution report
#         run: |
#           python .github/scripts/generate_contribution_report.py
#
#       - name: Upload report as artifact
#         uses: actions/upload-artifact@v4
#         with:
#           name: contribution-report-${{ github.run_number }}
#           path: |
#             docs/CONTRIBUTION_REPORT.md
#             docs/img/contribution-*.png
#           retention-days: 90

# ========================================
# DICAS DE USO
# ========================================
#
# 1. Para usar um exemplo:
#    - Copie a seção desejada
#    - Cole em contribution-tracker.yml (substituindo o conteúdo)
#    - Commit e push
#
# 2. Horários UTC:
#    - 00:00 UTC = 21:00 Brasília (horário de verão)
#    - 00:00 UTC = 22:00 Brasília (horário normal)
#    - Ajuste conforme necessário
#
# 3. Sintaxe Cron:
#    - '0 0 * * 1' = Segundas às 00:00
#    - '0 0 * * *' = Todo dia às 00:00
#    - '0 12 * * 1,4' = Segundas e quintas às 12:00
#    - '0 */6 * * *' = A cada 6 horas
#
# 4. Período de Análise:
#    - Padrão: 24 semanas (1 semestre completo)
#    - Para alterar, edite generate_contribution_report.py linha ~281
#    - Veja documentação em .github/scripts/README.md
#
# 5. Para testar:
#    - Use workflow_dispatch para executar manualmente
#    - Vá em Actions → Contribution Tracker → Run workflow
