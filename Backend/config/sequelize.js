const { Sequelize } = require('sequelize');

const buildSequelize = () => {
  const databaseUrl = process.env.DATABASE_URL;
  const logging =
    process.env.NODE_ENV === 'development' ? (msg) => console.log(msg) : false;

  if (databaseUrl) {
    return new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging,
      dialectOptions:
        process.env.PGSSL === 'true'
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : undefined,
    });
  }

  const database = process.env.PGDATABASE || 'nds';
  const username = process.env.PGUSER || 'postgres';
  const password = process.env.PGPASSWORD || '';
  const host = process.env.PGHOST || 'localhost';
  const port = Number(process.env.PGPORT || 5432);

  return new Sequelize(database, username, password, {
    host,
    port,
    dialect: 'postgres',
    logging,
    dialectOptions:
      process.env.PGSSL === 'true'
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : undefined,
  });
};

module.exports = buildSequelize();

