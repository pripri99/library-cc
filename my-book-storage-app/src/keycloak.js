import Keycloak from "keycloak-js";

const keycloakConfig = {
  url: "http://localhost:8080/auth",
  realm: "book-app",
  clientId: "my-book-storage-app",
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
