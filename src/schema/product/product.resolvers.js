/**
 * @file product.resolver.js
 * @description Resolvers de GraphQL para la entidad Producto.
 * Conecta las definiciones del Schema (Queries/Mutations) con la lógica de negocio (Service Layer).
 * Maneja la autenticación y autorización (RBAC) antes de invocar al servicio.
 */

const { GraphQLError } = require('graphql');
const ProductService = require('../../services/product.service');

const productResolvers = {

    // ====================================================
    // QUERIES (Lectura)
    // ====================================================
    Query: {
        /**
         * Obtiene una lista paginada y filtrada de productos.
         * @async
         * @param {Object} parent - El objeto padre (no usado en root queries).
         * @param {Object} args - Argumentos de la query (limit, offset, sortBy, stockMin).
         * @returns {Promise<Array>} Lista de productos encontrados.
         */
        productsList: async (parent, args) => {
            return await ProductService.getAllProducts(args);
        },
        /**
         * Busca un producto por su ID único.
         * @async
         * @param {Object} parent - No usado.
         * @param {Object} args - Argumentos conteniendo el ID.
         * @param {string} args.id - ID del producto a buscar.
         * @returns {Promise<Object>} El producto encontrado o null.
         */
        productById: async (parent, args) => {
            return await ProductService.getProductById(args.id);
        },
        /**
         * Realiza una búsqueda de productos por coincidencia de nombre (Regex).
         * @async
         * @param {Object} parent - No usado.
         * @param {Object} args - Argumentos de búsqueda.
         * @param {string} args.name - Término de búsqueda.
         * @returns {Promise<Array>} Lista de productos que coinciden con el nombre.
         */
        searchByName: async (parent, args) => {
            return await ProductService.searchByName(args.name);
        }
    },

    // ====================================================
    // MUTATIONS (Escritura)
    // ====================================================
    Mutation: {
        /**
         * Crea un nuevo producto. Requiere autenticación.
         * @async
         * @param {Object} parent - No usado.
         * @param {Object} args - Datos del nuevo producto (name, price, etc.).
         * @param {Object} context - Contexto de la petición (contiene info del usuario).
         * @throws {GraphQLError} UNAUTHENTICATED si el usuario no está logueado.
         * @returns {Promise<Object>} El producto creado.
         */
        addProduct: async (parent, args, context) => {

            if (!context.user) {
                throw new GraphQLError('Debes estar autenticado para crear productos.', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            return await ProductService.createProduct(args);
        },
        /**
         * Actualiza un producto existente. Requiere autenticación.
         * @async
         * @param {Object} parent - No usado.
         * @param {Object} args - Argumentos de la mutación.
         * @param {string} args.id - ID del producto a editar.
         * @param {Object} args.updates - Resto de campos a actualizar (name, price, etc.).
         * @param {Object} context - Contexto de la petición.
         * @throws {GraphQLError} UNAUTHENTICATED si no hay usuario.
         * @returns {Promise<Object>} El producto actualizado.
         */
        updateProduct: async (parent, { id, ...updates }, context) => {
            if (!context.user) {
                throw new GraphQLError('Debes estar autenticado para actualizar productos.', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            // Desestructuramos para separar el ID de los datos a actualizar
            return await ProductService.updateProduct(id, updates);
        },
        /**
         * Elimina un producto. Requiere rol de ADMIN.
         * @async
         * @param {Object} parent - No usado.
         * @param {Object} args - Argumentos.
         * @param {string} args.id - ID del producto a eliminar.
         * @param {Object} context - Contexto con información de usuario y roles.
         * @throws {GraphQLError} UNAUTHENTICATED si no hay usuario.
         * @throws {GraphQLError} FORBIDDEN si el usuario no es ADMIN.
         * @returns {Promise<Object>} El producto eliminado.
         */
        deleteProduct: async (parent, args, context) => {
            if (!context.user) {
                throw new GraphQLError('No estás autenticado.', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }

            if (context.user.role !== 'ADMIN') {
                throw new GraphQLError('No tienes permisos para eliminar productos.', {
                    extensions: { code: 'FORBIDDEN' }
                })
            }
            return await ProductService.deleteProduct(args.id);
        }
    }
};

module.exports = productResolvers;