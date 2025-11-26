const Product = require('../models/Product');

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
     * Crea un nuevo producto en la base de datos.
     */
    async createProduct(productData) {
        const newProduct = new Product(productData);
        return await newProduct.save();
    }

    /**
     * Actualiza un producto existente.
     */
    async updateProduct(id, updateData) {
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