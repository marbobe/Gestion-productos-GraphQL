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
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                return Product.findById(args.id);
            }
        },
        //obtener lista de productos por nombre
        searchByName: {
            type: ProductType,
            args: {
                name: { type: GraphQLString }
            },
            resolve(parent, args) {
                if (!args.name) {
                    return Product.find({});
                }
                return Product.find({ name: { $regex: args.name, $options: 'i' } });
            }
        }
    }
});

const RootMutation = new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
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
        },
        updateProduct: {
            type: ProductType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                name: { type: GraphQLString },
                description: { type: GraphQLString },
                price: { type: GraphQLFloat },
                stock: { type: GraphQLInt },
            },
            resolve(parent, args) {
                return Product.findByIdAndUpdate(
                    args.id,
                    { $set: args },
                    { new: true }
                )
            }
        },
        deleteProduct: {
            type: ProductType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                return Product.findByIdAndDelete(args.id);
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation,
})