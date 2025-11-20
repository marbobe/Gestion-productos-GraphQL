# API GraphQL: Gestión de Productos (Node.js + MongoDB + Docker)

Esta es una API robusta y limpia implementada con **GraphQL** sobre Node.js y Express, utilizando Mongoose como ORM para la persistencia de datos en MongoDB. La arquitectura está completamente contenida y orquestada con Docker Compose para un entorno de desarrollo reproducible.

---

## Tecnologías

- **Backend:** Node.js (Express)
- **GraphQL:** `graphql` y `graphql-http`
- **Base de Datos:** MongoDB
- **ORM:** Mongoose
- **Orquestación:** Docker y Docker Compose
- **Otras:** `dotenv` para gestión de variables de entorno

---

## Configuración e Instalación

### 1. Prerrequisitos

Asegúrate de tener **Docker** y **Docker Compose** instalados en tu sistema.

### 2. Variables de Entorno

Crea un archivo llamado **`.env`** en la raíz del proyecto y añade las siguientes variables indicadas en .env.sample con tu configuración local.

### 3. Arranque del Servicio

Ejecuta el siguiente comando para construir las imágenes, levantar los contenedores (`api` y `db`), ejecutar el script de _seeding_ automático (`seed.js`), y arrancar el servidor:

```bash
docker-compose up --

### 4. Conexión a la Base de Datos Externa

Para visualizar los datos insertados por el seeding o las mutaciones, puedes usar herramientas como MongoDB Compass o la extensión de VS Code. Conéctate usando la URI mapeada al host:

mongodb://localhost:27017/productos_db

## Exploración y Funcionalidad de la API

El endpoint principal para todas las operaciones es POST http://localhost:4000/graphql.

### Queries

Mostrar todos los productos:

query Product {
    products {
        id
        name
        description
        price
        stock
        createdAt
    }
}

Buscar productos por nombre:

query Product {
    searchByName(name: "mobile") {
        id
        name
        description
        price
        stock
        createdAt
    }
}

Buscar por id:

query Product {
    product(id: "691ed8cfd7e0c1da34a49b02") {
        id
        price
        stock
        createdAt
        description
        name
    }
}

Filtrar por stock y ordenar:

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

### Mutations

#### A. Añadir, Modificar y eliminar productos

Añadir un producto:

mutation AddProduct {
    addProduct(name: "mobile", description: "the newest model", price: 500, stock: 5){
        id
        name
        price
        createdAt
    }
}

Modiclifar un podructo:

mutation UpdateProduct {
    updateProduct(id: "691df0d7434cff2f25065f76", name: "new name") {
        id
        name
        description
        price
        stock
        createdAt
    }
}

Eliminar un producto:

mutation DeleteProduct {
    deleteProduct(id: "691df565434cff2f25065f79") {
        id
        name
        description
        price
        stock
        createdAt
    }
}



```
