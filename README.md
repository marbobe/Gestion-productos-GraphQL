# API GraphQL: Gestión de Productos

![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=flat&logo=node.js)
![GraphQL](https://img.shields.io/badge/GraphQL-Apollo%20Server-e10098?style=flat&logo=graphql)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat&logo=mongodb)
![Docker](https://img.shields.io/badge/Container-Docker-2496ED?style=flat&logo=docker)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=flat&logo=github-actions)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat)

> Una API robusta, modular y escalable diseñada con arquitectura por capas, principios SOLID y buenas prácticas de DevOps.

---

## Descripción del Proyecto

Este proyecto es una implementación profesional de un backend con **GraphQL**. A diferencia de los tutoriales básicos, esta API está diseñada para escalar y ser mantenible en un entorno de producción.

Implementa una **Arquitectura en 3 Capas** (Controller-Service-Data) para desacoplar la lógica de negocio de la interfaz GraphQL y la base de datos. Incluye validaciones robustas, manejo de errores centralizado, paginación, seguridad mediante contexto y un pipeline de CI/CD automatizado.

---

## Arquitectura y Patrones

El proyecto sigue el patrón **Service Layer** para asegurar la separación de responsabilidades:

```mermaid
graph TD
    A[Cliente / Apollo Sandbox] -->|Query/Mutation| B(Apollo Server)
    B -->|Context Auth| C{Resolvers}
    C -->|Args| D[Service Layer]
    D -->|Validación & Lógica| D
    D -->|Mongoose ODM| E[(MongoDB)]
```

## Stack Tecnológico

**Runtime**: Node.js
**API Server**: @apollo/server (Standalone)
**Base de Datos**: MongoDB (con Mongoose ODM)
**Testing**: Mocha, Chai, Sinon
**Infraestructura**: Docker & Docker Compose
**CI/CD**: GitHub Actions (Automated Testing Pipeline)
**Utilidades**: Dotenv, Winston Logger

## Características Clave

Schema-First Design: Definición clara del contrato (.graphql) separada de la implementación.

Service Layer Pattern: Toda la lógica de negocio reside en servicios testables, no en los resolvers.

Dependency Injection & Mocking: Tests unitarios aislados usando Sinon.js.

Manejo de Errores Profesional: Sanitización de errores en producción (ocultando stacktraces) y uso de códigos semánticos (BAD_USER_INPUT, NOT_FOUND).

Seguridad (RBAC): Autenticación mediante Headers y autorización basada en Roles en el Contexto.

Paginación: Implementación eficiente con limit y offset.

Logging Estructurado: Uso de Winston para logs profesionales (JSON en prod, colores en dev).

## Instalación y despliegue

### 1. Prerrequisitos

Tener **Docker** y **Docker Compose** instalados.

### 2. Variables de Entorno

Crea un archivo llamado **`.env`** en la raíz del proyecto y añade las siguientes variables indicadas en .env.sample con tu configuración local.

### 3. Ejecución con docker

Ejecuta el siguiente comando para construir las imágenes, levantar los contenedores (`api` y `db`):

```bash
docker-compose up --build
```

La API estará disponible en: http://localhost:4000

### 4. Carga de Datos (Seeding)

Para poblar la base de datos con datos de prueba:

```bash
docker-compose exec api npm run seed
```

### 5. Acceso a la Base de Datos (MongoDB Compass)

El contenedor de base de datos expone el puerto `27017` al host. Puedes conectarte usando **MongoDB Compass** o una extensión de VS Code para inspeccionar los datos visualmente.

Debido a que el entorno es seguro, debes usar la siguiente cadena de conexión (Connection String) que incluye las credenciales definidas en tu `.env`:

```bash
mongodb://mongo-user:mongo-pass@localhost:27017/productos_db?authSource=admin
```

## Testing

El proyecto cuenta con una suite de tests unitarios que verifican la lógica de negocio y las validaciones sin tocar la base de datos real (usando Mocks).

Para ejecutar los tests dentro del contenedor:

```bash
docker-compose exec api npm test
Cobertura de Tests:
```

✅ Creación de productos (Validación de precios negativos, duplicados).
✅ Lectura y Búsqueda (Manejo de 404 Not Found).
✅ Actualización y Borrado.
✅ Paginación (Limit y Offset).

## Exploración y Funcionalidad de la API

El endpoint principal es `POST http://localhost:4000/`. Se recomienda usar **Apollo Sandbox** (que se abre automáticamente en el navegador al visitar esa URL) o herramientas como Postman.

### Autenticación (Importante)

Las operaciones de escritura (Crear, Editar, Borrar) están protegidas. Para ejecutarlas, debes incluir el siguiente Header en tu cliente GraphQL:

- **Key:** `Authorization`
- **Value:** `soyeladmin` (Simula un token de Administrador)

### Queries

#### Listar productos con Paginación y Filtros

Obtiene productos de 5 en 5, ordenados por precio ascendente y filtrando aquellos con stock mayor a 0.

```bash
graphql
query ListarProductos {
  productsList(
    limit: 5,
    offset: 0,
    sortBy: "price_asc",
    stockMin: 1
  ) {
    id
    name
    price
    stock
  }
}
```

#### Buscar por nombre (Búsqueda parcial)

Busca productos que contengan el texto indicado (insensible a mayúsculas).

```bash
query BuscarPorNombre {
  searchByName(name: "monitor") {
    id
    name
    description
    price
  }
}
```

#### Buscar por id:

```bash
query BuscarPorID {
  productById(id: "ID_DEL_PRODUCTO") {
    name
    description
    createdAt
  }
}
```

#### Filtrar por stock y ordenar:

```bash
query Products {
    products(stockMin: 5, sortBy: "price_asc") {
        id
        name
        description
        price
        stock
        createdAt
    }
}
```

### Mutations

#### Añadir un producto:

Requiere Header Authorization

```bash
mutation CrearProducto {
  addProduct(
    name: "Laptop Gamer",
    description: "Última generación",
    price: 1500.00,
    stock: 10
  ) {
    id
    name
    createdAt
  }
}
```

#### Modiclifar un podructo:

Requiere Header Authorization

```bash
mutation ActualizarProducto {
  updateProduct(
    id: "ID_DEL_PRODUCTO",
    price: 1350.00,
    stock: 8
  ) {
    id
    name
    price
    stock
  }
}
```

#### Eliminar un producto:

Requiere Header Authorization y Rol ADMIN

```bash
mutation BorrarProducto {
  deleteProduct(id: "ID_DEL_PRODUCTO") {
    name
  }
}
```

## CI/CD

Este repositorio utiliza GitHub Actions para integración continua.
Cada push a las ramas principales o pull_request dispara un pipeline. Este instala dependencias y ejecuta la suite de tests unitarios automáticamente. Esto asegura que ningún código roto llegue a producción.
