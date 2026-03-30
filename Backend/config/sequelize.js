const { Sequelize } = require('sequelize');

const inferDialect = (databaseUrl) => {
  if (process.env.DB_DIALECT) {
    return process.env.DB_DIALECT;
  }

  if (process.env.PGHOST || process.env.PGDATABASE || process.env.PGUSER) {
    return 'postgres';
  }

  if (!databaseUrl) {
    return 'mysql';
  }

  if (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://')) {
    return 'postgres';
  }

  if (databaseUrl.startsWith('mysql://')) {
    return 'mysql';
  }

  return 'mysql';
};

const buildDialectOptions = () => {
  const sslEnabled =
    process.env.DB_SSL === 'true' ||
    process.env.PGSSL === 'true' ||
    process.env.NODE_ENV === 'production';

  if (!sslEnabled) {
    return undefined;
  }

  return {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  };
};

const buildSequelize = () => {
  const databaseUrl = process.env.DATABASE_URL;
  const dialect = inferDialect(databaseUrl);
  const logging =
    process.env.NODE_ENV === 'development' ? (msg) => console.log(msg) : false;
  const dialectOptions = buildDialectOptions();

  if (databaseUrl) {
    return new Sequelize(databaseUrl, {
      dialect,
      logging,
      dialectOptions,
    });
  }

  const isPostgres = dialect === 'postgres';
  const database = process.env.DB_NAME || process.env.PGDATABASE || 'nds';
  const username = process.env.DB_USER || process.env.PGUSER || 'root';
  const password = process.env.DB_PASSWORD || process.env.PGPASSWORD || '';
  const host = process.env.DB_HOST || process.env.PGHOST || 'localhost';
  const port = Number(process.env.DB_PORT || process.env.PGPORT || (isPostgres ? 5432 : 3306));

  return new Sequelize(database, username, password, {
    host,
    port,
    dialect,
    logging,
    dialectOptions,
  });
};

module.exports = buildSequelize();
