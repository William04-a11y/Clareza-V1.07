# Clareza — v1.07

Demonstração front-end completa e navegável da plataforma Clareza, construída **exclusivamente** com HTML5, CSS3 e JavaScript puro — sem frameworks, sem backend, sem banco de dados e sem nenhum motor de templates server-side (Django, Jinja, `{% extends %}`, `{% include %}`, `{% block %}`). Todo o conteúdo é estático ou simulado via JavaScript, com o estado da sessão persistido apenas em `localStorage`.

O projeto funciona **diretamente no navegador**, abrindo `index.html` — não é necessário instalar nada, rodar servidor ou configurar build.

## Como usar

1. Abra `index.html` em qualquer navegador moderno (duplo clique ou "Abrir com").
2. Na landing, escolha **"Sou psicólogo(a)"** ou **"Sou paciente"** para se cadastrar, ou vá direto ao login com as credenciais de demonstração:
   - Psicólogo: `psicologo@clareza.demo` / `123456`
   - Paciente: `paciente@clareza.demo` / `123456`
3. Após entrar, você é redirecionado ao painel do perfil correspondente, com sidebar, header e dados já preenchidos.
4. Navegue livremente pelos itens da sidebar — todas as páginas estão interligadas e funcionais.

> Todos os links usam caminhos **relativos**, então o projeto funciona tanto abrindo o arquivo direto (`file://`) quanto servido por qualquer servidor estático.

## Mapa do site

```
index.html ─────────────────────────────────────────── Landing pública

pages/auth/
├── login.html ───────────────────────── Entrar (e-mail, senha, lembrar-me)
├── cadastro.html ────────────────────── Escolha de perfil (hub)
├── cadastro-psicologo.html ──────────── Cadastro de psicólogo (+ CRP)
├── cadastro-paciente.html ───────────── Cadastro de paciente
└── recuperar-senha.html ─────────────── Recuperação de senha (simulada)

pages/psicologo/                         pages/paciente/
├── dashboard.html                       ├── dashboard.html
├── agenda.html                          ├── agenda.html
├── pacientes.html                       ├── consultas.html
├── prontuarios.html                     ├── meu-psicologo.html
├── financeiro.html                      ├── documentos.html
├── ia.html                              ├── pagamentos.html
├── relatorios.html                      ├── relatorios.html
├── documentos.html                      ├── mensagens.html
└── configuracoes.html                   └── configuracoes.html
```

## Módulos

### Autenticação (`pages/auth/`)

| Página | O que faz |
|---|---|
| `login.html` | E-mail, senha (com mostrar/ocultar), "Lembrar-me", link "Esqueci minha senha", mensagens de erro/sucesso, redireciona para o painel certo conforme o perfil. |
| `cadastro.html` | Tela de escolha entre perfil de psicólogo ou paciente. |
| `cadastro-psicologo.html` | Nome, data de nascimento, CPF, CRP, e-mail, senha, confirmar senha, aceite dos termos. |
| `cadastro-paciente.html` | Nome, data de nascimento, CPF, e-mail, senha, confirmar senha, aceite dos termos. |
| `recuperar-senha.html` | E-mail + botão de solicitação; exibe uma tela de confirmação simulada (sem envio real). |

Validações em `js/auth.js` + `js/utils.js`: campos obrigatórios, formato de e-mail, força/confirmação de senha, CPF com dígito verificador real, formato de CRP, data não-futura e idade mínima. Nenhuma autenticação é real — usuários e sessão ficam em `localStorage` sob o prefixo `clareza:`.

### Área do Psicólogo (`pages/psicologo/`)

| Página | O que faz |
|---|---|
| `dashboard.html` | Cards de métricas (consultas de hoje, próximas, total de pacientes, receita do mês, realizadas, pendentes), gráfico de barras (últimos 7 dias) e de rosca (status do mês), agenda do dia e pacientes recentes. |
| `agenda.html` | Calendário com alternância **Semana / Dia**, navegação entre períodos, modal de detalhes da consulta (confirmar/cancelar/marcar como realizada) e modal de nova consulta. |
| `pacientes.html` | Tabela com nome, e-mail, telefone, última consulta e status — busca, filtro por status e modal de visualização com histórico. |
| `prontuarios.html`, `financeiro.html`, `ia.html`, `relatorios.html`, `documentos.html`, `configuracoes.html` | Páginas de apoio com navegação completa, sinalizadas como em desenvolvimento na próxima versão. |

### Área do Paciente (`pages/paciente/`)

| Página | O que faz |
|---|---|
| `dashboard.html` | Próxima consulta (data, horário, psicólogo, status), histórico de consultas, avisos, documentos recentes e situação financeira. |
| `consultas.html` | Tabs **Próximas / Anteriores / Todas**, filtro por status, busca e modal de detalhes. |
| `agenda.html` | Calendário semanal com as próprias consultas e modal para **solicitar nova consulta** (fica "Pendente" até confirmação). |
| `meu-psicologo.html` | Perfil do profissional responsável: nome, avatar, CRP, especialidade, bio e contato. |
| `documentos.html` | Busca, filtro por tipo/status e modal de visualização (download simulado). |
| `pagamentos.html` | Resumo financeiro (pago/pendente/atrasado), listagem filtrável e modal de comprovante. |
| `relatorios.html` | Gráficos de frequência (6 meses) e distribuição por status. |
| `mensagens.html` | Chat simulado com indicador de "digitando..." e resposta automática. |
| `configuracoes.html` | Placeholder de configurações da conta. |

As sidebars dos dois perfis usam os mesmos componentes visuais, mas com itens e agrupamento diferentes — reforçando que são experiências distintas dentro da mesma identidade visual.

## Navegação e estados visuais

- **Página ativa:** a sidebar recebe a chave da página atual (`data-active` no `<body>`) e aplica a classe `.is-active` ao item correspondente.
- **Menus e dropdowns:** notificações e menu do usuário no header, controlados por `js/dropdown.js` (delegação de eventos, fecha ao clicar fora ou pressionar Esc).
- **Modais:** abertura/fechamento, clique fora, tecla Esc e retenção de foco via `js/modal.js`; usados em detalhes de consulta, nova consulta/solicitação, visualização de paciente/documento/pagamento.
- **Alertas:** componente reutilizável (`components/alert.js`) para mensagens de sucesso, erro, aviso e informação, usado em formulários e páginas internas.
- **Notificações:** dropdown no header com conteúdo diferente para psicólogo e paciente, contagem de não lidas dinâmica.
- **Sidebar mobile:** vira um painel deslizante com overlay, acionado pelo botão de menu no header.

## Dados simulados

Não há backend nem banco de dados. Os dados vivem em dois módulos JS que geram e persistem informações fictícias em `localStorage`:

- **`js/mock-data.js`** — pacientes e consultas do psicólogo (chaves `patients`, `appointments`).
- **`js/mock-data-paciente.js`** — consultas, documentos, pagamentos, avisos e o psicólogo responsável do paciente (chaves `paciente_consultas`, `paciente_documentos`, `paciente_pagamentos`, `paciente_avisos`).

Ambos seguem o mesmo padrão: `seedAll()` popula os dados na primeira visita (idempotente), e funções `get*`/`add*`/`update*` leem e escrevem no `localStorage`. Ações como "Nova consulta", "Solicitar consulta" ou mudança de status ficam consistentes entre as páginas que compartilham os mesmos dados.

**Preparado para um backend futuro:** cada módulo de dados expõe uma API própria (`getConsultas()`, `addConsulta()`, `updateAppointment()` etc.) independente de como os dados são armazenados. Para plugar um backend real no futuro, basta trocar a implementação interna dessas funções (de `localStorage` para chamadas `fetch`/API), sem alterar nenhuma página ou componente que os consome.

## Arquitetura

```
Clareza V1.07/
├── index.html                  # Landing pública
├── pages/
│   ├── auth/                   # Login, cadastros, recuperação de senha
│   ├── psicologo/              # 9 páginas da área do psicólogo
│   └── paciente/               # 9 páginas da área do paciente
│
├── components/                 # "Componentes" em JS puro — cada um exporta
│   ├── navbar.js                # uma função que retorna HTML, injetada via
│   ├── sidebar.js                # innerHTML/outerHTML. Evita fetch de partials,
│   ├── footer.js                  # que falharia por CORS ao abrir via file://.
│   ├── card.js
│   ├── alert.js
│   └── modal.js
│
├── css/
│   ├── variables.css           # Design tokens: cor, tipografia, espaçamento,
│   │                           # bordas, sombras, transições, z-index
│   ├── reset.css               # Reset enxuto entre navegadores
│   ├── base.css                # Tipografia e estilos globais
│   ├── layout.css              # navbar, sidebar, footer, app-shell, grids
│   ├── components.css          # botões, inputs, cards, modais, alertas,
│   │                           # dropdowns, tabelas, chat, calendário...
│   └── responsive.css          # media queries (desktop → tablet → mobile)
│
├── js/
│   ├── main.js                 # Bootstrap: roda em toda página
│   ├── navigation.js           # Injeta navbar/sidebar/footer, sidebar mobile
│   ├── auth.js                 # Login/cadastro/recuperação (mock)
│   ├── modal.js                # Abrir/fechar modal, foco, Esc
│   ├── dropdown.js             # Notificações e menu do usuário
│   ├── utils.js                # Seletores, storage, validação, máscaras
│   ├── charts.js                # Gráficos em <canvas> (barra/linha/rosca)
│   ├── mock-data.js             # Dados simulados — psicólogo
│   ├── mock-data-paciente.js    # Dados simulados — paciente
│   └── *-psicologo.js / *-paciente.js  # Lógica específica de cada página
│
└── assets/
    ├── images/
    ├── icons/
    └── fonts/
```

### Como uma página se monta

Cada página define no `<body>`:

```html
<body data-layout="app" data-role="psicologo" data-active="dashboard"
      data-page-title="Dashboard" data-base="../../">
```

- `data-layout`: `"public"` (landing/auth) ou `"app"` (área logada).
- `data-role`: `"psicologo"` ou `"paciente"` — define qual sidebar renderizar.
- `data-active`: chave do item ativo na sidebar (ex.: `"dashboard"`, `"agenda"`).
- `data-base`: caminho relativo até a raiz do projeto (`""` na raiz, `"../../"` duas pastas abaixo) — necessário porque o projeto roda via `file://` e não pode usar caminhos absolutos `/`.

`js/navigation.js` lê esses atributos e injeta a navbar/sidebar/footer certos nos placeholders (`#navbarSlot`, `#sidebarSlot`, `#footerSlot`). Cada página então inclui um script próprio (ex.: `dashboard-psicologo.js`) que roda no evento `clareza:ready`, disparado por `main.js` após o bootstrap.

## Design

- **Tipografia:** Fraunces (display) + Inter (corpo) + IBM Plex Mono (dados/labels), via Google Fonts — idêntica em todas as 24 páginas.
- **Paleta:** teal profundo (`--color-primary-*`) para confiança clínica, sálvia (`--color-accent-*`) para calma/progresso e dourado opaco (`--color-gold-*`) para acolhimento, sobre fundo neutro esverdeado claro.
- **Elemento-assinatura:** círculos concêntricos ("ondas que se assentam"), usados na marca e na ilustração da landing — remetem à clareza mental.
- **Componentes únicos:** todos os módulos reutilizam os mesmos botões, cards, inputs, badges, tabelas, modais, alertas e espaçamentos definidos em `css/variables.css` e `css/components.css` — nenhuma cor ou medida é redefinida localmente por página.

## Responsividade

`css/responsive.css` cobre três faixas (desktop → ≤1024px → ≤900px → ≤640px):

- Grids de cards colapsam de 3–4 colunas para 1–2 conforme a largura.
- A sidebar vira um painel deslizante com overlay no tablet/mobile.
- Tabelas ganham rolagem horizontal em vez de espremer colunas.
- O calendário semanal (Agenda) rola horizontalmente em telas estreitas.
- O painel de chat (Mensagens) ajusta a altura em telas pequenas.

## Não incluído nesta versão

- Backend, banco de dados, autenticação real.
- Django, Django Templates, Jinja ou qualquer engine de template server-side.
- Frameworks front-end (React, Vue, Angular etc.) e bibliotecas de gráficos externas — os gráficos são desenhados em `<canvas>` com JavaScript puro.
