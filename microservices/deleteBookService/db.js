const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost", // The hostname specified in your Docker Compose file
  port: 5432,
  user: "keycloak", // The username for the database in the Docker Compose file
  password: "keycloak", // The password for the database in the Docker Compose file
  database: "keycloak", // The database name in the Docker Compose file
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
