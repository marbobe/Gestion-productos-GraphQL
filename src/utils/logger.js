/**
 * @file logger.js
 * @description Configuración centralizada del sistema de logs usando Winston.
 * Genera logs estructurados (JSON) en producción para sistemas de monitoreo,
 * y logs coloreados y legibles en consola para desarrollo.
 * @module utils/logger
 */

const winston = require('winston');

/**
 * Define la severidad de los niveles de log.
 * Winston usa npm levels por defecto, pero definirlos explícitamente es buena práctica.
 * Menor número = Mayor prioridad.
 * @constant {Object}
 */
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

/**
 * Determina el nivel de detalle de los logs basándose en el entorno.
 * @returns {string} Nivel mínimo a registrar ('warn' en prod, 'debug' en dev).
 */
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    return env === 'development' ? 'debug' : 'warn';
};

/**
 * Colores asociados a cada nivel para la consola en modo desarrollo.
 * @constant {Object}
 */
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

winston.addColors(colors);

/**
 * Formato para el entorno de Desarrollo (Texto plano, legible, coloreado).
 */
const devFormat = winston.format.combine(

    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:SSS' }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    )
);

/**
 * Formato para Producción (JSON estructurado sin colores).
 */
const prodFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

/**
 * Instancia principal del Logger.
 * @type {winston.Logger}
 */
const logger = winston.createLogger({
    level: level(),
    levels,
    format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
    transports: [
        new winston.transports.Console(),
    ],
});

module.exports = logger;