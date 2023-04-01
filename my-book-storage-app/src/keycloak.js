import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080/auth",
  realm: "book-app",
  clientId: "my-book-storage-app",
});

export default keycloak;