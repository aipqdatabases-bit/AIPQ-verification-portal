# AIPQ verification portal

## Deploy on Railway

1. Connect two services to this repository in the same Railway project and environment as PostgreSQL. Keep the Next.js service’s root directory set to `/`. Give the backend service the name `VerificationBackend`, set its root directory to `/backend`, and set its config file path to `/backend/railway.json`.
2. In `VerificationBackend`’s **Variables** tab, set `PORT=4000` and `DATABASE_URL=${{Postgres.DATABASE_URL}}`. Replace `Postgres` with the actual PostgreSQL service name if it differs. Keep the backend on private networking.
3. In the Next.js service’s **Variables** tab, set `VERIFICATION_BACKEND_URL=http://${{VerificationBackend.RAILWAY_PRIVATE_DOMAIN}}:${{VerificationBackend.PORT}}`. If the frontend was previously configured to use PostgreSQL directly, remove its `DATABASE_URL` and any manually configured database pre-deploy command.
4. Deploy the backend, then the frontend. The backend config runs `npm run db:migrate` before starting Node. The database role needs permission to create the `aipq` schema and its tables on the first deployment. Check the backend pre-deploy log for `Applied 001_create_register.sql.` or `No pending migrations.`
5. In the portal, submit a correctly formatted certificate reference and confirm that the empty register returns “No matching record found.”

[Railway monorepo setup](https://docs.railway.com/deployments/monorepo) · [Railway private domains](https://docs.railway.com/networking/domains/working-with-domains) · [Railway PostgreSQL](https://docs.railway.com/databases/postgresql)

The initial migration creates an empty register. Load actual records into `aipq.certificates`, `aipq.transcript_subjects`, `aipq.learning_centres`, and `aipq.memberships`. Use uppercase references with standard hyphens and no whitespace. Import only the masked identity document value, using `•` or `*` for hidden characters. Transcript rows use a one-based `display_order`.

## Develop and test locally

Install each service’s dependencies from the repository root.

```sh
npm ci
npm --prefix backend ci
```

Use [backend/.env.example](backend/.env.example) to configure `backend/.env` with a development `DATABASE_URL` and `PORT`. A `*.railway.internal` database URL works inside its Railway environment. From your laptop, use a local PostgreSQL instance or an external Railway connection that you have already enabled. The backend start and migration commands load `backend/.env`. Shell variables take precedence.

Set `VERIFICATION_BACKEND_URL=http://127.0.0.1:4000` in the frontend’s `.env.local`, as shown in [the frontend example](.env.example).

Run the migration and start the backend in one terminal.

```sh
npm run db:migrate
npm --prefix backend start
```

Start the frontend in a second terminal.

```sh
npm run dev
```

To run integration tests, set `TEST_DATABASE_URL` to a disposable local PostgreSQL instance with a role that can create and drop databases. The tests launch both services and load sample records into a new test database.

```sh
npm run lint
npm run build
npm run test:integration
```
