const { GraphQLError } = require('graphql');
const ProductService = require('../../services/product.service');

const productResolvers = {

    // QUERIES
    Query: {
        productsList: async (parent, args) => {
            return await ProductService.getAllProducts(args);
        },
        productById: async (parent, args) => {
            return await ProductService.getProductById(args.id);
        },
        searchByName: async (parent, args) => {
            return await ProductService.searchByName(args.name);
        }
    },

    // MUTATIONS
    Mutation: {
        addProduct: async (parent, args, context) => {

            if (!context.user) {
                throw new GraphQLError('Debes estar autenticado para crear productos.', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            return await ProductService.createProduct(args);
        },
        updateProduct: async (parent, { id, ...updates }, context) => {
            if (!context.user) {
                throw new GraphQLError('Debes estar autenticado para actualizar productos.', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }
            // Desestructuramos para separar el ID de los datos a actualizar
            return await ProductService.updateProduct(id, updates);
        },
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