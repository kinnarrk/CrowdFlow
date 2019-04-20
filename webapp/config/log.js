// var winston = require('winston');
// var appRoot = require('app-root-path');
// var logger = new (winston.Logger)({
//   transports: [
//     new (winston.transports.Console)({ json: false, timestamp: true }),
//     new winston.transports.File({ filename: __dirname + '/debug.log', json: false })
//   ],
//   exceptionHandlers: [
//     new (winston.transports.Console)({ json: false, timestamp: true }),
//     new winston.transports.File({ filename: __dirname + '/exceptions.log', json: false })
//   ],
//   exitOnError: false
// });


// const { createLogger, format, transports } = require('../');

// const logger = createLogger({
//   level: 'info',
//   format: format.combine(
//     format.timestamp({
//       format: 'YYYY-MM-DD HH:mm:ss'
//     }),
//     format.errors({ stack: true }),
//     format.splat(),
//     format.json()
//   ),
//   defaultMeta: { service: 'your-service-name' },
//   transports: [
//     //
//     // - Write to all logs with level `info` and below to `combined.log`
//     // - Write all logs error (and below) to `error.log`.
//     //
//     new transports.File({ filename: 'quick-start-error.log', level: 'error' }),
//     new transports.File({ filename: 'quick-start-combined.log' })
//   ]
// });
// module.exports = logger;

// var options = {
//     file: {
//       level: 'info',
//       filename: `${appRoot}/logs/app.log`,
//       handleExceptions: true,
//       json: true,
//       maxsize: 5242880, // 5MB
//       maxFiles: 5,
//       colorize: false,
//     },
//     console: {
//       level: 'debug',
//       handleExceptions: true,
//       json: false,
//       colorize: true,
//     },
//   };

//   var logger = new winston.Logger({
//     transports: [
//       new winston.transports.File(options.file),
//       new winston.transports.Console(options.console)
//     ],
//     exitOnError: false, // do not exit on handled exceptions
//   });

//   logger.stream = {
//     write: function(message, encoding) {
//       logger.info(message);
//     },
//   };

//   module.exports = logger;



const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const logDir = 'log';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const filename = path.join(logDir, 'results.log');

const logger = createLogger({
  // change level if in dev environment versus production
  level: env === 'development' ? 'debug' : 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.Console({
      level: 'info',
      format: format.combine(
        format.colorize(),
        format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}`
        )
      )
    }),
    new transports.File({ filename })
  ]
});

module.exports = logger;