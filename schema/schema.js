const { GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLID, GraphQLNonNull } = require('graphql');
const Product = require('../models/Product');


const ProductType = new GraphQLObjectType({
    name: 'Producto',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        price: { type: GraphQLFloat },
        stock: { type: GraphQLInt },
        createdAt: { type: GraphQLString },
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        //obtener todos los productos
        products: {
            type: new GraphQLList(ProductType),
            resolve(parent, args) {
                return Product.find({})
            }
        },
        //obtener un producto por id
        product: {
            type: ProductType,
            resolve(parent, args) {
                return Product.findById(args.id);
            }
        }
    }
});

const RootMutation = new GraphQLObjectType({
    name: 'RootMutationType',
    addProduct: {
        type: ProductType,
        args: {
            name: { type: new GraphQLNonNull(GraphQLString) },
            description: { type: GraphQLString },
            price: { type: new GraphQLNonNull(GraphQLFloat) },
            stock: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve(parent, args) {
            let product = new Product({
                name: args.name,
                description: args.description,
                price: args.price,
                stock: args.stock,

            });
            return product.save();
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation,
})