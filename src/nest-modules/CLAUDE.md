# nest-modules

Camada de integração com o framework NestJS. É a única camada que conhece e conecta todas as camadas do `core/`. Não contém lógica de negócio.

## Estrutura

```
nest-modules/
  app.module.ts       → módulo raiz da aplicação
  configs/            → configuração de ambiente e inicialização global
  databases/          → módulo de configuração do TypeORM
  shared/             → filtros, guards, interceptors e decorators globais
  auth/               → módulo de autenticação (JWT + Google OAuth)
  endpoints/          → módulo de gerenciamento de endpoints
  status-codes/       → módulo de listagem de status codes HTTP
```

## Módulo raiz (`app.module.ts`)

Importa todos os módulos de funcionalidade. Registra `AccessTokenGuard` como `APP_GUARD` (guard global padrão para todas as rotas).

## Padrão de módulo de funcionalidade

```
<módulo>/
  <módulo>.module.ts     → @Module com controller, providers e exports
  <módulo>.controller.ts → controller HTTP que injeta e delega aos casos de uso
  <módulo>.provider.ts   → declaração dos FactoryProviders agrupados
  dtos/                  → DTOs de entrada com class-validator
```

## Padrão de Provider

Use cases e repositórios **não são** classes `@Injectable()`. São instanciados por `FactoryProvider` (`useFactory` + `inject`).

O token (`provide`) é a **classe concreta** (ex: `CreateEndpointUseCase`), não uma string ou interface. Os providers são agrupados em um objeto exportado por namespace:

```ts
// endpoints.provider.ts
export const ENDPOINT_PROVIDERS = {
  REPOSITORIES: {
    ENDPOINT_REPOSITORY: {
      provide: EndpointTypeOrmRepository,
      useFactory: (ds: DataSource) => new EndpointTypeOrmRepository(ds),
      inject: [DataSource],
    },
  },
  USE_CASES: {
    CREATE_ENDPOINT_USE_CASE: {
      provide: CreateEndpointUseCase,
      useFactory: (repo, userRepo) => new CreateEndpointUseCase(repo, userRepo),
      inject: [EndpointTypeOrmRepository, UserTypeOrmRepository],
    },
    // ...
  },
};
```

O `AuthModule` possui ainda sub-objetos `UNIT_OF_WORKS` e `SERVICES` além de `REPOSITORIES` e `USE_CASES`.

Módulos espalham os providers com `...Object.values(ENDPOINT_PROVIDERS.REPOSITORIES)`, etc.

**Exceção:** módulos sem dependências (ex: `StatusCodesModule`) declaram o provider inline no `@Module`.

## Padrão de DTO

DTOs são classes autônomas com `class-validator` decorators — **não** estendem nem importam tipos do `core/app/`. Cada DTO:
- Tem decoradores de validação em cada propriedade
- Tem um `constructor(props) { Object.assign(this, props) }` para compatibilidade com `ValidationPipe transform: true`

Quando um endpoint requer separação de params de rota e corpo da requisição, são criados dois DTOs: `...ParamsDto` e `...BodyDto`.

Controllers mesclam os dados e adicionam o `userId` da sessão antes de chamar o caso de uso:
```ts
this.createEndpointUseCase.execute({ ...dto, userId: session.userId });
```

## Padrão de Controller

- Recebe casos de uso via injeção de dependência no construtor
- Cada método do controller chama diretamente o `.execute()` do caso de uso correspondente
- Não contém lógica de negócio nem acessa repositórios diretamente
- Usa `@CurrentSession()` para obter os dados do usuário autenticado

## Autenticação

**Guard global:** `AccessTokenGuard` (extends `AuthGuard("jwt")`) é registrado como `APP_GUARD` no `AppModule` — protege todas as rotas por padrão.

**Rotas públicas** usam `@Public()` para desativar o guard global:
```ts
@Public()
@Post('login/google')
googleLogin(...) { ... }
```

**Rota de refresh** é pública **e** usa `@UseGuards(RefreshTokenGuard)` para trocar a estratégia JWT:
```ts
@Public()
@UseGuards(RefreshTokenGuard)
@Post('refresh')
refresh(...) { ... }
```

**Tokens via cookies HTTP-only:**
- `access_token` — enviado em todas as requisições (mesma origem)
- `refresh_token` — enviado apenas para rotas em `/auth` (cookie com `path: '/auth'`)

**Estratégias Passport:**

| Classe | Nome Passport | Origem do token |
|---|---|---|
| `AccessTokenStrategy` | `"jwt"` | cookie `access_token` |
| `RefreshTokenStrategy` | `"jwt-refresh"` | cookie `refresh_token` |

O payload decodificado fica disponível via `@CurrentSession()` como `ICurrentSession`:
```ts
{ userId: string; name: string; email: string; refreshToken: string }
```

## Configuração global (`configs/global-config.ts`)

Aplicada via `applyGlobalConfig(app)` em `main.ts`:
- `ValidationPipe` com `transform: true` e `errorHttpStatusCode: 422`
- `WrapperDataInterceptor` — envolve respostas em `{ data: ... }`
- `EntityValidationErrorFilter` → HTTP 422
- `NotFoundErrorFilter` → HTTP 404
- `AuthenticationErrorFilter` → HTTP 401

## Configuração de ambiente (`configs/`)

- Configurações tipadas por domínio (`api`, `database`, `auth`) via `registerAs()`
- Validação de variáveis de ambiente com Joi no momento do bootstrap
- Carregamento automático a partir de `.env`
- `ConfigsModule` configurado como global (`isGlobal: true`)

Variáveis de ambiente obrigatórias: `API_PORT`, `DB_TYPE` (`sqlite`|`postgres`), `DB_DATABASE`, `DB_MIGRATIONS_AUTO_RUN`, `GOOGLE_CLIENT_ID`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRATION_TIME`, `JWT_REFRESH_EXPIRATION_TIME`. Variáveis de PostgreSQL (`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`) são obrigatórias apenas quando `DB_TYPE=postgres`.

## Módulo de banco de dados (`databases/`)

- `DatabasesModule` configura TypeORM via `forRootAsync` lendo `ConfigService`
- **SQLite:** `synchronize: true`, sem migrations
- **PostgreSQL:** `migrationsRun: databaseConfig.migrationsRun`, migrations em `core/infra/shared/db/typeorm/migrations/`
- Entidades descobertas por glob: `../../core/**/*.model{.ts,.js}`
- Se `DB_TYPE` não for `sqlite` nem `postgres`, lança `Error("Unsupported database type")`
