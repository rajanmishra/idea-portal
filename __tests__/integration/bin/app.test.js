'use strict';

const axios = require('axios');
const { spawn } = require('child_process');
const { join } = require('path');

const {
  TEST_SERVER_PORTS: {
    GRACEFUL_SHUTDOWN_DEFAULT,
    GRACEFUL_SHUTDOWN_WITH_DELAY_CONFIGURATION,
    GRACEFUL_SHUTDOWN_WITH_APP_PROCESS_TERMINATED,
  },
} = require('../../constants');
const { delay, parseJsonFromOutput } = require('../../utils');
const { HTTP_STATUS_CODES } = require('../../../src/constants');
const LOG_LEVEL = require('../../../src/errors/levels');

jest.setTimeout(60000);
const serverStartUpTimeDelay = 10000;
const gracefulShutDownDelay = 1000;

describe('Server Graceful Shutdown', () => {
  describe('without shutdown delay', () => {
    const appProcessData = { stdout: [], stderr: [] };
    const PORT = GRACEFUL_SHUTDOWN_DEFAULT;
    const baseURL = `http://localhost:${PORT}`;

    let appProcess;

    beforeAll(async () => {
      const appCwd = join(__dirname, '..', '..', '..');
      const appPath = join(appCwd, 'bin/index.js');

      const env = {
        ...process.env,
        PORT,
        NODE_ENV: 'test',
        IS_LOG_SUPPRESSED: 'false',
        IS_PRETTY_LOGGING_ENABLED: 'false',
        LOG_LEVEL: LOG_LEVEL.INFO,
        SERVER_BEFORE_SHUTDOWN_DELAY: 0,
      };

      appProcess = spawn('node', [appPath], { env, cwd: appCwd });

      appProcess.stdout.on('data', (data) => {
        appProcessData.stdout.push(String(data));
      });
      appProcess.stderr.on('data', (data) => {
        appProcessData.stderr.push(String(data));
      });

      // Wait for the server startup time
      await delay(serverStartUpTimeDelay);
    });

    afterAll(() => {
      if (appProcess && !appProcess.killed) appProcess.kill('SIGKILL');
    });

    it(`should respond with ${HTTP_STATUS_CODES.OK} from /live`, async () => {
      const response = await axios({
        method: 'get',
        url: `${baseURL}/live`,
      });

      const { data: { status, time }, status: statusCode } = response;

      expect(statusCode).toEqual(HTTP_STATUS_CODES.OK);
      expect(status).toEqual('OK');
      expect(time).toEqual(expect.any(Number));
    });

    it(`should respond with ${HTTP_STATUS_CODES.OK} from /ready`, async () => {
      const response = await axios({
        method: 'get',
        url: `${baseURL}/ready`,
      });

      const { data: { status, time }, status: statusCode } = response;

      expect(statusCode).toEqual(HTTP_STATUS_CODES.OK);
      expect(status).toEqual('OK');
      expect(time).toEqual(expect.any(Number));
    });

    it('should respond killed successfully with SIGTERM', (done) => {
      appProcess.on('exit', (code, signal) => {
        expect(code).toEqual(null);
        expect(signal).toEqual('SIGTERM');
        done();
      });
      const result = appProcess.kill('SIGTERM');
      expect(result).toEqual(true);
    });

    it('should log nothing to stderr', () => {
      // To ignore warning messages like [MONGODB DRIVER] Warning
      const isAllMessagesHasWarningOrEmpty = appProcessData.stderr.every((err) => err.toLowerCase().includes('warning'));
      expect(isAllMessagesHasWarningOrEmpty).toEqual(true);
    });

    it('should log as expected to stdout', () => {
      const parsedLines = parseJsonFromOutput(appProcessData.stdout);
      const messages = parsedLines.map(({ message }) => message);

      expect(messages).toContain('started the server', 'cleanup finished, server is shutting down');
    });
  });

  describe('with shutdown delay', () => {
    const appProcessData = { stdout: [], stderr: [] };
    const PORT = GRACEFUL_SHUTDOWN_WITH_DELAY_CONFIGURATION;
    const baseURL = `http://localhost:${PORT}`;

    let appProcess;

    beforeAll(async () => {
      const appCwd = join(__dirname, '..', '..', '..');
      const appPath = join(appCwd, 'bin/index.js');

      const env = {
        ...process.env,
        PORT,
        NODE_ENV: 'test',
        SERVER_BEFORE_SHUTDOWN_DELAY: gracefulShutDownDelay,
        LOG_LEVEL: LOG_LEVEL.INFO,
        IS_PRETTY_LOGGING_ENABLED: 'false',
      };

      appProcess = spawn('node', [appPath], { env, cwd: appCwd });

      appProcess.stdout.on('data', (data) => {
        appProcessData.stdout.push(String(data));
      });
      appProcess.stderr.on('data', (data) => {
        appProcessData.stderr.push(String(data));
      });

      // Wait for the server startup time
      await delay(serverStartUpTimeDelay);

      appProcess.kill('SIGTERM');
    });

    afterAll(() => {
      if (appProcess && !appProcess.killed) appProcess.kill('SIGKILL');
    });

    it(`should respond with ${HTTP_STATUS_CODES.OK} from /live`, async () => {
      const response = await axios({
        method: 'get',
        url: `${baseURL}/live`,
      });

      const { data: { status, time }, status: statusCode } = response;

      expect(statusCode).toEqual(HTTP_STATUS_CODES.OK);
      expect(status).toEqual('OK');
      expect(time).toEqual(expect.any(Number));
    });

    it(`should respond with ${HTTP_STATUS_CODES.SERVICE_UNAVAILABLE} error from /ready`, async () => {
      let response;

      await axios({
        method: 'get',
        url: `${baseURL}/ready`,
      }).catch((err) => {
        response = err.response;
      });

      const { statusText, status: statusCode } = response;

      expect(statusCode).toEqual(HTTP_STATUS_CODES.SERVICE_UNAVAILABLE);
      expect(statusText).toEqual('Service Unavailable');
    });

    it('should log nothing to stderr', async () => {
      await delay(serverStartUpTimeDelay);
      // To ignore warning messages like [MONGODB DRIVER] Warning
      const isAllMessagesHasWarningOrEmpty = appProcessData.stderr.every((err) => err.toLowerCase().includes('warning'));
      expect(isAllMessagesHasWarningOrEmpty).toEqual(true);
    });

    it('should log as expected to stdout', () => {
      const parsedLines = parseJsonFromOutput(appProcessData.stdout);
      const messages = parsedLines.map(({ message }) => message);

      expect(messages).toContain('started the server', 'cleanup finished, server is shutting down');
    });
  });

  describe('termination check', () => {
    const appProcessData = { stdout: [], stderr: [] };
    const PORT = GRACEFUL_SHUTDOWN_WITH_APP_PROCESS_TERMINATED;

    let appProcess;
    let isTerminated = false;
    let isTerminationSignalSend = false;

    beforeAll(async () => {
      const appCwd = join(__dirname, '..', '..', '..');
      const appPath = join(appCwd, 'bin/index.js');

      const env = {
        ...process.env,
        PORT,
        NODE_ENV: 'test',
        SERVER_BEFORE_SHUTDOWN_DELAY: gracefulShutDownDelay,
        LOG_LEVEL: LOG_LEVEL.INFO,
        IS_PRETTY_LOGGING_ENABLED: 'false',
      };

      appProcess = spawn('node', [appPath], { env, cwd: appCwd });

      appProcess.stdout.on('data', (data) => {
        appProcessData.stdout.push(String(data));
      });
      appProcess.stderr.on('data', (data) => {
        appProcessData.stderr.push(String(data));
      });

      // Wait for the server startup time
      await delay(serverStartUpTimeDelay);

      appProcess.on('exit', () => {
        isTerminated = true;
      });

      isTerminationSignalSend = appProcess.kill('SIGTERM');
    });

    afterAll(() => {
      if (appProcess && !appProcess.killed) appProcess.kill('SIGKILL');
    });

    it('should respond killed successfully with SIGTERM', async () => {
      await delay(gracefulShutDownDelay + 1000); // wait for graceful shutdown

      expect(isTerminated).toEqual(true);
      expect(isTerminationSignalSend).toEqual(true);
    });
  });
});
