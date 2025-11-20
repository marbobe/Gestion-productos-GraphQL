const express = require('express');
const { createHandler } = require('graphql-http/lib/use/express');
const mongoose = require('mongoose');
const schema = require('./schema/schema');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware para parsear JSON 
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://db:27017/productos_db';

// Conexión a MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Conexión a MongoDB exitosa'))
    .catch(err => console.error('Error en la conexión a MongoDB', err.message));


// Configuración de la ruta /graphql, unico endpoint GraphQL
app.use('/graphql', createHandler({
    context: (req) => ({ req }),
    schema: require('./schema/schema')
}));


app.listen(PORT, () => {
    console.log(`Servidor Express/GraphQL en http://localhost:${PORT}/graphql`)
})