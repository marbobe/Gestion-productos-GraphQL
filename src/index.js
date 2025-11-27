const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const { typeDefs, resolvers } = require('./schema');

const PORT = process.env.PORT || 4000;


const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/default_db';

// Conexión a MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Conexión a MongoDB exitosa'))
    .catch(err => console.error('Error en la conexión a MongoDB', err.message));


// Inicializar Apollo Server
const server = new ApolloServer({
    typeDefs, // Usamos la definición de tipos
    resolvers, // Usamos los resolvers
    formatError: (formattedError, error) => {
        if (formattedError.extensions.code !== 'INTERNAL_SERVER_ERROR') {
            return formattedError;
        }

        const isProduction = process.env.NODE_ENV === 'production';

        if (isProduction) {
            return {
                message: "Ocurrió un error interno en el servidor.",
                extensions: {
                    code: 'INTERNAL_SERVER_ERROR'
                }
            };
        }

        return formattedError;
    }
});

// Arrancar servidor
async function startServer() {
    // startStandaloneServer arranca un servidor Express ligero automáticamente.
    const { url } = await startStandaloneServer(server, {
        listen: { port: PORT },
        // context: Se usará más adelante para autenticación.
        context: async ({ req, res }) => ({
            // Podríamos inyectar aquí la sesión o el modelo
            // Esto es solo un placeholder, la lógica la añadiremos después.
        })
    });
    console.log(`Server ready at ${url}`);
    console.log(`Explore at http://localhost:${PORT}/`);
}

startServer();
