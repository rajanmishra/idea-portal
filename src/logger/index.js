'use strict';

const util = require('util');
const winston = require('winston');

const { log: { prettyLoggingDepth } } = require('../config')();

const createErrorReplacer = (fieldsToIgnore = []) => ((_, value) => {
  if (value instanceof Buffer) {
    return value.toString('base64');
  }

  if (value instanceof Error) {
    return (
      Object.entries(value)
        .filter(([innerKey]) => !fieldsToIgnore.includes(innerKey))
        .reduce((acc, [innerKey, innerValue]) => ({
          ...acc,
          [innerKey]: innerValue,
        }), {})
    );
  }

  return value;
});

const formatLogArgsToPrettify = (args) => {
  const {
    $logOptions,
    requestId,
    message,
    level,
    ...rest
  } = args;

  return {
    ...rest,
    ...(Object.keys(winston.config.cli.levels).includes(level) ? {} : { level }), // ensures that the about to be printed level is not a winston package level
  };
};

const prettyLoggingFormat = (info) => {
  const { timestamp, message } = info;
  const messageArgs = JSON.parse(info[Symbol.for('message')]);
  const depth = messageArgs?.$logOptions?.depth ?? prettyLoggingDepth;
  const args = formatLogArgsToPrettify(messageArgs);

  let prettifiedMessage = message;
  if (typeof message === 'object') {
    prettifiedMessage = util.inspect(message, { depth, compact: false });
  }

  let prettifiedArgs = '';
  if (Object.keys(args).length > 0) {
    prettifiedArgs = util.inspect(args, { depth, compact: false });
  }

  /*
  When log data includes level information as below example, it creates an error
  since level is different than log levels(info,debug,error etc.)

  logger.debug('message', { level: 1, name: 'microservice-template' }
  In this example, although log level equals to debug, it is overridden by 1 with.
  In order to eliminate this error, we obtain level information using Symbol definition.
 */
  return {
    level: info[Symbol.for('level')],
    message: `[${timestamp}]: ${prettifiedMessage}\n${prettifiedArgs}`,
  };
};

module.exports = {
  logger: ({ config: { log: logConfig } }) => {
    const {
      name, version, env, isPrettyLoggingEnabled, level,
    } = logConfig;

    const {
      format: {
        combine, json, prettyPrint, splat, simple, timestamp,
      },
      transports: { Console },
    } = winston;

    if (isPrettyLoggingEnabled) {
      return winston.createLogger({
        level,
        format: winston.format.combine(
          prettyPrint(),
          splat(),
          simple(),
          json({
            replacer: createErrorReplacer(['output', 'isBoom', 'isServer', 'data']),
          }),
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
          winston.format.printf((info) => {
            const { level: logLevel, message } = prettyLoggingFormat(info);

            return winston.format.colorize().colorize(logLevel, message);
          }),
        ),
        transports: [
          new Console(),
        ],
      });
    }

    return winston.createLogger({
      level,
      format: combine(
        timestamp(),
        json({
          replacer: createErrorReplacer(['output', 'isBoom', 'isServer', 'data']),
        }),
      ),
      defaultMeta: {
        name,
        version,
        env,
      },
      transports: [
        new Console(),
      ],
    });
  },
  _createErrorReplacer: createErrorReplacer,
  _formatLogArgsToPrettify: formatLogArgsToPrettify,
  _prettyLoggingFormat: prettyLoggingFormat,
};
