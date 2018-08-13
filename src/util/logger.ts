const Winston = require('winston');
const Chalk = require('chalk');

const { combine, timestamp, label, printf } = Winston.format;

const style = (message, color) =>
    `${Chalk.cyan(message.timestamp)} ${Chalk[color](message.level)}: ${message.message}`;

const myFormat = printf((message) => {
    switch (message.level) {
        case 'info':
            return style(message, 'blue');
        case 'error':
            return style(message, 'red');
        case 'warn':
            return style(message, 'yellow');
        case 'silly':
            return style(message, 'gray');
        default:
            return style(message, 'blueBright');
    }
});

const format = combine(
    label(),
    timestamp(),
    myFormat
);

export const Logger = Winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: Winston.format.json(),
    transports: [
        new Winston.transports.Console({ format })
    ]
});

