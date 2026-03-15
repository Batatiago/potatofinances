# Guia prático: adicionando banco de dados com Node.js (receitas, despesas e investimentos por usuário)

Este guia foi escrito para o seu cenário de **projeto de estudo**. A ideia é evoluir seu dashboard atual (hoje em `localStorage`) para um backend simples com **Node.js + Express + SQLite**.

---

## 1) Análise rápida do projeto atual

Hoje, sua aplicação é front-end puro (`index.html`, `style.css`, `script.js`) e salva tudo no navegador com `localStorage`.

### O que isso significa na prática
- ✅ Fácil de começar.
- ❌ Dados não ficam centralizados (cada navegador/dispositivo tem seu próprio armazenamento).
- ❌ Não existe usuário real no servidor.
- ❌ Não escala para login, API e sincronização entre dispositivos.

---

## 2) Roadmap (visão geral)

### Fase 1 — Preparar backend Node.js
1. Criar pasta `backend/`.
2. Inicializar projeto Node com `npm init -y`.
3. Instalar dependências: `express`, `sqlite3`, `sqlite`, `cors`, `dotenv`, `bcryptjs`, `jsonwebtoken`.
4. Criar estrutura de pastas (`src/`, `routes/`, `controllers/`, `middlewares/`, `database/`).

### Fase 2 — Modelar banco de dados (SQLite)
1. Criar banco `database.sqlite`.
2. Criar tabela `users`.
3. Criar tabela `transactions` com relação ao usuário (`user_id`).
4. Adicionar índice por usuário e data para facilitar filtros.

### Fase 3 — Criar autenticação
1. Endpoint de cadastro (`POST /auth/register`).
2. Endpoint de login (`POST /auth/login`).
3. Middleware para validar token JWT.

### Fase 4 — Criar CRUD de transações
1. Criar transação (`POST /transactions`).
2. Listar transações do usuário (`GET /transactions`).
3. Atualizar (`PUT /transactions/:id`).
4. Remover (`DELETE /transactions/:id`).

### Fase 5 — Integrar frontend
1. Substituir uso de `localStorage` por chamadas `fetch`.
2. Salvar token no navegador (apenas para estudo).
3. Carregar transações via API.
4. Manter os cálculos atuais (saldo, receitas, despesas, investimentos) no front.

### Fase 6 — Melhorias futuras
- Hash de senha mais robusto e refresh token.
- Paginação e filtros avançados.
- Deploy com PostgreSQL.

---

## 3) Passo a passo detalhado (o que fazer e como fazer)

> Execute tudo na raiz do projeto (`/workspace/potatofinances`).

### Passo 1 — Criar backend e instalar dependências

```bash
mkdir backend
cd backend
npm init -y
npm install express sqlite3 sqlite cors dotenv bcryptjs jsonwebtoken
npm install -D nodemon
```

Depois, ajuste seu `package.json` com scripts:

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
}
```

#### O que cada pacote faz
- `express`: cria a API HTTP.
- `sqlite3`: driver para acessar o SQLite.
- `sqlite`: wrapper com `async/await` em cima do `sqlite3`.
- `cors`: permite o front chamar a API (origens diferentes).
- `dotenv`: lê variáveis do arquivo `.env`.
- `bcryptjs`: criptografa/hash de senha.
- `jsonwebtoken`: gera e valida token JWT.
- `nodemon`: reinicia servidor automaticamente durante desenvolvimento.

#### Para iniciantes (o que está acontecendo neste passo)
- `npm init -y` cria o `package.json`, que é o arquivo de configuração do projeto Node.
- `npm install ...` adiciona dependências de produção na pasta `node_modules` e registra no `package.json`.
- `npm install -D nodemon` instala dependência de desenvolvimento (`devDependency`), usada só no ambiente de dev.
- Os scripts `dev` e `start` são atalhos para subir sua API sem digitar comandos longos.

---

### Passo 2 — Criar estrutura de pastas

```bash
mkdir -p src/{controllers,routes,middlewares,database}
```

Estrutura final sugerida:

```txt
backend/
  src/
    controllers/
      authController.js
      transactionController.js
    routes/
      authRoutes.js
      transactionRoutes.js
    middlewares/
      authMiddleware.js
    database/
      db.js
      init.js
    app.js
    server.js
  .env
  package.json
```

#### Para iniciantes (por que separar em pastas)
- `controllers`: regras de negócio (o que fazer quando uma rota é chamada).
- `routes`: define os endpoints (`GET`, `POST`, etc.) e conecta aos controllers.
- `middlewares`: funções que executam no meio da requisição (ex.: autenticação).
- `database`: conexão e inicialização de tabelas.
- Essa separação deixa o projeto mais fácil de manter e estudar.

---

### Passo 3 — Configurar variáveis de ambiente

Crie `backend/.env`:

```env
PORT=3001
JWT_SECRET=troque_esse_valor_no_futuro
```

#### Explicação
- `PORT`: porta onde a API roda.
- `JWT_SECRET`: “senha mestra” para assinar o token JWT.

#### Para iniciantes (boas práticas)
- Nunca commitar `.env` em repositório público.
- Em produção, o `JWT_SECRET` deve ser longo, aleatório e diferente por ambiente.
- Se `JWT_SECRET` mudar, tokens antigos deixam de funcionar (isso é esperado).

---

### Passo 4 — Conexão com banco (`src/database/db.js`)

```js
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function getDb() {
  const db = await open({
    filename: "./src/database/database.sqlite",
    driver: sqlite3.Database,
  });

  return db;
}
```

#### Explicando cada import/função/variável
- `import sqlite3 from "sqlite3";`
  - Importa o driver SQLite de baixo nível.
- `import { open } from "sqlite";`
  - Importa a função utilitária que abre conexão com suporte a `async/await`.
- `getDb()`
  - Função assíncrona para abrir e retornar conexão com o banco.
- `filename`
  - Caminho do arquivo físico do banco SQLite.
- `driver: sqlite3.Database`
  - Diz para `open()` qual driver usar.

#### Para iniciantes (observação importante)
- Este exemplo abre conexão toda vez que `getDb()` é chamado. Para estudo funciona bem.
- Em projetos maiores, você pode manter uma conexão compartilhada para melhorar desempenho.

---

### Passo 5 — Criar tabelas (`src/database/init.js`)

```js
import { getDb } from "./db.js";

export async function initDb() {
  const db = await getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('receita', 'despesa', 'investimento')),
      description TEXT NOT NULL,
      category TEXT,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_user_date
    ON transactions(user_id, date);
  `);
}
```

#### Explicação objetiva
- `initDb()` cria tabelas apenas se não existirem.
- `users` guarda dados do usuário.
- `transactions` guarda movimentações financeiras ligadas ao usuário por `user_id`.
- `CHECK(type IN ...)` limita os tipos válidos.
- Índice `idx_transactions_user_date` acelera listagem por usuário/período.

#### Explicação linha por linha (por que esse trecho está em string)
- `await db.exec(`...`)`:
  - O método `exec` do SQLite recebe **SQL em texto**. Por isso usamos string/template string.
  - Aqui a crase (`` ` ``) permite escrever SQL em múltiplas linhas e com melhor leitura.
- `CREATE TABLE IF NOT EXISTS users (...)`:
  - Cria a tabela de usuários apenas se ainda não existir.
  - `id INTEGER PRIMARY KEY AUTOINCREMENT`: identificador único incremental.
  - `email TEXT NOT NULL UNIQUE`: e-mail obrigatório e sem duplicidade.
  - `password_hash`: guarda hash da senha, não senha em texto puro.
- `CREATE TABLE IF NOT EXISTS transactions (...)`:
  - Cria tabela de transações ligadas ao usuário.
  - `user_id INTEGER NOT NULL`: chave de relação com o dono da transação.
  - `type TEXT ... CHECK(...)`: restringe tipo para `receita`, `despesa` ou `investimento`.
  - `amount REAL NOT NULL`: valor numérico da transação.
  - `FOREIGN KEY(user_id) REFERENCES users(id)`: define vínculo com `users`.
- `CREATE INDEX IF NOT EXISTS idx_transactions_user_date ...`:
  - Cria índice para acelerar filtros por usuário e data.

> Regra prática: string SQL é normal em comandos de criação de tabela (`CREATE`, `ALTER`, `INDEX`).
> Para dados dinâmicos do usuário (ex.: email, descrição, valor), use placeholders `?` com parâmetros (`db.get`, `db.run`) para segurança.

---

### Passo 6 — Controller de autenticação (`src/controllers/authController.js`)

```js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDb } from "../database/db.js";

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes." });
  }

  const db = await getDb();

  const existingUser = await db.get("SELECT id FROM users WHERE email = ?", [email]);
  if (existingUser) {
    return res.status(409).json({ error: "E-mail já cadastrado." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await db.run(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [name, email, passwordHash]
  );

  return res.status(201).json({ id: result.lastID, name, email });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes." });
  }

  const db = await getDb();
  const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);

  if (!user) {
    return res.status(401).json({ error: "Credenciais inválidas." });
  }

  const passwordOk = await bcrypt.compare(password, user.password_hash);
  if (!passwordOk) {
    return res.status(401).json({ error: "Credenciais inválidas." });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
}
```

#### O que cada parte faz
- `register()`:
  - valida entrada,
  - verifica e-mail duplicado,
  - gera hash da senha,
  - cria usuário.
- `login()`:
  - busca usuário por e-mail,
  - compara senha com hash,
  - gera JWT.
- `bcrypt.hash(password, 10)`:
  - transforma senha em hash seguro com 10 rounds.
- `jwt.sign(payload, secret, options)`:
  - cria token assinado para autenticação.

#### Para iniciantes (fluxo mental)
- Cadastro e login são separados: cadastro cria usuário, login só autentica usuário existente.
- A senha nunca deve ser salva em texto puro; sempre hash.
- JWT funciona como “credencial temporária”: o front envia o token a cada requisição protegida.

---

### Passo 7 — Middleware de autenticação (`src/middlewares/authMiddleware.js`)

```js
import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não enviado." });
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId, email: decoded.email };
    return next();
  } catch {
    return res.status(401).json({ error: "Token inválido." });
  }
}
```

#### Explicação
- Lê header `Authorization: Bearer <token>`.
- Verifica assinatura do token.
- Injeta usuário autenticado em `req.user`.
- Chama `next()` para seguir rota.

#### Para iniciantes (como pensar em middleware)
- Middleware é uma “barreira” antes da rota final.
- Se o token for inválido, a requisição para no middleware.
- Se for válido, ele libera a passagem com `next()`.

---

### Passo 8 — Controller de transações (`src/controllers/transactionController.js`)

```js
import { getDb } from "../database/db.js";

export async function createTransaction(req, res) {
  const { type, description, category, amount, date } = req.body;

  if (!type || !description || !amount || !date) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes." });
  }

  const db = await getDb();

  const result = await db.run(
    `INSERT INTO transactions (user_id, type, description, category, amount, date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [req.user.id, type, description, category || null, Number(amount), date]
  );

  return res.status(201).json({ id: result.lastID });
}

export async function listTransactions(req, res) {
  const { month, year, type } = req.query;
  const db = await getDb();

  let query = "SELECT * FROM transactions WHERE user_id = ?";
  const params = [req.user.id];

  if (year && month) {
    const monthStr = String(month).padStart(2, "0");
    query += " AND substr(date, 1, 7) = ?";
    params.push(`${year}-${monthStr}`);
  }

  if (type) {
    query += " AND type = ?";
    params.push(type);
  }

  query += " ORDER BY date DESC, id DESC";

  const rows = await db.all(query, params);
  return res.json(rows);
}

export async function updateTransaction(req, res) {
  const id = Number(req.params.id);
  const { type, description, category, amount, date } = req.body;
  const db = await getDb();

  const existing = await db.get(
    "SELECT id FROM transactions WHERE id = ? AND user_id = ?",
    [id, req.user.id]
  );

  if (!existing) {
    return res.status(404).json({ error: "Transação não encontrada." });
  }

  await db.run(
    `UPDATE transactions
     SET type = ?, description = ?, category = ?, amount = ?, date = ?
     WHERE id = ? AND user_id = ?`,
    [type, description, category || null, Number(amount), date, id, req.user.id]
  );

  return res.json({ message: "Transação atualizada com sucesso." });
}

export async function deleteTransaction(req, res) {
  const id = Number(req.params.id);
  const db = await getDb();

  const result = await db.run(
    "DELETE FROM transactions WHERE id = ? AND user_id = ?",
    [id, req.user.id]
  );

  if (result.changes === 0) {
    return res.status(404).json({ error: "Transação não encontrada." });
  }

  return res.json({ message: "Transação removida com sucesso." });
}
```

#### Explicação rápida das funções
- `createTransaction`: cria transação para o usuário autenticado.
- `listTransactions`: lista com filtros opcionais (`month`, `year`, `type`).
- `updateTransaction`: atualiza transação apenas se ela pertencer ao usuário.
- `deleteTransaction`: remove transação do usuário.

#### Para iniciantes (regras de segurança deste passo)
- Toda operação usa `req.user.id` para garantir isolamento por usuário.
- Em update/delete, o código confirma se a transação pertence ao usuário antes de alterar/remover.
- O uso de `?` com array de parâmetros evita injeção de SQL.

---

### Passo 9 — Rotas (`src/routes/*.js`)

`src/routes/authRoutes.js`

```js
import { Router } from "express";
import { login, register } from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

export default router;
```

`src/routes/transactionRoutes.js`

```js
import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from "../controllers/transactionController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware);
router.get("/", listTransactions);
router.post("/", createTransaction);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
```

#### Explicação
- `Router()` organiza endpoints por domínio.
- `router.use(authMiddleware)` protege todas as rotas abaixo.

#### Para iniciantes (ordem importa)
- Em `transactionRoutes`, o `router.use(authMiddleware)` vem antes dos endpoints.
- Isso garante que `GET/POST/PUT/DELETE` só rodem para usuários autenticados.

---

### Passo 10 — App e servidor

`src/app.js`

```js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);

export default app;
```

`src/server.js`

```js
import "dotenv/config";
import app from "./app.js";
import { initDb } from "./database/init.js";

const port = process.env.PORT || 3001;

async function bootstrap() {
  await initDb();
  app.listen(port, () => {
    console.log(`API rodando em http://localhost:${port}`);
  });
}

bootstrap();
```

#### Explicação
- `express.json()` permite receber JSON no `req.body`.
- `/health` é rota de teste rápido.
- `bootstrap()` inicializa banco e sobe servidor.

#### Para iniciantes (separação app x server)
- `app.js` concentra configuração de middlewares e rotas.
- `server.js` concentra inicialização (variáveis de ambiente, banco e `listen`).
- Essa divisão facilita testes no futuro, porque você pode importar só o `app`.

---

### Passo 11 — Integrar com o frontend atual

Você pode fazer a integração de forma incremental:

1. **Criar tela simples de login/cadastro** (pode ser modal, para estudo).
2. No login, guardar token:

```js
localStorage.setItem("token", token);
```

3. Criar helper de requisição:

```js
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`http://localhost:3001${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Erro na API");
  }

  return response.json();
}
```

4. Onde hoje você usa `salvar()` e `localStorage`, começar a trocar por chamadas:
   - criar: `POST /transactions`
   - listar: `GET /transactions?month=...&year=...`
   - atualizar: `PUT /transactions/:id`
   - apagar: `DELETE /transactions/:id`

#### Para iniciantes (migração sem dor)
- Faça a troca por partes: primeiro listagem, depois criação, depois edição/exclusão.
- Evite migrar tudo no mesmo dia: isso reduz bugs e facilita debugar.
- Sempre valide no navegador + no Insomnia/Postman após cada troca.

---

## 4) Modelo de dados (resumo)

### Tabela `users`
- `id` (PK)
- `name`
- `email` (único)
- `password_hash`
- `created_at`

### Tabela `transactions`
- `id` (PK)
- `user_id` (FK -> users.id)
- `type`: `receita | despesa | investimento`
- `description`
- `category`
- `amount`
- `date`
- `created_at`

---

## 5) Ordem sugerida para você estudar/implementar

1. Banco + tabela de usuários.
2. Cadastro e login com JWT.
3. CRUD de transações.
4. Integrar apenas **listagem e criação** no front.
5. Integrar edição e exclusão.
6. Melhorar validação e tratamento de erros.

Essa sequência evita sobrecarga e te dá progresso visível em cada etapa.

---

## 6) Dicas de aprendizado

- Faça commits pequenos por etapa.
- Teste cada endpoint no Insomnia/Postman antes de conectar no front.
- Mantenha logs claros no backend (`console.log`) enquanto aprende.
- Quando ficar confortável, migre de SQLite para PostgreSQL.

Se quiser, no próximo passo eu posso te entregar um **checklist de implementação em formato “tarefas de 30 minutos”** para você executar em blocos curtos.


## 7) Checklist rápido de validação por fase

- **Fase 1 (setup)**: servidor sobe com `npm run dev` sem erro.
- **Fase 2 (banco)**: arquivo `database.sqlite` criado e tabelas existentes.
- **Fase 3 (auth)**: cadastro retorna `201` e login retorna `token`.
- **Fase 4 (CRUD)**: criar/listar/editar/remover funciona só para o usuário autenticado.
- **Fase 5 (frontend)**: dashboard carrega transações da API e não mais do `localStorage`.

Essa checklist ajuda a garantir que cada bloco foi concluído antes de avançar para o próximo.
