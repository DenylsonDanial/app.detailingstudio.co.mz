# app.detailingstudio.co.mz

Frontend do sistema de gestao do Detailing Studio. React 18 + TypeScript + Vite 4,
MUI v5 (Minimals Kit) e Redux Toolkit Query, sobre o shell da Everlee Grace
(autenticacao com refresh, utilizadores, perfis, permissoes, empresas).

Especificacao funcional: `../Detailing_Studio_Especificacao_Developer.docx`.
API: `../api.detailingstudio.co.mz`.

## Arrancar em local

```bash
cp .env.example .env          # VITE_HOST_API=http://localhost:8090/
npm install
npm run dev                   # http://localhost:8095
```

Portas escolhidas para correr ao lado da Everlee Grace: frontend **8095**,
API **8090** (Everlee: 8088/8085 e 8080).

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento em http://localhost:8095 |
| `npm run build` | Typecheck + build de producao em `dist/` |
| `npm run typecheck` | So o TypeScript |
| `npm run lint` | ESLint |

## Producao (Coolify)

`Dockerfile` multi-stage (Node 20 -> nginx). `VITE_HOST_API` entra como build arg
(`https://api.detailingstudio.co.mz/`). Dominio: `https://app.detailingstudio.co.mz`.
Sem a variavel, `src/config-global.ts` escolhe a API pelo hostname.

## Marca

Cores e logotipo tirados do site detailingstudio.co.mz: magenta `#E6028A`
(cabecalho `#CA0278`), preto `#000000`, grafite `#191717`, cartoes `#F5F5F5`.
Titulos e botoes em Montserrat, texto em Inter. Logotipo em `public/logo/`,
favicons "DS" em `public/favicon/`.

## Estrutura

```
src/
├── auth/         JWT em memoria + refresh rotativo, guards
├── layouts/      dashboard, navegacao (config-navigation.tsx)
├── pages/        uma pasta por modulo (users, roles, permissions, company, settings)
├── sections/     componentes de cada modulo
├── redux/        um createApi por recurso
├── routes/       paths.ts + rotas por seccao
├── theme/        paleta Detailing Studio, tipografia e overrides do MUI
└── utils/        authorities.ts (espelho do seed RBAC da API), axios, formatos
```
