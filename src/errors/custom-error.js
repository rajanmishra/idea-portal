'use strict';

/**
 * Creates a custom error type to be used, when throwing and checking errors.
 *
 * @param extendClass one of the members of group of errors, that extend GetirError
 * @param klass the name of the class to be created
 * @param level the level for the error
 * @param message the message for the error instances to have
 * @param code the unique code for the error
 * @param statusCode the status code to use when responding to http requests
 * @returns {*}
 */
const createCustomErrorType = ({
  extendClass, klass, level, message, code, statusCode,
}) => ({
  [klass]:
    class extends extendClass {
      constructor(data) {
        super(level, message, code, data, statusCode);
      }
    },
}[klass]);

module.exports = {
  createCustomErrorType,
};
