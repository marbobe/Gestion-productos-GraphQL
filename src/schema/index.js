// Usamos fs para leer el archivo .graphql
const fs = require('fs');
const path = require('path');

// 1. Cargar las definiciones de Tipos (SDL)
// path.join() construye una ruta segura (ej. .../schema/product/product.graphql)
const typeDefs = fs.readFileSync(path.join(__dirname, 'product', 'product.graphql'), 'utf-8');

// 2. Cargar los Resolvers (el objeto JavaScript)
const productResolvers = require('./product/product.resolvers');

// 3. Ensamblar y exportar para Apollo Server
// Apollo unificará automáticamente Query/Mutation/Resolvers.
module.exports = {
    typeDefs,
    resolvers: productResolvers,
};