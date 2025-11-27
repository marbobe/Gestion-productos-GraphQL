const Product = require('../models/Product');
const { GraphQLError } = require('graphql');
const logger = require('../utils/logger');

/**
 * Service Layer para Productos.
 * Encapsula toda la interacción con la base de datos Mongoose.
*/
class ProductService {
    /**
     * Helper privado para validar reglas de negocio.
     * Lanza un error si los datos no son válidos.
     */
    _validateProductData(data) {
        //los precios no pueden ser negativos
        if (data.price !== undefined && data.price < 0) {
            throw new GraphQLError('El precio no puede ser negativo', {
                extensions: {
                    code: 'BAD_USER_INPUT', //codigo estandar Apollo errores
                    argumentName: 'price'
                }
            });
        }
        //El stock no puede ser negativo
        if (data.stock !== undefined && data.stock < 0) {
            throw new GraphQLError('El stock no puede ser negativo', {
                extensions: {
                    code: 'BAD_USER_INPUT', //codigo estandar Apollo errores
                    argumentName: 'stock'
                }
            });
        }
        // El nombre no puede estar vacío (si se envía)
        if (data.name !== undefined && data.name.trim().length === 0) {
            throw new GraphQLError('El nombre del producto no puede estar vacío.', {
                extensions: {
                    code: 'BAD_USER_INPUT', //codigo estandar Apollo errores
                    argumentName: 'name'
                }
            });
        }
    }

    /**
     * Helper para manejar errores de la BD de forma centralizada.
     */
    _handleError(error) {
        logger.error(`Error en ProductService: ${error.message}`, { stack: error.stack });
        //Error de duplicado (unique: true)
        if (error.code === 11000) {
            throw new GraphQLError('Ya existe un producto con ese nombre,', {
                extensions: {
                    code: 'ALREADY_EXISTS',
                    argumentName: 'Name'
                }
            });
        }

        //Error de formato de ID (muy corto o caracteres inválidos)
        if (error.name === 'CastError') {
            throw new GraphQLError('El ID proporcionado no tiene un formato válido', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    argumentName: 'id'
                }
            });
        }

        throw error;

    }


    //------------------QUERIES----------------------------

    /**
     * Obtiene una lista de productos con filtros y ordenamiento opcionales.
     * @param {Object} args - Argumentos de filtro (stockMin, sortBy)
     */
    async getAllProducts({ stockMin, sortBy, limit, offset }) {
        try {
            let filter = {};

            // Lógica de Negocio: Filtro por Stock
            if (stockMin) {
                filter.stock = { $gte: stockMin };
            }

            let query = Product.find(filter);

            // Lógica de Negocio: Ordenamiento
            if (sortBy === 'price_asc') {
                query = query.sort({ price: 1 });
            } else if (sortBy === 'price_desc') {
                query = query.sort({ price: -1 });
            }

            //Paginación, si viene se usa.
            const finalLimit = limit || 50;
            const finalOffset = offset || 0;

            query = query.limit(finalLimit).skip(finalOffset);

            return await query;
        } catch (error) {
            this._handleError(error);
        }
    }

    /**
     * Busca un producto por su ID.
     */
    async getProductById(id) {
        try {
            const product = await Product.findById(id);

            if (!product) {
                throw new GraphQLError('Producto no encontrado.', {
                    extensions: { code: 'NOT_FOUND' }
                });
            }
            return product;
        } catch (error) {
            this._handleError(error);
        }
    }

    /**
     * Busca productos por nombre (búsqueda parcial).
     */
    async searchByName(name) {

        try {
            if (!name) {
                return await Product.find({});
            }
            // Lógica de Negocio: Búsqueda insensible a mayúsculas
            return await Product.find({ name: { $regex: name, $options: 'i' } });
        } catch (error) {
            this._handleError(error);
        }
    }

    //------------------MUTATIONS----------------------------


    /**
     * Crea un nuevo producto en la base de datos.
     */
    async createProduct(productData) {
        this._validateProductData(productData);

        try {
            const newProduct = new Product(productData);
            return await newProduct.save();
        } catch (error) {
            this._handleError(error);
        }
    }

    /**
     * Actualiza un producto existente.
     */
    async updateProduct(id, updateData) {
        this._validateProductData(updateData);

        try {

            // { new: true } devuelve el objeto ya modificado
            const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
            if (!product) {
                throw new GraphQLError('No se ha podido actualizar: Producto no encontrado.', {
                    extensions: { code: 'NOT_FOUND' }
                });
            }
            return product;
        } catch (error) {
            this._handleError(error);
        }
    }

    /**
     * Elimina un producto por ID.
     */
    async deleteProduct(id) {
        try {

            const product = await Product.findByIdAndDelete(id);
            if (!product) {
                throw new GraphQLError('Producto no encontrado.', {
                    extensions: { code: 'NOT_FOUND' }
                });
            }
            return product;
        } catch (error) {
            this._handleError(error);
        }
    }
}

// Exportamos una INSTANCIA de la clase (Singleton pattern)
module.exports = new ProductService();