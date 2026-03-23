# PostgreSQL setup (Backend)

## Environment

Set either:

- `DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME` (preferred), or
- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

Optional:

- `PGSSL=true` to enable SSL (useful on managed Postgres providers).

## Run

- Start API: `npm start`
- Seed default admins/courses: `node seed.js`
- Create/update single admin user: `node createAdmin.js`

Notes:

- The server uses `sequelize.sync()` to create tables automatically.
- Existing MongoDB data is not migrated automatically.

