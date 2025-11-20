const mongoose = require('mongoose');
const Product = require('./models/Product');
const productData = require('./data/products.json');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://db:27017/productos_db';

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Conexión a MongoDB correcta para Seeding');

        await Product.deleteMany({});
        console.log('Colección de productos limpiada');

        await Product.insertMany(productData);
        console.log('Datos de prueba insertados con éxito');

    } catch (error) {
        console.error('Error durante el Seeding: ', error);

        console.error('Verifica que el campo "name" no ha causado un error de unicidad');
    } finally {
        await mongoose.connection.close();
        console.log('Desconexión de MongoDB');
    }
};

seedDB();