'use strict';

const { pipe, isNil } = require('ramda');
const { generateMD5Hash } = require('../utils');

/*
 WARNINGS:
 - This cache logic made for storing JSON values as strings with regular SET method of the redis, so be aware that it will stringify
 the response came from the service before storing it and it will parse it after reading it.
 - By adding this plugin, we also created a new dependency for another redis instance for caching.
 - This plugin mutates the `cache` object we specified in the routes by adding `_isReturnedFromCache` key to it, so don't use that key.
 */

/**
 * @typedef {{ enabled: boolean, ttl: number }} RouteCacheOptions
 */

/**
 * Returns the path and querystring from the request url.
 * @param url
 * @returns {string} Example: /test?foo=bar&baz=10
 */
const getPathWithQueryFromURL = ({ url }) => {
  const { pathname, search } = new URL(url);

  return `${pathname}${search}`;
};

const generateCacheKey = pipe(
  getPathWithQueryFromURL,
  generateMD5Hash,
);

/**
 * Checks if the conditions are met for the caching by checking if the options are specified in the routes and the method is allowed.
 * @param {string} method
 * @param {RouteCacheOptions} routeCacheOptions
 * @returns {boolean}
 */
const isCachingEnabledAndPossible = (method, routeCacheOptions) => {
  const allowedHTTPMethods = ['GET'];
  const { enabled: isCacheEnabled } = routeCacheOptions || {};

  return !isNil(routeCacheOptions) && isCacheEnabled && allowedHTTPMethods.includes(method.toUpperCase());
};

const isResponseCachable = (response, isReturnedFromCache, isBoom) => (!(response instanceof Error) && !isReturnedFromCache && !isBoom);

const isCachingPossibleForResponse = (method, routeCacheOptions, response, isReturnedFromCache, isBoom) => (
  isCachingEnabledAndPossible(method, routeCacheOptions) && isResponseCachable(response, isReturnedFromCache, isBoom)
);

const Cache = ({ captureException }, redisCache) => ({
  name: 'cache',
  version: '0.0.1',
  register(server) {
    server.ext('onPreHandler', async (req, h) => {
      const {
        method,
        route: { settings: { plugins: { cache: routeCacheOptions } } },
      } = req;
      // early exit in case caching is not specified in the route or the HTTP method is not allowed
      if (!isCachingEnabledAndPossible(method, routeCacheOptions)) return h.continue;

      const cacheKey = generateCacheKey(req);
      const redisResponse = await redisCache.get(cacheKey).catch((err) => {
        // throw the error with sentry but don't terminate
        captureException(err);
        // return null so the plugin will continue to work like the cache was empty
        return null;
      });
      const parsedRedisResponse = JSON.parse(redisResponse);
      const isReturnedFromCache = !isNil(parsedRedisResponse);
      // mutate the cache object by adding isReturnedFromCache
      req.route.settings.plugins.cache = { ...routeCacheOptions, _isReturnedFromCache: isReturnedFromCache };
      if (!isReturnedFromCache) return h.continue;

      return h.response(parsedRedisResponse).takeover();
    });
    server.ext('onPreResponse', (req, h) => {
      const {
        method,
        response: { source, isBoom = false },
        route: { settings: { plugins: { cache = {} } } },
      } = req;
      const { _isReturnedFromCache: isReturnedFromCache, ttl } = cache;
      // early exit in case caching is not allowed or the response is returned from the cache already or an error occurred
      if (!isCachingPossibleForResponse(method, cache, source, isReturnedFromCache, isBoom)) return h.continue;

      const responseValue = JSON.stringify(source);
      const cacheKey = generateCacheKey(req);
      // 'PX' sets the time to live in milliseconds
      redisCache.set(cacheKey, responseValue, { PX: ttl }).catch(captureException);
      return h.continue;
    });
  },
});

module.exports = ({ Sentry, RedisCache }) => ([
  Cache(Sentry, RedisCache),
]);
