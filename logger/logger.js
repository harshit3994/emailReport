var winston = require('winston');



var logger = new winston.Logger({
    transports: [
        new winston.transports.DailyRotateFile({
            level: 'debug',
            datePattern: '.yyyy-MM-dd',
            filename: 'sendemail.log',
            dirname: __dirname + '/../logs',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: true,
            timestamp: true,
            name: 'email-log'
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true,
            name: 'email-console'
        })
    ],
    exitOnError: false
});


module.exports = {
    'successlog': logger
};