# <samp>🏆 Passe App</samp>

<samp>Mercado de jogadores de uma liga de futebol.</samp>

<samp>A aplicação permite cadastrar e consultar jogadores, criar clubes, comprar e vender jogadores, acompanhar transações, montar escalações, jogar partidas e consultar a classificação da liga.</samp> 


<samp>🎨 Veja o layout no [***Figma***](https://www.figma.com/design/oevjrS0eaqL3VHSvKYB8GS/Passe).</samp>

## <samp>CORE STACK</samp>

| Backend | Frontend | Banco de dados |
| :------------: | :---: | :------: |
| <samp>NestJS 12</samp> | <samp>Next.js 15</samp> | <samp>PostgreSQL 16</samp> |
| <samp>Prisma 7</samp> | <samp>React 19</samp> | <samp>Docker Compose v2</samp> |
| <samp>TypeScript 6</samp> | <samp>TypeScript 5.7</samp> | <samp>Migrations versionadas</samp> |

### <kbd></kbd> <samp>Pré-requisitos e versões</samp>

| Ferramenta | Versão utilizada |
|------------|------------------|
| <samp>**Node.js**</samp> | <samp>22 LTS ou compatível com os `engines` locais</samp> |
| <samp>**npm**</samp> | <samp>Incluído no Node.js</samp> |
| <samp>**PostgreSQL**</samp> | <samp>16, executado pela imagem `postgres:16-alpine`</samp> |
| <samp>**Docker**</samp> | <samp>Com Docker Compose v2</samp> |
| <samp>**TypeScript**</samp> | <samp>6 no backend e 5.7 no frontend</samp> |

<samp>O backend usa NestJS 12 e Prisma 7. O frontend usa Next.js 15, React 19 e Tailwind CSS 3.</samp>

---

## <samp>PROJECT STRUCTURE</samp>

- <samp>**Backend (NestJS)** → API REST com módulos por domínio; única responsável pelas regras de negócio</samp>
- <samp>**Frontend (Next.js)** → Camada de apresentação e proxy para a API, sem regras de negócio</samp>
- <samp>**Feature-driven architecture** → Cada domínio reúne HTTP, schemas, tipos, hooks e componentes</samp>
- <samp>**Separation of concerns** → Rotas, serviços HTTP isolados e UI compartilhada separada</samp>

### <kbd></kbd> <samp>Proxy</samp>
<samp>O frontend usa um rewrite do Next.js para encaminhar as requisições relativas `/api/*` ao backend, definido em `BACKEND_ORIGIN`.</samp>

| Route | Method | Description |
|-------|--------|-------------|
| <samp>`/api/*`</samp> | <samp>GET, POST, PUT, PATCH, DELETE</samp> | <samp>Rewrite para o backend (`/api/v1`)</samp> |

```text
.
├── backend/
│   ├── prisma/
│   │   ├── migrations/       # migrations versionadas
│   │   ├── schema.prisma     # modelo PostgreSQL
│   │   └── seed.ts           # carga opcional de dados de exemplo
│   └── src/
│       ├── database/         # conexão Prisma
│       ├── modules/          # players, clubs, market e matches
│       └── shared/           # validação, datas, cálculos e exceções
├── frontend/
│   ├── e2e/                  # testes end-to-end Playwright
│   └── src/
│       ├── app/              # rotas e layouts (finos)
│       ├── features/         # funcionalidades por domínio
│       ├── components/       # ui (shadcn) e shared
│       └── lib/              # cliente Axios, formatadores e datas
└── README.md
```

### <kbd></kbd> <samp>Example: Players Module Structure</samp>

```text
frontend/src/
├── app/players/
│   ├── new/page.tsx          # Create player page
│   └── [id]/                 # Player detail and edit pages
└── features/players/
    ├── api.ts                # Chamadas Axios (somente HTTP)
    ├── schemas.ts            # Schemas Yup
    ├── types.ts              # Tipos dos contratos da API
    ├── hooks.ts              # Hooks do módulo
    └── components/           # PlayerForm, PlayersTable, ConditionDialog
```

> <samp>Note: As demais features seguem o mesmo padrão: `clubs`, `transactions`, `lineups` e `matches`.</samp>

---

## <samp>RUN PROJECT</samp>

### <kbd></kbd> <samp>Criar e recriar o banco de dados</samp>

<samp>Os comandos desta seção devem ser executados dentro de `backend/`.</samp>

**<samp>Criar o banco e aplicar migrations</samp>**

```bash
cd backend
cp .env.example .env
docker compose up -d db
npm ci
npx prisma migrate deploy
```

<samp>O banco PostgreSQL fica disponível em `localhost:5432`. As migrations criam as tabelas da aplicação.</samp>

**<samp>Carregar dados de exemplo (opcional)</samp>**

```bash
cd backend
npm run seed
```

<samp>O seed cria três clubes e jogadores livres. Ele é idempotente para clubes e não recria jogadores quando já existem jogadores cadastrados.</samp>

**<samp>Recriar o banco usando as migrations</samp>**

<samp>O comando abaixo é destrutivo: apaga os dados e aplica novamente todas as migrations.</samp>

```bash
cd backend
docker compose up -d db
npx prisma migrate reset --force
```

<samp>Para remover também o volume Docker e recriar o PostgreSQL do zero:</samp>

```bash
cd backend
docker compose down -v
docker compose up -d db
npx prisma migrate deploy
```

### <kbd></kbd> <samp>1. Backend/API</samp>

```bash
cd backend
cp .env.example .env
docker compose up -d db
npm ci
npx prisma migrate deploy
npm run start:dev
```

| Recurso | URL |
|---------|-----|
| <samp>**API**</samp> | <samp>http://localhost:3000</samp> |
| <samp>**Endpoints**</samp> | <samp>http://localhost:3000/api/v1</samp> |
| <samp>**Swagger/OpenAPI**</samp> | <samp>http://localhost:3000/docs</samp> |

<samp>Para executar a versão compilada:</samp>

```bash
cd backend
npm run build
npm run start:prod
```

### <kbd></kbd> <samp>2. Frontend</samp>

<samp>Em outro terminal:</samp>

```bash
cd frontend
cp .env.example .env.local
npm ci
npm run dev
```

<samp>Abra [http://localhost:3001](http://localhost:3001) no navegador para ver a aplicação.</samp>

<samp>Em produção, o frontend pode ser compilado e iniciado com:</samp>

```bash
cd frontend
npm run build
npm run start
```

---

## <samp>ENVIRONMENT VARIABLES</samp>

<samp>Os arquivos `.env.example` estão versionados em [`backend/.env.example`](backend/.env.example) e [`frontend/.env.example`](frontend/.env.example).</samp>

<samp>Os lockfiles também devem permanecer versionados: [`backend/package-lock.json`](backend/package-lock.json) e [`frontend/package-lock.json`](frontend/package-lock.json).</samp>

### <kbd></kbd> <samp>Backend</samp>

| Variável | Uso | Valor do exemplo |
|----------|-----|------------------|
| <samp>`POSTGRES_USER`</samp> | <samp>Usuário criado no container PostgreSQL</samp> | <samp>`postgres`</samp> |
| <samp>`POSTGRES_PASSWORD`</samp> | <samp>Senha do PostgreSQL</samp> | <samp>`postgres`</samp> |
| <samp>`POSTGRES_DB`</samp> | <samp>Nome do banco criado no container</samp> | <samp>`passe`</samp> |
| <samp>`DATABASE_URL`</samp> | <samp>URL usada pelo Prisma para conectar ao PostgreSQL</samp> | <samp>`postgresql://postgres:postgres@localhost:5432/passe`</samp> |
| <samp>`PORT`</samp> | <samp>Porta HTTP da API</samp> | <samp>`3000`</samp> |
| <samp>`CORS_ORIGIN`</samp> | <samp>Origem permitida para chamadas do frontend</samp> | <samp>`http://localhost:3001`</samp> |

<samp>O valor de `DATABASE_URL` no arquivo de exemplo deve ser completado com as credenciais locais, por exemplo:</samp>

```dotenv
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/passe
```


### <kbd></kbd> <samp>Frontend</samp>

| Variável | Uso | Valor do exemplo |
|----------|-----|------------------|
| <samp>`BACKEND_ORIGIN`</samp> | <samp>Origem para a qual o rewrite `/api/*` do Next.js encaminha as requisições</samp> | <samp>`http://localhost:3000`</samp> |

<samp>Se `BACKEND_ORIGIN` não for definida, o frontend usa `http://localhost:3000` como padrão.</samp>

---

## <samp>LIBRARIES</samp>

<samp>As versões exatas estão nos respectivos `package.json` e lockfiles.</samp>

### <kbd></kbd> <samp>Backend — Runtime</samp>

| Biblioteca | Motivo |
|------------|--------|
| <samp>`@nestjs/common`</samp> | <samp>Controllers, decorators, pipes e recursos fundamentais do NestJS</samp> |
| <samp>`@nestjs/config`</samp> | <samp>Integração de configuração e variáveis de ambiente</samp> |
| <samp>`@nestjs/core`</samp> | <samp>Bootstrap e ciclo de vida da aplicação NestJS</samp> |
| <samp>`@nestjs/platform-express`</samp> | <samp>Adaptador HTTP baseado em Express</samp> |
| <samp>`@nestjs/swagger`</samp> | <samp>Documentação interativa OpenAPI/Swagger</samp> |
| <samp>`@prisma/adapter-pg`</samp> | <samp>Adaptador PostgreSQL para o Prisma</samp> |
| <samp>`@prisma/client`</samp> | <samp>Cliente tipado para acesso ao banco</samp> |
| <samp>`class-transformer`</samp> | <samp>Transformação e normalização de dados dos DTOs</samp> |
| <samp>`class-validator`</samp> | <samp>Validação declarativa dos DTOs</samp> |
| <samp>`reflect-metadata`</samp> | <samp>Metadados exigidos pelos decorators do NestJS</samp> |
| <samp>`rxjs`</samp> | <samp>Abstrações reativas usadas pelo ecossistema NestJS</samp> |

### <kbd></kbd> <samp>Backend — Developer Experience</samp>

| Biblioteca | Motivo |
|------------|--------|
| <samp>`@nestjs/cli`</samp> | <samp>Build, execução e comandos de desenvolvimento do NestJS</samp> |
| <samp>`@nestjs/schematics`</samp> | <samp>Schematics para geração de código NestJS</samp> |
| <samp>`@nestjs/testing`</samp> | <samp>Utilitários de teste do NestJS</samp> |
| <samp>`@types/express`</samp> | <samp>Tipos TypeScript do Express</samp> |
| <samp>`@types/node`</samp> | <samp>Tipos das APIs do Node.js</samp> |
| <samp>`@types/supertest`</samp> | <samp>Tipos do Supertest</samp> |
| <samp>`@vitest/coverage-v8`</samp> | <samp>Coleta de cobertura dos testes Vitest</samp> |
| <samp>`dotenv`</samp> | <samp>Carregamento de variáveis `.env` no seed e ferramentas locais</samp> |
| <samp>`husky`</samp> | <samp>Hooks de Git do projeto</samp> |
| <samp>`oxlint`</samp> | <samp>Lint do código TypeScript</samp> |
| <samp>`prettier`</samp> | <samp>Formatação do código</samp> |
| <samp>`prisma`</samp> | <samp>CLI, migrations, validação e geração do Prisma</samp> |
| <samp>`source-map-support`</samp> | <samp>Mapeamento de stack traces para TypeScript</samp> |
| <samp>`supertest`</samp> | <samp>Testes HTTP de integração</samp> |
| <samp>`tsx`</samp> | <samp>Execução do seed TypeScript</samp> |
| <samp>`typescript`</samp> | <samp>Compilação e checagem estática</samp> |
| <samp>`vite-tsconfig-paths`</samp> | <samp>Resolução dos aliases do `tsconfig` nos testes</samp> |
| <samp>`vitest`</samp> | <samp>Testes unitários e de integração</samp> |

### <kbd></kbd> <samp>Frontend — Runtime</samp>

| Biblioteca | Motivo |
|------------|--------|
| <samp>`@hookform/resolvers`</samp> | <samp>Integração do React Hook Form com Yup</samp> |
| <samp>`@radix-ui/react-dialog`</samp> | <samp>Primitivas acessíveis para modais</samp> |
| <samp>`@radix-ui/react-dropdown-menu`</samp> | <samp>Primitivas para menus de ações</samp> |
| <samp>`@radix-ui/react-label`</samp> | <samp>Labels acessíveis</samp> |
| <samp>`@radix-ui/react-popover`</samp> | <samp>Primitivas de popover</samp> |
| <samp>`@radix-ui/react-select`</samp> | <samp>Select acessível</samp> |
| <samp>`@radix-ui/react-slot`</samp> | <samp>Composição de componentes via `asChild`</samp> |
| <samp>`@radix-ui/react-tabs`</samp> | <samp>Abas acessíveis</samp> |
| <samp>`axios`</samp> | <samp>Cliente HTTP para a API</samp> |
| <samp>`class-variance-authority`</samp> | <samp>Variantes tipadas de componentes</samp> |
| <samp>`clsx`</samp> | <samp>Composição condicional de classes CSS</samp> |
| <samp>`geist`</samp> | <samp>Fonte usada pela interface</samp> |
| <samp>`lucide-react`</samp> | <samp>Ícones da aplicação</samp> |
| <samp>`next`</samp> | <samp>Framework React, rotas, servidor e rewrites</samp> |
| <samp>`react`</samp> | <samp>Biblioteca de componentes</samp> |
| <samp>`react-dom`</samp> | <samp>Renderização React no navegador</samp> |
| <samp>`react-hook-form`</samp> | <samp>Estado e submissão dos formulários</samp> |
| <samp>`sonner`</samp> | <samp>Notificações de sucesso e erro</samp> |
| <samp>`tailwind-merge`</samp> | <samp>Mesclagem segura de classes Tailwind</samp> |
| <samp>`tailwindcss-animate`</samp> | <samp>Animações usadas pelos componentes</samp> |
| <samp>`yup`</samp> | <samp>Schemas e validação dos formulários</samp> |

### <kbd></kbd> <samp>Frontend — Developer Experience</samp>

| Biblioteca | Motivo |
|------------|--------|
| <samp>`@playwright/test`</samp> | <samp>Testes end-to-end</samp> |
| <samp>`@types/node`</samp> | <samp>Tipos das APIs do Node.js</samp> |
| <samp>`@types/react`</samp> | <samp>Tipos TypeScript do React</samp> |
| <samp>`@types/react-dom`</samp> | <samp>Tipos TypeScript do React DOM</samp> |
| <samp>`autoprefixer`</samp> | <samp>Compatibilidade de CSS entre navegadores</samp> |
| <samp>`eslint`</samp> | <samp>Lint JavaScript/TypeScript</samp> |
| <samp>`eslint-config-next`</samp> | <samp>Regras ESLint recomendadas pelo Next.js</samp> |
| <samp>`postcss`</samp> | <samp>Processamento do CSS</samp> |
| <samp>`prettier`</samp> | <samp>Formatação do código</samp> |
| <samp>`prettier-plugin-tailwindcss`</samp> | <samp>Ordenação das classes Tailwind</samp> |
| <samp>`tailwindcss`</samp> | <samp>Estilização utilitária</samp> |
| <samp>`typescript`</samp> | <samp>Checagem estática</samp> |

---

## <samp>DECISIONS & ASSUMPTIONS</samp>

- <samp>O backend é a fonte de verdade para cálculos de valor, overall, mercado, contratos, partidas e classificação.</samp>
- <samp>A API usa o prefixo `/api/v1`.</samp>
- <samp>O frontend roda na porta `3001` para não conflitar com a API na porta `3000`.</samp>
- <samp>O frontend usa Next.js App Router e encaminha chamadas relativas `/api/*` para `BACKEND_ORIGIN`.</samp>
- <samp>Datas e horas de negócio são tratadas no horário de Brasília (`-03:00`).</samp>
- <samp>Valores monetários são calculados e arredondados no backend e enviados como números JSON.</samp>
- <samp>Clubes começam com caixa de 300,00 e sem jogadores.</samp>
- <samp>Jogadores são atribuídos a clubes por compra, respeitando caixa, limite de elenco e contratos.</samp>
- <samp>Partidas exigem dois clubes diferentes com escalações completas de cinco titulares.</samp>
- <samp>O estado vazio do mercado oferece navegação para o cadastro/consulta de jogadores.</samp>
- <samp>O banco é PostgreSQL executado localmente por Docker Compose; não há serviço externo obrigatório.</samp>

## <samp>NOT IMPLEMENTED</samp>

<samp>Autenticação, autorização e deploy em ambiente cloud não fazem parte do escopo.</samp>

---

## <samp>SCRIPTS & TESTING</samp>

### <kbd></kbd> <samp>Backend</samp>

```bash
cd backend
npm test
npm run lint
npm run format:check

npx prettier --check .
```

### <kbd></kbd> <samp>Frontend</samp>

```bash
cd frontend
npm test
npm run lint
npm run format:check

npx prettier --check .
```

| Command | Description |
|---------|-------------|
| <samp>`npm test`</samp> | <samp>Executa os testes (Vitest no backend, Playwright headless no frontend)</samp> |
| <samp>`npm run lint`</samp> | <samp>Executa a análise estática</samp> |
| <samp>`npm run format:check`</samp> | <samp>Verifica a formatação sem modificar arquivos</samp> |
| <samp>`npm run format`</samp> | <samp>Aplica a formatação com Prettier</samp> |

---

## <samp>AI USAGE</samp>

<samp>Foram utilizadas as seguintes ferramentas de inteligência artificial:</samp>

- <samp>**NotebookLM:** concentrou as instruções e requisitos do desafio. Foi usado como consulta durante a implementação para orientar as decisões e evitar desvios do escopo e das regras solicitadas.</samp>
- <samp>**Planejamento de tarefas:** auxiliou na organização do cronograma de desenvolvimento e na definição de commits descritivos.</samp>
- <samp>**Documentação assistida por IA:** apoiou a modelagem do banco de dados e o design da API.</samp>
- <samp>**GitHub Copilot no VS Code:** foi usado durante a implementação para explorar o código, sugerir alterações, revisar componentes, investigar erros e validar os fluxos do frontend e do backend. </samp>


<samp>As sugestões aceitas foram revisadas no código-fonte e confrontadas com os requisitos do desafio, as regras de negócio e os padrões do projeto. As decisões finais de implementação, modelagem e documentação foram tomadas manualmente. Orientações que não correspondiam ao comportamento necessário ou ao código existente foram descartadas ou ajustadas antes de serem aplicadas.</samp>