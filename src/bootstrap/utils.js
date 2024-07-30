'use strict';

const { asClass, asFunction, asValue } = require('awilix');
const path = require('path');
const R = require('ramda');
const { readdirSync } = require('fs');

/**
 * @typedef {function(): Promise<Error[]>} StopFunction
 */

const isClass = (fn) => /^\s*class/.test(fn.toString());
const isFunction = (v) => v.constructor === Function;

// decide what to register the value as to the awilix
const getAwilixRegisterValue = (registerValue) => {
  if (isClass(registerValue)) return asClass(registerValue);
  if (isFunction(registerValue)) return asFunction(registerValue);
  return asValue(registerValue);
};

// get the file name from the given absolute/relative path
const getFileName = (filePath) => path.basename(filePath, path.extname(filePath));
// make kebab case to camel case
const kebabToCamel = (str) => str.replace(/-([a-z])/gi, ($0, $1) => $1.toUpperCase());
// make the first char of the given string uppercase
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
// appends the first string to the one second one
const appendString = R.curry((str) => R.flip(R.concat)(str));
// format name by capitalizing the file name
const formatCapitalized = R.pipe(getFileName, capitalize);
// format name by capitalizing and appending string to the file name
const formatCapitalizedWithAppend = (str) => R.pipe(getFileName, kebabToCamel, capitalize, appendString(str));

/**
 * Given a container, directory and a formatter from file name to dependency name,
 * resolves each of the files in the folder as a dependency, and concats them to
 * a single array
 */
const resolveDirectoryToArray = R.curry((container, directoryPath, formatName, disabledDependencies = []) => {
  // resolve each dependency in the directory, and put them into a single array
  const routePaths = readdirSync(directoryPath);

  return R.pipe(
    R.map(formatName),
    R.filter((p) => !disabledDependencies.includes(p)),
    R.map(container.resolve),
    R.reduce(R.concat, []),
  )(
    routePaths,
  );
});

/**
 * Require given directory and return the required ones
 * @param directoryPath
 * @returns {Function}
 */
const requireDirectory = (directoryPath) => (
  // eslint-disable-next-line
  R.reduce(R.concat, [], R.map(f => require(path.join(directoryPath, f)), readdirSync(directoryPath)))
);

const bindAndGetFunctions = (component) => {
  const { start, stop, register } = component;

  return {
    start: start ? start.bind(component) : undefined,
    stop: stop ? stop.bind(component) : undefined,
    register: register ? register.bind(component) : undefined,
  };
};

const makeBootstrapComponent = (componentFunc) => async (container) => {
  const scoped = container.createScope();
  scoped.register('component', asFunction(componentFunc));
  return scoped.resolve('component');
};

// does nothing
const asyncNoop = async () => { };

/**
 * Given handles creates a single function that stops all components.
 * Resolves list of errors that happened when trying to stop components.
 * @param stopHandles
 * @returns {StopFunction}
 */
const createComponentStopFunction = (stopHandles, { logger }) => () => (
  stopHandles
    .reduce(
      (stopChain, { handle: stopHandle, key: component }) => (
        stopChain
          .then((acc) => {
            logger.info('stopping component', { component });
            return (
              Promise
                .resolve()
                .then(() => stopHandle())
                .then(() => {
                  logger.info('component stopped successfully', { component });
                  return acc;
                })
                .catch((err) => {
                  logger.error('error happened when stopping component ', err);
                  return [err, ...acc];
                })
            );
          })
      ),
      Promise.resolve([]),
    )
);

/**
 * Given a container, and an object of components to resolve,
 * initialize each component with failure safe bootstrapping
 * then returns a new container and a stop function
 * @param container
 * @param bootstrap
 * @returns {Promise<{scopedContainer, stop: StopFunction}>}
 */
const bootstrapWithContainer = async (container, bootstrap) => {
  const logger = container.resolve('logger');
  const componentsToBootstrap = Object.keys(bootstrap);
  // bootstrap each of the given component
  const { err, stopHandles } = await componentsToBootstrap.reduce(
    async (accPromise, component) => {
      const acc = await accPromise;
      // if there is any error, don't do further bootstrapping
      if (acc.err) return acc;
      const resolveFunc = bootstrap[component];

      try {
        // get start and stop handles
        const { start, stop, register } = bindAndGetFunctions(await resolveFunc(container));
        // start and get the resolved value for the component
        await (start || asyncNoop)();
        logger.info('started component', { component });

        // register component to *real* container, if there is a value
        if (register && typeof register === 'function') {
          // for result
          container.register(component, getAwilixRegisterValue(register()));
        }

        return {
          // last one to initialize should be first to be stopped
          stopHandles: stop ? [{ handle: stop, key: component }, ...acc.stopHandles] : acc.stopHandles,
        };
      }
      catch (errEx) {
        errEx.key = component;
        return { ...acc, err: errEx };
      }
    },
    { stopHandles: [] },
  );

  // if there were any errors whilst bootstrapping,
  if (err) {
    // stop the bootstrapped components,
    await createComponentStopFunction(stopHandles, { logger })();

    // and throw the error
    throw err;
  }

  return {
    scopedContainer: container,
    stop: createComponentStopFunction(stopHandles, { logger }),
  };
};

module.exports = {
  formatCapitalized,
  formatCapitalizedWithAppend,
  resolveDirectoryToArray,
  requireDirectory,
  makeBootstrapComponent,
  bootstrapWithContainer,
};
