'use strict';

const axios = require('axios');
const { faker } = require('@faker-js/faker');

const ServiceCaller = require('../../../src/utils/service-caller');
const StringUtil = require('../../../src/utils/string');
const ServiceCallerError = require('../../../src/errors/service-caller');
const { MICROSERVICE } = require('../../../src/constants/error-messages');

jest.mock('axios');
jest.mock('../../../src/utils/string', () => ({
  deepObjectIdToString: jest.fn(),
}));

describe('ServiceCaller class', () => {
  describe('generateErrorFunction function', () => {
    it(`should return generateServiceCallerError function definition that returns serviceCallerError with correct parameters as
    isOriginatedFromAnotherService true when message, code, data, status parameters are passed and code is different than default MICROSERVICE code`, () => {
      const code = faker.datatype.number({ min: 1 });
      const data = JSON.parse(faker.datatype.json());
      const status = faker.datatype.number({ min: 400, max: 599 });
      const message = faker.random.word();
      const microservice = faker.random.word();
      const request = {};

      const generateError = ServiceCaller.generateErrorFunction(microservice, request);

      const response = {
        data: {
          message,
          code,
          data,
        },
        status,
      };
      const serviceCallerError = generateError(response.data.message, response.data.code, response.data.data, response.status);

      expect(generateError).toEqual(expect.any(Function));
      expect(JSON.stringify(serviceCallerError)).toEqual(JSON.stringify(new ServiceCallerError({
        code,
        data,
        status,
        request,
        message,
        microservice,
        isOriginatedFromAnotherService: true,
      })));
    });

    it(`should return generateServiceCallerError function definition that returns serviceCallerError with correct parameters as
    isOriginatedFromAnotherService false when message, code, data, status parameters are passed and code is equal with default MICROSERVICE code`, () => {
      const { code } = MICROSERVICE;
      const data = JSON.parse(faker.datatype.json());
      const status = faker.datatype.number({ min: 400, max: 599 });
      const message = faker.random.word();
      const microservice = faker.random.word();
      const request = {};

      const generateError = ServiceCaller.generateErrorFunction(microservice, request);

      const response = {
        data: {
          message,
          code,
          data,
        },
        status,
      };
      const serviceCallerError = generateError(response.data.message, response.data.code, response.data.data, response.status);

      expect(generateError).toEqual(expect.any(Function));
      expect(JSON.stringify(serviceCallerError)).toEqual(JSON.stringify(new ServiceCallerError({
        code,
        data,
        status,
        request,
        message,
        microservice,
        isOriginatedFromAnotherService: false,
      })));
    });

    it(`should return generateServiceCallerError function definition that returns serviceCallerError with
    default MICROSERVICE message, MICROSERVICE code, and isOriginatedFromAnotherService true params when no parameter is passed`, () => {
      const { code, message } = MICROSERVICE;
      const microservice = faker.random.word();
      const request = {};

      const generateError = ServiceCaller.generateErrorFunction(microservice, request);
      const serviceCallerError = generateError();

      expect(JSON.stringify(serviceCallerError)).toEqual(JSON.stringify(new ServiceCallerError({
        code,
        request,
        message,
        microservice,
        isOriginatedFromAnotherService: false,
      })));
    });

    it(`should return generateServiceCallerError function definition that returns serviceCallerError with
    default MICROSERVICE code, and isOriginatedFromAnotherService params true when only message parameter is passed`, () => {
      const { code } = MICROSERVICE;
      const message = faker.random.word();
      const microservice = faker.random.word();
      const request = {};

      const generateError = ServiceCaller.generateErrorFunction(microservice, request);
      const serviceCallerError = generateError(message);

      expect(generateError).toEqual(expect.any(Function));
      expect(JSON.stringify(serviceCallerError)).toEqual(JSON.stringify(new ServiceCallerError({
        code,
        request,
        message,
        microservice,
        isOriginatedFromAnotherService: false,
      })));
    });
  });

  describe('request function when LOG_IS_PRETTY_LOGGING_ENABLED env is true and requestId exists', () => {
    const timeout = faker.datatype.number({ min: 10000, max: 100000 });
    const testMicroserviceURL = `${faker.internet.url()}/`;

    let config;
    let logger;
    let serviceCaller;
    let requestId;
    let generateErrorFunction;

    beforeAll(() => {
      config = {
        log: {
          isPrettyLoggingEnabled: true,
        },
        microservice: {
          urls: {
            testMicroserviceURL,
          },
          timeout,
        },
      };

      logger = {
        debug: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
      };

      requestId = faker.datatype.uuid();

      generateErrorFunction = jest.spyOn(ServiceCaller, 'generateErrorFunction');
      serviceCaller = new ServiceCaller({ config, logger, requestId });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return the response when the response status 200', async () => {
      const microservice = 'testMicroserviceURL';
      const method = faker.internet.httpMethod();
      const path = `${faker.random.word().toLowerCase()}/${faker.random.word().toLowerCase()}`;
      const body = JSON.parse(faker.datatype.json());
      const query = JSON.parse(faker.datatype.json());
      const header = JSON.parse(faker.datatype.json());

      const responseData = JSON.parse(faker.datatype.json());

      const requestParam = {
        microservice,
        method,
        path,
        body,
        query,
        header,
      };

      const axiosRequestParam = {
        method,
        url: `${testMicroserviceURL}${path}`,
        data: body,
        params: query,
        headers: { ...header, requestId },
        timeout,
        validateStatus: expect.any(Function),
      };

      const successResponse = {
        data: responseData,
        status: 200,
      };
      axios.mockImplementation(() => Promise.resolve(successResponse));

      StringUtil.deepObjectIdToString.mockImplementation(({ value }) => value);

      const response = await serviceCaller.request(requestParam);

      expect(StringUtil.deepObjectIdToString).toHaveBeenCalledWith({
        value: requestParam.query,
      });
      expect(generateErrorFunction).toHaveBeenCalledWith(microservice, axiosRequestParam);
      expect(generateErrorFunction.mock.calls[0][1].validateStatus()).toBe(true);
      expect(axios).toHaveBeenCalledWith(axiosRequestParam);
      expect(axios.mock.calls[0][0].validateStatus()).toBe(true);
      expect(logger.debug).toHaveBeenCalledWith(expect.anything(String), expect.anything(), { $logOptions: expect.anything() });
      expect(logger.debug.mock.calls.length).toEqual(1);
      expect(logger.info).toHaveBeenCalledWith(expect.anything(String), expect.anything(), { $logOptions: expect.anything() });
      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
      expect(response).toEqual(responseData);
    });

    it('should return the response with default parameters when body, query, header parameters are not passed and the response status is 200', async () => {
      const microservice = 'testMicroserviceURL';
      const method = faker.internet.httpMethod();
      const path = `${faker.random.word().toLowerCase()}/${faker.random.word().toLowerCase()}`;

      const responseData = JSON.parse(faker.datatype.json());

      const requestParam = {
        microservice,
        method,
        path,
      };

      const axiosRequestParam = {
        method,
        url: `${testMicroserviceURL}${path}`,
        data: {},
        params: {},
        headers: { requestId },
        timeout,
        validateStatus: expect.any(Function),
      };

      const successResponse = {
        data: responseData,
        status: 200,
      };
      axios.mockImplementation(() => Promise.resolve(successResponse));

      StringUtil.deepObjectIdToString.mockImplementation(({ value }) => value);

      const response = await serviceCaller.request(requestParam);

      expect(StringUtil.deepObjectIdToString).toHaveBeenCalledWith({
        value: {},
      });
      expect(generateErrorFunction).toHaveBeenCalledWith(microservice, axiosRequestParam);
      expect(generateErrorFunction.mock.calls[0][1].validateStatus()).toBe(true);
      expect(axios).toHaveBeenCalledWith(axiosRequestParam);
      expect(axios.mock.calls[0][0].validateStatus()).toBe(true);
      expect(logger.debug).toHaveBeenCalledWith(expect.anything(String), expect.anything(), { $logOptions: expect.anything() });
      expect(logger.debug.mock.calls.length).toEqual(1);
      expect(logger.info).toHaveBeenCalledWith(expect.anything(String), expect.anything(), { $logOptions: expect.anything() });
      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
      expect(response).toEqual(responseData);
    });

    it('should throw the microservice error when the response status is not 200 but also less than 400', async () => {
      const microservice = 'testMicroserviceURL';
      const method = faker.internet.httpMethod();
      const path = `${faker.random.word().toLowerCase()}/${faker.random.word().toLowerCase()}`;
      const body = JSON.parse(faker.datatype.json());
      const query = JSON.parse(faker.datatype.json());
      const header = JSON.parse(faker.datatype.json());

      const responseData = {
        ...JSON.parse(faker.datatype.json()),
        message: faker.random.word(),
        code: faker.datatype.number({ min: 1 }),
        data: JSON.parse(faker.datatype.json()),
      };

      const requestParam = {
        microservice,
        method,
        path,
        body,
        query,
        header,
      };

      const axiosRequestParam = {
        method,
        url: `${testMicroserviceURL}${path}`,
        data: body,
        params: query,
        headers: { ...header, requestId },
        timeout,
        validateStatus: expect.any(Function),
      };

      const errorResponse = {
        data: responseData,
        status: faker.datatype.number({ min: 201, max: 399 }),
      };
      axios.mockImplementation(() => Promise.resolve(errorResponse));

      StringUtil.deepObjectIdToString.mockImplementation(({ value }) => value);

      try {
        await serviceCaller.request(requestParam);
      }
      catch (serviceCallerError) {
        const { validateStatus, ...requestParamWithoutFunctionDefinition } = axiosRequestParam;
        expect(JSON.stringify(serviceCallerError)).toEqual(JSON.stringify(new ServiceCallerError({
          code: errorResponse.data.code,
          data: errorResponse.data.data,
          status: errorResponse.status,
          request: requestParamWithoutFunctionDefinition,
          message: errorResponse.data.message,
          microservice,
          isOriginatedFromAnotherService: true,
        })));
        expect(StringUtil.deepObjectIdToString).toHaveBeenCalledWith({
          value: requestParam.query,
        });
        expect(generateErrorFunction).toHaveBeenCalledWith(microservice, axiosRequestParam);
        expect(generateErrorFunction.mock.calls[0][1].validateStatus()).toBe(true);
        expect(axios).toHaveBeenCalledWith(axiosRequestParam);
        expect(axios.mock.calls[0][0].validateStatus()).toBe(true);
        expect(logger.debug).toHaveBeenCalledWith(expect.anything(String), expect.anything(), { $logOptions: expect.anything() });
        expect(logger.debug.mock.calls.length).toEqual(1);
        expect(logger.info).toHaveBeenCalledWith(expect.anything(String), expect.anything(), { $logOptions: expect.anything() });
        expect(logger.warn).not.toHaveBeenCalled();
        expect(logger.error).not.toHaveBeenCalled();
      }
    });

    it('should throw the microservice error when the response status is between 400 and 500', async () => {
      const microservice = 'testMicroserviceURL';
      const method = faker.internet.httpMethod();
      const path = `${faker.random.word().toLowerCase()}/${faker.random.word().toLowerCase()}`;
      const body = JSON.parse(faker.datatype.json());
      const query = JSON.parse(faker.datatype.json());
      const header = JSON.parse(faker.datatype.json());

      const responseData = {
        ...JSON.parse(faker.datatype.json()),
        message: faker.random.word(),
        code: faker.datatype.number({ min: 1 }),
        data: JSON.parse(faker.datatype.json()),
      };

      const requestParam = {
        microservice,
        method,
        path,
        body,
        query,
        header,
      };

      const axiosRequestParam = {
        method,
        url: `${testMicroserviceURL}${path}`,
        data: body,
        params: query,
        headers: { ...header, requestId },
        timeout,
        validateStatus: expect.any(Function),
      };

      const errorResponse = {
        data: responseData,
        status: faker.datatype.number({ min: 400, max: 500 }),
      };
      axios.mockImplementation(() => Promise.resolve(errorResponse));

      StringUtil.deepObjectIdToString.mockImplementation(({ value }) => value);

      try {
        await serviceCaller.request(requestParam);
      }
      catch (serviceCallerError) {
        const { validateStatus, ...requestParamWithoutFunctionDefinition } = axiosRequestParam;
        expect(JSON.stringify(serviceCallerError)).toEqual(JSON.stringify(new ServiceCallerError({
          code: errorResponse.data.code,
          data: errorResponse.data.data,
          status: errorResponse.status,
          request: requestParamWithoutFunctionDefinition,
          message: errorResponse.data.message,
          microservice,
          isOriginatedFromAnotherService: true,
        })));
        expect(StringUtil.deepObjectIdToString).toHaveBeenCalledWith({
          value: requestParam.query,
        });
        expect(generateErrorFunction).toHaveBeenCalledWith(microservice, axiosRequestParam);
        expect(generateErrorFunction.mock.calls[0][1].validateStatus()).toBe(true);
        expect(axios).toHaveBeenCalledWith(axiosRequestParam);
        expect(axios.mock.calls[0][0].validateStatus()).toBe(true);
        expect(logger.debug).toHaveBeenCalledWith(expect.anything(String), expect.anything(), { $logOptions: expect.anything() });
        expect(logger.debug.mock.calls.length).toEqual(1);
        expect(logger.info).not.toHaveBeenCalled();
        expect(logger.warn).toHaveBeenCalledWith(expect.anything(String), expect.anything(), { $logOptions: expect.anything() });
        expect(logger.error).not.toHaveBeenCalled();
      }
    });

    it('should throw the microservice error when the response status is greater than 500', async () => {
      const microservice = 'testMicroserviceURL';
      const method = faker.internet.httpMethod();
      const path = `${faker.random.word().toLowerCase()}/${faker.random.word().toLowerCase()}`;
      const body = JSON.parse(faker.datatype.json());
      const query = JSON.parse(faker.datatype.json());
      const header = JSON.parse(faker.datatype.json());

      const responseData = {
        ...JSON.parse(faker.datatype.json()),
        message: faker.random.word(),
        code: faker.datatype.number({ min: 1 }),
        data: JSON.parse(faker.datatype.json()),
      };

      const requestParam = {
        microservice,
        method,
        path,
        body,
        query,
        header,
      };

      const axiosRequestParam = {
        method,
        url: `${testMicroserviceURL}${path}`,
        data: body,
        params: query,
        headers: { ...header, requestId },
        timeout,
        validateStatus: expect.any(Function),
      };

      const errorResponse = {
        data: responseData,
        status: faker.datatype.number({ min: 500, max: 599 }),
      };
      axios.mockImplementation(() => Promise.resolve(errorResponse));

      StringUtil.deepObjectIdToString.mockImplementation(({ value }) => value);

      try {
        await serviceCaller.request(requestParam);
      }
      catch (serviceCallerError) {
        const { validateStatus, ...requestParamWithoutFunctionDefinition } = axiosRequestParam;
        expect(JSON.stringify(serviceCallerError)).toEqual(JSON.stringify(new ServiceCallerError({
          code: errorResponse.data.code,
          data: errorResponse.data.data,
          status: errorResponse.status,
          request: requestParamWithoutFunctionDefinition,
          message: errorResponse.data.message,
          microservice,
          isOriginatedFromAnotherService: true,
        })));
        expect(StringUtil.deepObjectIdToString).toHaveBeenCalledWith({
          value: requestParam.query,
        });
        expect(generateErrorFunction).toHaveBeenCalledWith(microservice, axiosRequestParam);
        expect(generateErrorFunction.mock.calls[0][1].validateStatus()).toBe(true);
        expect(axios).toHaveBeenCalledWith(axiosRequestParam);
        expect(axios.mock.calls[0][0].validateStatus()).toBe(true);
        expect(logger.debug).toHaveBeenCalledWith(expect.anything(String), expect.anything(), { $logOptions: expect.anything() });
        expect(logger.debug.mock.calls.length).toEqual(1);
        expect(logger.info).not.toHaveBeenCalled();
        expect(logger.warn).not.toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalledWith(expect.anything(String), expect.anything(), { $logOptions: expect.anything() });
      }
    });

    it('should throw microservice error with default content when the response status is not 200 and response does not have data.code field', async () => {
      const microservice = 'testMicroserviceURL';
      const method = faker.internet.httpMethod();
      const path = `${faker.random.word().toLowerCase()}/${faker.random.word().toLowerCase()}`;
      const body = JSON.parse(faker.datatype.json());
      const query = JSON.parse(faker.datatype.json());
      const header = JSON.parse(faker.datatype.json());

      const responseData = {
        ...JSON.parse(faker.datatype.json()),
        message: faker.random.word(),
        data: JSON.parse(faker.datatype.json()),
      };

      const requestParam = {
        microservice,
        method,
        path,
        body,
        query,
        header,
      };

      const axiosRequestParam = {
        method,
        url: `${testMicroserviceURL}${path}`,
        data: body,
        params: query,
        headers: { ...header, requestId },
        timeout,
        validateStatus: expect.any(Function),
      };

      const errorResponse = {
        data: responseData,
        status: faker.datatype.number({ min: 201, max: 599 }),
      };
      axios.mockImplementation(() => Promise.resolve(errorResponse));

      StringUtil.deepObjectIdToString.mockImplementation(({ value }) => value);

      try {
        await serviceCaller.request(requestParam);
      }
      catch (serviceCallerError) {
        const { validateStatus, ...requestParamWithoutFunctionDefinition } = axiosRequestParam;
        expect(JSON.stringify(serviceCallerError)).toEqual(JSON.stringify(new ServiceCallerError({
          code: MICROSERVICE.code,
          request: requestParamWithoutFunctionDefinition,
          message: MICROSERVICE.message,
          microservice,
          isOriginatedFromAnotherService: false,
        })));
        expect(StringUtil.deepObjectIdToString).toHaveBeenCalledWith({
          value: requestParam.query,
        });
        expect(generateErrorFunction).toHaveBeenCalledWith(microservice, axiosRequestParam);
        expect(generateErrorFunction.mock.calls[0][1].validateStatus()).toBe(true);
        expect(axios).toHaveBeenCalledWith(axiosRequestParam);
        expect(axios.mock.calls[0][0].validateStatus()).toBe(true);
        expect(logger.debug).toHaveBeenCalledWith(expect.anything(String), expect.anything(), { $logOptions: expect.anything() });
        expect(logger.debug.mock.calls.length).toEqual(1);
      }
    });

    it('should throw microservice error with error message that thrown by axios failure', async () => {
      const microservice = 'testMicroserviceURL';
      const method = faker.internet.httpMethod();
      const path = `${faker.random.word().toLowerCase()}/${faker.random.word().toLowerCase()}`;
      const body = JSON.parse(faker.datatype.json());
      const query = JSON.parse(faker.datatype.json());
      const header = JSON.parse(faker.datatype.json());

      const requestParam = {
        microservice,
        method,
        path,
        body,
        query,
        header,
      };

      const axiosRequestParam = {
        method,
        url: `${testMicroserviceURL}${path}`,
        data: body,
        params: query,
        headers: { ...header, requestId },
        timeout,
        validateStatus: expect.any(Function),
      };

      const errorMessage = faker.random.word();

      axios.mockImplementation(() => Promise.reject(new Error(errorMessage)));
      StringUtil.deepObjectIdToString.mockImplementation(({ value }) => value);

      try {
        await serviceCaller.request(requestParam);
      }
      catch (serviceCallerError) {
        const { validateStatus, ...requestParamWithoutFunctionDefinition } = axiosRequestParam;
        expect(JSON.stringify(serviceCallerError)).toEqual(JSON.stringify(new ServiceCallerError({
          code: MICROSERVICE.code,
          request: requestParamWithoutFunctionDefinition,
          message: errorMessage,
          microservice,
          isOriginatedFromAnotherService: false,
        })));
        expect(StringUtil.deepObjectIdToString).toHaveBeenCalledWith({
          value: requestParam.query,
        });
        expect(generateErrorFunction).toHaveBeenCalledWith(microservice, axiosRequestParam);
        expect(generateErrorFunction.mock.calls[0][1].validateStatus()).toBe(true);
        expect(axios).toHaveBeenCalledWith(axiosRequestParam);
        expect(axios.mock.calls[0][0].validateStatus()).toBe(true);
        expect(logger.debug).toHaveBeenCalledWith(expect.anything(String), expect.anything(), { $logOptions: expect.anything() });
        expect(logger.debug.mock.calls.length).toEqual(1);
      }
    });
  });

  describe('request function when requestId does not exist', () => {
    const timeout = faker.datatype.number({ min: 10000, max: 100000 });
    const testMicroserviceURL = `${faker.internet.url()}/`;

    let config;
    let logger;
    let serviceCaller;
    let generateErrorFunction;

    beforeAll(() => {
      config = {
        log: {
          isPrettyLoggingEnabled: faker.datatype.boolean(),
        },
        microservice: {
          urls: {
            testMicroserviceURL,
          },
          timeout,
        },
      };

      logger = {
        debug: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
      };

      generateErrorFunction = jest.spyOn(ServiceCaller, 'generateErrorFunction');
      serviceCaller = new ServiceCaller({ config, logger });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return the response when response status is 200', async () => {
      const microservice = 'testMicroserviceURL';
      const method = faker.internet.httpMethod();
      const path = `${faker.random.word().toLowerCase()}/${faker.random.word().toLowerCase()}`;
      const body = JSON.parse(faker.datatype.json());
      const query = JSON.parse(faker.datatype.json());
      const header = JSON.parse(faker.datatype.json());

      const responseData = JSON.parse(faker.datatype.json());

      const requestParam = {
        microservice,
        method,
        path,
        body,
        query,
        header,
      };

      const axiosRequestParam = {
        method,
        url: `${testMicroserviceURL}${path}`,
        data: body,
        params: query,
        headers: header,
        timeout,
        validateStatus: expect.any(Function),
      };

      const successResponse = {
        data: responseData,
        status: 200,
      };
      axios.mockImplementation(() => Promise.resolve(successResponse));

      StringUtil.deepObjectIdToString.mockImplementation(({ value }) => value);

      const response = await serviceCaller.request(requestParam);

      expect(StringUtil.deepObjectIdToString).toHaveBeenCalledWith({
        value: requestParam.query,
      });
      expect(generateErrorFunction).toHaveBeenCalledWith(microservice, axiosRequestParam);
      expect(generateErrorFunction.mock.calls[0][1].validateStatus()).toBe(true);
      expect(axios).toHaveBeenCalledWith(axiosRequestParam);
      expect(axios.mock.calls[0][0].validateStatus()).toBe(true);
      expect(response).toEqual(responseData);
    });

    it('should return the response when response status is not 200', async () => {
      const microservice = 'testMicroserviceURL';
      const method = faker.internet.httpMethod();
      const path = `${faker.random.word().toLowerCase()}/${faker.random.word().toLowerCase()}`;
      const body = JSON.parse(faker.datatype.json());
      const query = JSON.parse(faker.datatype.json());
      const header = JSON.parse(faker.datatype.json());

      const responseData = JSON.parse(faker.datatype.json());

      const requestParam = {
        microservice,
        method,
        path,
        body,
        query,
        header,
      };

      const axiosRequestParam = {
        method,
        url: `${testMicroserviceURL}${path}`,
        data: body,
        params: query,
        headers: { ...header },
        timeout,
        validateStatus: expect.any(Function),
      };

      const errorResponse = {
        data: responseData,
        status: faker.datatype.number({ min: 201, max: 399 }),
      };
      axios.mockImplementation(() => Promise.resolve(errorResponse));

      StringUtil.deepObjectIdToString.mockImplementation(({ value }) => value);

      try {
        await serviceCaller.request(requestParam);
      }
      catch (serviceCallerError) {
        const { validateStatus, ...requestParamWithoutFunctionDefinition } = axiosRequestParam;
        expect(JSON.stringify(serviceCallerError)).toEqual(JSON.stringify(new ServiceCallerError({
          code: MICROSERVICE.code,
          data: errorResponse.data.data,
          request: requestParamWithoutFunctionDefinition,
          message: errorResponse.data.message,
          microservice,
          isOriginatedFromAnotherService: false,
        })));
        expect(StringUtil.deepObjectIdToString).toHaveBeenCalledWith({
          value: requestParam.query,
        });
        expect(generateErrorFunction).toHaveBeenCalledWith(microservice, axiosRequestParam);
        expect(generateErrorFunction.mock.calls[0][1].validateStatus()).toBe(true);
        expect(axios).toHaveBeenCalledWith(axiosRequestParam);
        expect(axios.mock.calls[0][0].validateStatus()).toBe(true);
      }
    });
  });

  describe('request function when LOG_IS_PRETTY_LOGGING_ENABLED env is false', () => {
    const timeout = faker.datatype.number({ min: 10000, max: 100000 });
    const testMicroserviceURL = `${faker.internet.url()}/`;

    let config;
    let logger;
    let serviceCaller;
    let requestId;
    let generateErrorFunction;

    beforeAll(() => {
      config = {
        log: {
          isPrettyLoggingEnabled: false,
        },
        microservice: {
          urls: {
            testMicroserviceURL,
          },
          timeout,
        },
      };

      logger = {
        debug: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
      };

      requestId = faker.datatype.uuid();

      generateErrorFunction = jest.spyOn(ServiceCaller, 'generateErrorFunction');
      serviceCaller = new ServiceCaller({ config, logger, requestId });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return the response when the response status is 200', async () => {
      const microservice = 'testMicroserviceURL';
      const method = faker.internet.httpMethod();
      const path = `${faker.random.word().toLowerCase()}/${faker.random.word().toLowerCase()}`;
      const body = JSON.parse(faker.datatype.json());
      const query = JSON.parse(faker.datatype.json());
      const header = JSON.parse(faker.datatype.json());

      const responseData = JSON.parse(faker.datatype.json());

      const requestParam = {
        microservice,
        method,
        path,
        body,
        query,
        header,
      };

      const axiosRequestParam = {
        method,
        url: `${testMicroserviceURL}${path}`,
        data: body,
        params: query,
        headers: { ...header, requestId },
        timeout,
        validateStatus: expect.any(Function),
      };

      const successResponse = {
        data: responseData,
        status: 200,
      };
      axios.mockImplementation(() => Promise.resolve(successResponse));

      StringUtil.deepObjectIdToString.mockImplementation(({ value }) => value);

      const response = await serviceCaller.request(requestParam);

      expect(StringUtil.deepObjectIdToString).toHaveBeenCalledWith({
        value: requestParam.query,
      });
      expect(generateErrorFunction).toHaveBeenCalledWith(microservice, axiosRequestParam);
      expect(generateErrorFunction.mock.calls[0][1].validateStatus()).toBe(true);
      expect(axios).toHaveBeenCalledWith(axiosRequestParam);
      expect(axios.mock.calls[0][0].validateStatus()).toBe(true);
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith(expect.anything(String), expect.anything());
      expect(logger.debug.mock.calls.length).toEqual(1);
      expect(response).toEqual(responseData);
    });

    it('should throw the microservice error when the response status is not 200 but also less than 400', async () => {
      const microservice = 'testMicroserviceURL';
      const method = faker.internet.httpMethod();
      const path = `${faker.random.word().toLowerCase()}/${faker.random.word().toLowerCase()}`;
      const body = JSON.parse(faker.datatype.json());
      const query = JSON.parse(faker.datatype.json());
      const header = JSON.parse(faker.datatype.json());

      const responseData = {
        ...JSON.parse(faker.datatype.json()),
        message: faker.random.word(),
        code: faker.datatype.number({ min: 1 }),
        data: JSON.parse(faker.datatype.json()),
      };

      const requestParam = {
        microservice,
        method,
        path,
        body,
        query,
        header,
      };

      const axiosRequestParam = {
        method,
        url: `${testMicroserviceURL}${path}`,
        data: body,
        params: query,
        headers: { ...header, requestId },
        timeout,
        validateStatus: expect.any(Function),
      };

      const errorResponse = {
        data: responseData,
        status: faker.datatype.number({ min: 201, max: 399 }),
      };
      axios.mockImplementation(() => Promise.resolve(errorResponse));

      StringUtil.deepObjectIdToString.mockImplementation(({ value }) => value);

      try {
        await serviceCaller.request(requestParam);
      }
      catch (serviceCallerError) {
        const { validateStatus, ...requestParamWithoutFunctionDefinition } = axiosRequestParam;
        expect(JSON.stringify(serviceCallerError)).toEqual(JSON.stringify(new ServiceCallerError({
          code: errorResponse.data.code,
          data: errorResponse.data.data,
          status: errorResponse.status,
          request: requestParamWithoutFunctionDefinition,
          message: errorResponse.data.message,
          microservice,
          isOriginatedFromAnotherService: true,
        })));
        expect(StringUtil.deepObjectIdToString).toHaveBeenCalledWith({
          value: requestParam.query,
        });
        expect(generateErrorFunction).toHaveBeenCalledWith(microservice, axiosRequestParam);
        expect(generateErrorFunction.mock.calls[0][1].validateStatus()).toBe(true);
        expect(axios).toHaveBeenCalledWith(axiosRequestParam);
        expect(axios.mock.calls[0][0].validateStatus()).toBe(true);
        expect(logger.info).not.toHaveBeenCalled();
        expect(logger.warn).not.toHaveBeenCalled();
        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.debug).toHaveBeenCalledWith(expect.anything(String), expect.anything());
        expect(logger.debug.mock.calls.length).toEqual(1);
      }
    });

    it('should throw the microservice error when the response status is between 400 and 500', async () => {
      const microservice = 'testMicroserviceURL';
      const method = faker.internet.httpMethod();
      const path = `${faker.random.word().toLowerCase()}/${faker.random.word().toLowerCase()}`;
      const body = JSON.parse(faker.datatype.json());
      const query = JSON.parse(faker.datatype.json());
      const header = JSON.parse(faker.datatype.json());

      const responseData = {
        ...JSON.parse(faker.datatype.json()),
        message: faker.random.word(),
        code: faker.datatype.number({ min: 1 }),
        data: JSON.parse(faker.datatype.json()),
      };

      const requestParam = {
        microservice,
        method,
        path,
        body,
        query,
        header,
      };

      const axiosRequestParam = {
        method,
        url: `${testMicroserviceURL}${path}`,
        data: body,
        params: query,
        headers: { ...header, requestId },
        timeout,
        validateStatus: expect.any(Function),
      };

      const errorResponse = {
        data: responseData,
        status: faker.datatype.number({ min: 400, max: 500 }),
      };
      axios.mockImplementation(() => Promise.resolve(errorResponse));

      StringUtil.deepObjectIdToString.mockImplementation(({ value }) => value);

      try {
        await serviceCaller.request(requestParam);
      }
      catch (serviceCallerError) {
        const { validateStatus, ...requestParamWithoutFunctionDefinition } = axiosRequestParam;
        expect(JSON.stringify(serviceCallerError)).toEqual(JSON.stringify(new ServiceCallerError({
          code: errorResponse.data.code,
          data: errorResponse.data.data,
          status: errorResponse.status,
          request: requestParamWithoutFunctionDefinition,
          message: errorResponse.data.message,
          microservice,
          isOriginatedFromAnotherService: true,
        })));
        expect(StringUtil.deepObjectIdToString).toHaveBeenCalledWith({
          value: requestParam.query,
        });
        expect(generateErrorFunction).toHaveBeenCalledWith(microservice, axiosRequestParam);
        expect(generateErrorFunction.mock.calls[0][1].validateStatus()).toBe(true);
        expect(axios).toHaveBeenCalledWith(axiosRequestParam);
        expect(axios.mock.calls[0][0].validateStatus()).toBe(true);
        expect(logger.info).not.toHaveBeenCalled();
        expect(logger.warn).not.toHaveBeenCalled();
        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.debug).toHaveBeenCalledWith(expect.anything(String), expect.anything());
        expect(logger.debug.mock.calls.length).toEqual(1);
      }
    });

    it('should throw the microservice error when the response status is greater than 500', async () => {
      const microservice = 'testMicroserviceURL';
      const method = faker.internet.httpMethod();
      const path = `${faker.random.word().toLowerCase()}/${faker.random.word().toLowerCase()}`;
      const body = JSON.parse(faker.datatype.json());
      const query = JSON.parse(faker.datatype.json());
      const header = JSON.parse(faker.datatype.json());

      const responseData = {
        ...JSON.parse(faker.datatype.json()),
        message: faker.random.word(),
        code: faker.datatype.number({ min: 1 }),
        data: JSON.parse(faker.datatype.json()),
      };

      const requestParam = {
        microservice,
        method,
        path,
        body,
        query,
        header,
      };

      const axiosRequestParam = {
        method,
        url: `${testMicroserviceURL}${path}`,
        data: body,
        params: query,
        headers: { ...header, requestId },
        timeout,
        validateStatus: expect.any(Function),
      };

      const errorResponse = {
        data: responseData,
        status: faker.datatype.number({ min: 500, max: 599 }),
      };
      axios.mockImplementation(() => Promise.resolve(errorResponse));

      StringUtil.deepObjectIdToString.mockImplementation(({ value }) => value);

      try {
        await serviceCaller.request(requestParam);
      }
      catch (serviceCallerError) {
        const { validateStatus, ...requestParamWithoutFunctionDefinition } = axiosRequestParam;
        expect(JSON.stringify(serviceCallerError)).toEqual(JSON.stringify(new ServiceCallerError({
          code: errorResponse.data.code,
          data: errorResponse.data.data,
          status: errorResponse.status,
          request: requestParamWithoutFunctionDefinition,
          message: errorResponse.data.message,
          microservice,
          isOriginatedFromAnotherService: true,
        })));
        expect(StringUtil.deepObjectIdToString).toHaveBeenCalledWith({
          value: requestParam.query,
        });
        expect(generateErrorFunction).toHaveBeenCalledWith(microservice, axiosRequestParam);
        expect(generateErrorFunction.mock.calls[0][1].validateStatus()).toBe(true);
        expect(axios).toHaveBeenCalledWith(axiosRequestParam);
        expect(axios.mock.calls[0][0].validateStatus()).toBe(true);
        expect(logger.info).not.toHaveBeenCalled();
        expect(logger.warn).not.toHaveBeenCalled();
        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.debug).toHaveBeenCalledWith(expect.anything(String), expect.anything());
        expect(logger.debug.mock.calls.length).toEqual(1);
      }
    });

    it('should throw microservice error with default content when the response is not 200 and response does not have data.code field', async () => {
      const microservice = 'testMicroserviceURL';
      const method = faker.internet.httpMethod();
      const path = `${faker.random.word().toLowerCase()}/${faker.random.word().toLowerCase()}`;
      const body = JSON.parse(faker.datatype.json());
      const query = JSON.parse(faker.datatype.json());
      const header = JSON.parse(faker.datatype.json());

      const responseData = {
        ...JSON.parse(faker.datatype.json()),
        message: faker.random.word(),
        data: JSON.parse(faker.datatype.json()),
      };

      const requestParam = {
        microservice,
        method,
        path,
        body,
        query,
        header,
      };

      const axiosRequestParam = {
        method,
        url: `${testMicroserviceURL}${path}`,
        data: body,
        params: query,
        headers: { ...header, requestId },
        timeout,
        validateStatus: expect.any(Function),
      };

      const errorResponse = {
        data: responseData,
        status: faker.datatype.number({ min: 201, max: 599 }),
      };
      axios.mockImplementation(() => Promise.resolve(errorResponse));

      StringUtil.deepObjectIdToString.mockImplementation(({ value }) => value);

      try {
        await serviceCaller.request(requestParam);
      }
      catch (serviceCallerError) {
        const { validateStatus, ...requestParamWithoutFunctionDefinition } = axiosRequestParam;
        expect(JSON.stringify(serviceCallerError)).toEqual(JSON.stringify(new ServiceCallerError({
          code: MICROSERVICE.code,
          request: requestParamWithoutFunctionDefinition,
          message: MICROSERVICE.message,
          microservice,
          isOriginatedFromAnotherService: false,
        })));
        expect(StringUtil.deepObjectIdToString).toHaveBeenCalledWith({
          value: requestParam.query,
        });
        expect(generateErrorFunction).toHaveBeenCalledWith(microservice, axiosRequestParam);
        expect(generateErrorFunction.mock.calls[0][1].validateStatus()).toBe(true);
        expect(axios).toHaveBeenCalledWith(axiosRequestParam);
        expect(axios.mock.calls[0][0].validateStatus()).toBe(true);
        expect(logger.info).not.toHaveBeenCalled();
        expect(logger.warn).not.toHaveBeenCalled();
        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.debug).toHaveBeenCalledWith(expect.anything(String), expect.anything());
        expect(logger.debug.mock.calls.length).toEqual(1);
      }
    });

    it('should throw microservice error with error message that thrown by axios failure', async () => {
      const microservice = 'testMicroserviceURL';
      const method = faker.internet.httpMethod();
      const path = `${faker.random.word().toLowerCase()}/${faker.random.word().toLowerCase()}`;
      const body = JSON.parse(faker.datatype.json());
      const query = JSON.parse(faker.datatype.json());
      const header = JSON.parse(faker.datatype.json());

      const requestParam = {
        microservice,
        method,
        path,
        body,
        query,
        header,
      };

      const axiosRequestParam = {
        method,
        url: `${testMicroserviceURL}${path}`,
        data: body,
        params: query,
        headers: { ...header, requestId },
        timeout,
        validateStatus: expect.any(Function),
      };

      const errorMessage = faker.random.word();

      axios.mockImplementation(() => Promise.reject(new Error(errorMessage)));
      StringUtil.deepObjectIdToString.mockImplementation(({ value }) => value);

      try {
        await serviceCaller.request(requestParam);
      }
      catch (serviceCallerError) {
        const { validateStatus, ...requestParamWithoutFunctionDefinition } = axiosRequestParam;
        expect(JSON.stringify(serviceCallerError)).toEqual(JSON.stringify(new ServiceCallerError({
          code: MICROSERVICE.code,
          request: requestParamWithoutFunctionDefinition,
          message: errorMessage,
          microservice,
          isOriginatedFromAnotherService: false,
        })));
        expect(StringUtil.deepObjectIdToString).toHaveBeenCalledWith({
          value: requestParam.query,
        });
        expect(generateErrorFunction).toHaveBeenCalledWith(microservice, axiosRequestParam);
        expect(generateErrorFunction.mock.calls[0][1].validateStatus()).toBe(true);
        expect(axios).toHaveBeenCalledWith(axiosRequestParam);
        expect(axios.mock.calls[0][0].validateStatus()).toBe(true);
        expect(logger.info).not.toHaveBeenCalled();
        expect(logger.warn).not.toHaveBeenCalled();
        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.debug).not.toHaveBeenCalled();
      }
    });
  });
});
