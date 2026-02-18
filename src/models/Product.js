
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Esquema de Mongoose para la colección de Productos.
 * @type {mongoose.Schema}
 */
const ProductSchema = new Schema({
    /**
     * Nombre del producto.
     * Debe ser único en la base de datos.
     * Se eliminan los espacios en blanco al inicio y final (trim).
     */
    name: {
        type: String,
        required: [true, 'El nombre del producto es obligatorio'],
        unique: true,
        trim: true
    },

    /**
     * Descripción detallada del producto.
     * Es opcional.
     */
    description: {
        type: String,
        required: false,
        trim: true
    },

    /**
     * Precio unitario del producto.
     * No puede ser un valor negativo.
     */
    price: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },

    /**
     * Cantidad de stock disponible.
     * Debe ser un número entero y no negativo.
     */
    stock: {
        type: Number,
        required: [true, 'El stock es obligatorio'],
        min: [0, 'El stock no puede ser negativo'],
        validate: {
            validator: Number.isInteger,
            message: 'El stock debe ser un número entero'
        }
    },
    /**
     * Fecha de creación del producto.
     */
    createdAt: {
        type: Date,
        default: Date.now
    }
});

/**
 * Modelo de Producto compilado a partir del esquema.
 * Provee la interfaz para interactuar con la colección "products" en MongoDB.
 * @type {mongoose.Model}
 */
module.exports = mongoose.model('Product', ProductSchema);