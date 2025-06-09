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
