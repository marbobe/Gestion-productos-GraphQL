const winston = require('winston');

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// En producción solo queremos ver avisos y errores (warn), no todo el ruido (debug)
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    return env === 'development' ? 'debug' : 'warn';
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

winston.addColors(colors);

// Formato del log
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    process.env.NODE_ENV === 'production'
        ? winston.format.json()
        : winston.format.colorize({ all: true }),

    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
);

const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports: [
        new winston.transports.Console(),
    ],
});

module.exports = logger;