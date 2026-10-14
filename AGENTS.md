# AGENTS.md — app.detailingstudio.co.mz

Regras para agentes de codigo a trabalhar neste projecto. A especificacao
funcional esta em `../Detailing_Studio_Especificacao_Developer.docx`. Este frontend
reaproveita o shell da Everlee Grace; as regras abaixo sao as mesmas.

## Antes de comecar

- Le `src/routes/paths.ts`, `src/utils/authorities.ts` e
  `src/layouts/dashboard/config-navigation.tsx`. Sao as tres fontes de verdade
  de rotas, permissoes e navegacao.
- Copia o padrao do modulo de utilizadores (`pages/users/` + `sections/user/`)
  em vez de inventar uma estrutura nova.

## Obrigatorio

- **TypeScript sem `any`** em codigo novo. Se um tipo da API nao existir,
  cria-o em `src/types/`.
- **URLs so via `paths`**. Nunca escrevas uma string de rota a mao no JSX.
- **Permissoes so via `Authorities`**. Nunca escrevas `'create:entries'`
  literal. O enum tem de continuar igual ao seed do backend em
  `../api.detailingstudio.co.mz/src/main/resources/db/migration/master/V2__seed_rbac.sql`.
- **Dados da API so via RTK Query**. Um `createApi` por recurso, registado em
  `rootReducer.ts` e no middleware do `store.ts`.
- **Cores so via tokens do tema**. Nada de hex nos componentes.
- **Textos de interface em portugues de Portugal** (o produto e para Mocambique:
  "actualizar", "seleccionar", "accao").
- Corre `npm run typecheck` e `npm run lint` antes de dar a tarefa por concluida.

## Proibido

- Guardar o access token em `localStorage` ou `sessionStorage`. Fica em memoria,
  em `src/auth/context/jwt/utils.ts`.
- Reintroduzir dependencias removidas do template (mapas, fullcalendar,
  carrossel, lightbox, react-quill, swr, redux-persist) sem uma necessidade real
  e explicita do modulo em causa.
- Por logica de negocio em `src/pages/` ou em `src/components/`.
- Usar `Content-Type: multipart/form-data` nos services: o backend le
  `@RequestBody` JSON.
- Confiar em esconder um botao como se fosse seguranca. Toda a restricao tem de
  existir tambem no backend com `@PreAuthorize`.
- Criar ficheiros de documentacao novos sem que tenham sido pedidos.

## Estilo

- Segue o ESLint/Prettier do projecto; nao acrescentes regras.
- Comentarios so quando explicam uma decisao que o codigo nao mostra. Nao
  descrevas o que a linha seguinte faz.
- Componentes em PascalCase, hooks em `use*`, ficheiros de seccao em PascalCase,
  ficheiros de pagina em minusculas.
