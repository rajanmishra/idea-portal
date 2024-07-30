'use strict';

module.exports = {
  catcher: ({ Sentry, logger }) => (
    (error, extra, level = 'error') => {
      const isError = (error instanceof Error);
      const message = isError ? error.message : error;

      Sentry.withScope((scope) => {
        scope.setLevel(level);
        scope.setExtras(extra);

        if (isError) {
          Sentry.captureException(error);
        }
        else {
          Sentry.captureMessage(message);
        }
      });

      logger.log(level, message, extra);
    }
  ),
};
