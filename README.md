## Migrations (TypeORM)

Este projeto usa o CLI do TypeORM via scripts do `package.json`.

### Pré-requisitos

- Ter as dependências instaladas (`npm install`)
- Ter o arquivo de ambiente na raiz do projeto (`.env`)

### Scripts disponíveis

- `npm run migration:generate --name=<nome_da_migration>`
- `npm run migration:run`
- `npm run migration:revert`

As migrations são geradas em:

- `src/core/infra/shared/db/typeorm/migrations`

### Como nomear uma migration

O script está configurado para receber nome dinâmico com `--name`.

Exemplo:

```bash
npm run migration:generate --name=create_endpoints_table
```

Também funciona com Yarn:

```bash
yarn migration:generate --name=create_endpoints_table
```

Sugestão de padrão de nome:

- `create_<tabela>_table`
- `add_<coluna>_to_<tabela>`
- `update_<contexto>`

### Fluxo recomendado

1. Gerar a migration com nome descritivo.
2. Revisar o arquivo gerado em `src/core/infra/shared/db/typeorm/migrations`.
3. Aplicar no banco local:

```bash
npm run migration:run
```

4. Se necessário, desfazer a última migration:

```bash
npm run migration:revert
```
