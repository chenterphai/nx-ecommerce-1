# ExpressJS + GraphQL (TS)

To install dependencies:

```bash
bun install
```

To run development:

```bash
bun run dev
```

This project was created using `bun init` in bun v1.2.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## 📚 Prerequisite

### ✅ PostgreSQL v17

We are usong PostgreSQL v17 to store all data

### ✅ TypeORM

TypeORM is an ORM that can run in NodeJS, Browser, Cordova, PhoneGap, Ionic, React Native, NativeScript, Expo, and Electron platforms and can be used with TypeScript and JavaScript (ES2021).

#### Installation

```bash
# 1. Install the npm package
npm install typeorm --save

# 2. You need to install reflect-metadata shim:
npm install reflect-metadata --save

# and import it somewhere in the global place of your app (for example in app.ts):

import "reflect-metadata"

# 3. You may need to install node typings:
npm install @types/node --save-dev

# 4. Install a database driver:
# 4.1. for MySQL or MariaDB
npm install mysql --save (you can install mysql2 instead as well)

# 4.2. for PostgreSQL or CockroachDB
npm install pg --save

# 4.3. for SQLite
npm install sqlite3 --save

# 4.4. for Microsoft SQL Server
npm install mssql --save

# 4.5. for Oracle
npm install oracledb --save

# 4.6. for MongoDB (experimental)
npm install mongodb@^5.2.0 --save

```

## 🍃 Paths Configuration

To use `@/path/package` follow the following step:

### 1. tsconfig.json

```JSON
{
  "compilerOptions": {
    /* Language and Environment */
    "target": "ES2020", /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */
    /* Modules */
    "module": "CommonJS", /* Specify what module code is generated. */

    "baseUrl": "./src", /* Specify the base directory to resolve non-relative module names. */
    "paths": {
      "@/*": [
        "*"
      ]
    }, /* Specify a set of entries that re-map imports to additional lookup locations. */
    "typeRoots": [
      "./src/@types",
      "./node_modules/@types"
    ], /* Specify multiple folders that act like './node_modules/@types'. */

    "esModuleInterop": true, /* Emit additional JavaScript to ease support for importing CommonJS modules. This enables 'allowSyntheticDefaultImports' for type compatibility. */

    "forceConsistentCasingInFileNames": true, /* Ensure that casing is correct in imports. */
    /* Type Checking */
    "strict": true, /* Enable all strict type-checking options. */
    "skipLibCheck": true /* Skip type checking all .d.ts files. */
  }
}
```

### 2. Install dependencies

```bash
bun add -d tsconfig-paths
```

### 3. nodemon

If you prefer using `nodemon.json`

```JSON
{
  "watch": ["src"],
  "ext": "ts,json",
  "exec": "ts-node -r tsconfig-paths/register src/server.ts"
}
```

or

`package.json`

```json
"scripts": {
  "dev": "nodemon --exec ts-node -r tsconfig-paths/register index.ts"
}
```

### 4. Ensure `package.json` has type

```json
{
  "type": "commonjs"
}
```
