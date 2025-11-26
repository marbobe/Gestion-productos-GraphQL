const Product = require('../models/Product');
const { GraphQLError } = require('graphql');

/**
 * Service Layer para Productos.
 * Encapsula toda la interacción con la base de datos Mongoose.
 */
class ProductService {

    /**
     * Obtiene una lista de productos con filtros y ordenamiento opcionales.
     * @param {Object} args - Argumentos de filtro (stockMin, sortBy)
     */
    async getAllProducts({ stockMin, sortBy }) {
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

        return await query;
    }

    /**
     * Busca un producto por su ID.
     */
    async getProductById(id) {
        return await Product.findById(id);
    }

    /**
     * Busca productos por nombre (búsqueda parcial).
     */
    async searchByName(name) {
        if (!name) {
            return await Product.find({});
        }
        // Lógica de Negocio: Búsqueda insensible a mayúsculas
        return await Product.find({ name: { $regex: name, $options: 'i' } });
    }

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
        if (data.stock !== undefinde && data.stock < 0) {
            throw new Error('El stock no puede ser negativo', {
                extensions: {
                    code: 'BAD_USER_INPUT', //codigo estandar Apollo errores
                    argumentName: 'stock'
                }
            });
        }
        // El nombre no puede estar vacío (si se envía)
        if (data.name !== undefined && data.name.trim().length === 0) {
            throw new Error('El nombre del producto no puede estar vacío.', {
                extensions: {
                    code: 'BAD_USER_INPUT', //codigo estandar Apollo errores
                    argumentName: 'name'
                }
            });
        }
    }

    /**
     * Crea un nuevo producto en la base de datos.
     */
    async createProduct(productData) {
        this._validateProductData(productData);
        const newProduct = new Product(productData);
        return await newProduct.save();
    }

    /**
     * Actualiza un producto existente.
     */
    async updateProduct(id, updateData) {
        this._validateProductData(productData);
        // { new: true } devuelve el objeto ya modificado
        return await Product.findByIdAndUpdate(id, updateData, { new: true });
    }

    /**
     * Elimina un producto por ID.
     */
    async deleteProduct(id) {
        return await Product.findByIdAndDelete(id);
    }
}

// Exportamos una INSTANCIA de la clase (Singleton pattern)
module.exports = new ProductService();