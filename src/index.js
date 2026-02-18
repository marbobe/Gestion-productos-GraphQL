/**
 * @file index.js
 * @description Punto de entrada principal de la aplicación. Configura y levanta el servidor Apollo GraphQL
 * y establece la conexión con la base de datos MongoDB.
 * @author Mar
 * @version 1.0.0
 */

const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { typeDefs, resolvers } = require('./schema');
const logger = require('./utils/logger');

/**
 * Puerto en el que escuchará el servidor.
 * @constant {number|string}
 */
const PORT = process.env.PORT || 4000;

/**
 * Cadena de conexión a la base de datos MongoDB.
 * @constant {string}
 */
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/default_db';


/**
 * Instancia del servidor Apollo.
 * Configurada con los esquemas, resolvers y manejo de errores personalizado.
 * @type {ApolloServer}
 */
const server = new ApolloServer({
    typeDefs,
    resolvers,
    /**
     * Formatea los errores antes de enviarlos al cliente.
     * En producción, oculta los detalles de errores internos (stack trace) por seguridad.
     * * @param {import('graphql').GraphQLError} formattedError - El error ya formateado por Apollo.
     * @param {unknown} error - El error original lanzado.
     * @returns {import('graphql').GraphQLFormattedError} Error sanitizado.
     */
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

/**
 * Inicia la conexión a la base de datos y arranca el servidor Apollo.
 * @async
 * @function startServer
 * @throws {Error} Si falla la conexión a la base de datos o el arranque del servidor.
 */
async function startServer() {
    try {
        await mongoose.connect(MONGO_URI)
        logger.info('✅ Conexión a MongoDB exitosa');

        // startStandaloneServer crea internamente un servidor Express básico.
        const { url } = await startStandaloneServer(server, {
            listen: { port: PORT },

            /**
             * Función de contexto que se ejecuta en cada petición.
             * Maneja la autenticación y pasa información del usuario a los resolvers.
             * * @param {Object} ctx - Contexto de la petición HTTP.
             * @param {import('http').IncomingMessage} ctx.req - Objeto Request de Node.js.
             * @returns {Promise<Object>} Objeto de contexto disponible en los resolvers.
             */
            context: async ({ req, res }) => {
                const token = req.headers.authorization || '';

                const user = token === 'soyeladmin' ? { id: 1, role: 'ADMIN', name: 'Super Admin' } : null;

                return { user };
            }
        });
        logger.info(`Server ready at ${url}`);
        logger.info(`Explore at http://localhost:${PORT}/`);
    } catch (error) {
        logger.error(`❌ Error fatal al iniciar el servidor: ${error.message}`);
        process.exit(1);
    }
}

startServer();
