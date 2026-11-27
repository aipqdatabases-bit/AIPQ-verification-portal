# AIPQ verification portal

## Deploy on Railway

1. Deploy the Next.js service in the same Railway project and environment as the existing PostgreSQL service.
2. In the Next.js service’s **Variables** tab, add `DATABASE_URL` as a reference to the PostgreSQL service’s private `DATABASE_URL`. For a service named `Postgres`, use `${{Postgres.DATABASE_URL}}`.
3. Deploy the Next.js service. Railway reads `railway.json` and runs `npm run db:migrate` before starting the app. The database role in `DATABASE_URL` needs permission to create the `aipq` schema and its tables during the first deployment.
4. Check the pre-deploy log for `Applied 001_create_register.sql.` on the first run or `No pending migrations.` on subsequent runs. In the portal, submit a correctly formatted certificate reference and confirm that the empty register returns “No matching record found.”

[Railway PostgreSQL](https://docs.railway.com/databases/postgresql) · [Railway pre-deploy commands](https://docs.railway.com/deployments/pre-deploy-command)

The initial migration creates an empty register. Load actual records into `aipq.certificates`, `aipq.transcript_subjects`, `aipq.learning_centres`, and `aipq.memberships`. Use uppercase references with standard hyphens and no whitespace. Import only the masked identity document value, using `•` or `*` for hidden characters. Transcript rows use a one-based `display_order`.

## Develop and test locally

Set `DATABASE_URL` in your shell to a development PostgreSQL connection string, then run:

```sh
npm ci
npm run db:migrate
npm run dev
```

To run integration tests, set `TEST_DATABASE_URL` to a disposable local PostgreSQL instance with a role that can create and drop databases. The test suite creates its own database and loads the sample records into that database.

```sh
npm run lint
npm run build
npm run test:integration
```
