# Project Contents

## executor

- [Dockerfile](executor/Dockerfile)
- [index.js](executor/index.js)
- [package-lock.json](executor/package-lock.json)
- [package.json](executor/package.json)

### node_modules

## keycloak

- [docker-compose.yml](keycloak/docker-compose.yml)
- [realm-export.json](keycloak/realm-export.json)

## my-book-storage-app

- [Dockerfile](my-book-storage-app/Dockerfile)
- [package-lock.json](my-book-storage-app/package-lock.json)
- [package.json](my-book-storage-app/package.json)

### node_modules

### public

- [favicon.ico](my-book-storage-app/public/favicon.ico)
- [index.html](my-book-storage-app/public/index.html)
- [logo192.png](my-book-storage-app/public/logo192.png)
- [logo512.png](my-book-storage-app/public/logo512.png)
- [manifest.json](my-book-storage-app/public/manifest.json)
- [robots.txt](my-book-storage-app/public/robots.txt)

### src

- [api.js](my-book-storage-app/src/api.js)
- [App.css](my-book-storage-app/src/App.css)
- [App.js](my-book-storage-app/src/App.js)
- [App.test.js](my-book-storage-app/src/App.test.js)
- [bookActions.js](my-book-storage-app/src/bookActions.js)
- [index.css](my-book-storage-app/src/index.css)
- [index.js](my-book-storage-app/src/index.js)
- [keycloak.js](my-book-storage-app/src/keycloak.js)
- [logo.svg](my-book-storage-app/src/logo.svg)
- [reportWebVitals.js](my-book-storage-app/src/reportWebVitals.js)
- [setupTests.js](my-book-storage-app/src/setupTests.js)

## observer

- [Dockerfile](observer/Dockerfile)
- [index.js](observer/index.js)
- [package-lock.json](observer/package-lock.json)
- [package.json](observer/package.json)

### node_modules

### public

- [observer.html](observer/public/observer.html)

## server

- [Dockerfile](server/Dockerfile)
- [index.js](server/index.js)
- [kafkaClient.js](server/kafkaClient.js)
- [package-lock.json](server/package-lock.json)
- [package.json](server/package.json)

### node_modules

```
library-cc,
├─ .gitignore,
├─ docker-compose.yml,
├─ executor,
│  ├─ .env,
│  ├─ Dockerfile,
│  ├─ index.js,
│  ├─ package-lock.json,
│  └─ package.json,
├─ keycloak,
│  ├─ docker-compose.yml,
│  └─ realm-export.json,
├─ my-book-storage-app,
│  ├─ .env,
│  ├─ .gitignore,
│  ├─ Dockerfile,
│  ├─ package-lock.json,
│  ├─ package.json,
│  ├─ public,
│  │  ├─ favicon.ico,
│  │  ├─ index.html,
│  │  ├─ logo192.png,
│  │  ├─ logo512.png,
│  │  ├─ manifest.json,
│  │  └─ robots.txt,
│  ├─ README.md,
│  └─ src,
│     ├─ api.js,
│     ├─ App.css,
│     ├─ App.js,
│     ├─ App.test.js,
│     ├─ bookActions.js,
│     ├─ components,
│     │  ├─ Book.js,
│     │  ├─ BookForm.js,
│     │  ├─ BookList.js,
│     │  ├─ Sidebar.css,
│     │  └─ Sidebar.js,
│     ├─ index.css,
│     ├─ index.js,
│     ├─ keycloak.js,
│     ├─ logo.svg,
│     ├─ reportWebVitals.js,
│     ├─ setupTests.js,
│     └─ utils,
│        └─ localStorage.js,
├─ observer,
│  ├─ Dockerfile,
│  ├─ index.js,
│  ├─ package-lock.json,
│  ├─ package.json,
│  └─ public,
│     └─ observer.html,
├─ README.md,
└─ server,
   ├─ Dockerfile,
   ├─ index.js,
   ├─ kafkaClient.js,
   ├─ package-lock.json,
   └─ package.json,

```
