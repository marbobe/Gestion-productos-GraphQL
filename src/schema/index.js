/**
 * @file index.js (Schema Aggregator)
 * @description Punto central de definición del Schema de GraphQL.
 * * Responsabilidad:
 * 1. Cargar y leer los archivos .graphql (Type Definitions).
 * 2. Importar y combinar los Resolvers.
 * 3. Exportar el conjunto para ser consumido por Apollo Server.
 * @module schema
 */

const fs = require('fs');
const path = require('path');

// ====================================================
// 1. CARGA DE DEFINICIONES DE TIPOS (Type Definitions)
// ====================================================

/**
 * Leemos el archivo .graphql de forma síncrona.
 * Nota: readFileSync es aceptable aquí porque solo ocurre una vez
 * durante el inicio del servidor (Startup time), no en cada petición.
 * * __dirname apunta a: src/schema/
 */
const typeDefs = fs.readFileSync(path.join(__dirname, 'product', 'product.graphql'), 'utf-8');

// ====================================================
// 2. CARGA DE RESOLVERS
// ====================================================

/**
 * Importamos los resolvers que contienen la lógica.
 */
const productResolvers = require('./product/product.resolvers');

// ====================================================
// 3. EXPORTACIÓN DEL MÓDULO
// ====================================================

/**
 * Exportamos el objeto combinado.
 * Apollo Server se encarga de unir automáticamente los TypeDefs con los Resolvers
 * basándose en los nombres de las Query/Mutation.
 */
module.exports = {
    typeDefs,
    resolvers: productResolvers,
};