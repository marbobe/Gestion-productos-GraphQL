/**
 * @file seed.js
 * @description Script de automatización para poblar la base de datos (Database Seeding).
 * * Propósito:
 * 1. Limpiar la colección de productos existente (Reset).
 * 2. Insertar datos de prueba iniciales (Mock Data).
 * * @module scripts/seed
 */

const mongoose = require('mongoose');
const path = require('path');
const Product = require('../src/models/Product');

const productData = require(path.join(__dirname, '../src/data/products.json'));
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;


/**
 * Función principal asíncrona para ejecutar el semillado.
 * Maneja el ciclo de vida completo: Conexión -> Limpieza -> Inserción -> Cierre.
 */
const seedDB = async () => {

    if (process.env.NODE_ENV === 'production') {
        console.error('PELIGRO: Intentando ejecutar seed en entorno de PRODUCCIÓN. Operación cancelada.');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI);
        console.log('Conexión a MongoDB correcta para Seeding');

        await Product.deleteMany({});
        console.log('Colección de productos limpiada');

        await Product.insertMany(productData);
        console.log('Datos de prueba insertados con éxito');

        process.exit(0);

    } catch (error) {
        console.error('Error durante el Seeding: ', error);

        if (error.code === 11000) {
            console.error('Verifica que el campo "name" no ha causado un error de unicidad');
        }

        process.exit(1);

    } finally {
        await mongoose.connection.close();
        console.log('Desconexión de MongoDB');
    }
};

seedDB();