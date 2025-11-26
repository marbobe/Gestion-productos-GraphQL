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
        addProduct: async (parent, args) => {
            return await ProductService.createProduct(args);
        },
        updateProduct: async (parent, { id, ...updates }) => {
            // Desestructuramos para separar el ID de los datos a actualizar
            return await ProductService.updateProduct(id, updates);
        },
        deleteProduct: async (parent, args) => {
            return await ProductService.deleteProduct(args.id);
        }
    }
};

module.exports = productResolvers;