'use strict';

const awilix = require('awilix');
const Mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

class DBManager {
  constructor() {
    this.server = null;
    this.connection = null;
  }

  getUri() {
    return this.server.getUri();
  }

  getDbName() {
    return this.server.instanceInfo.dbName;
  }

  async start() {
    this.server = await MongoMemoryServer.create();
    this.connection = await Mongoose.createConnection(this.getUri()).asPromise();
  }

  register(container) {
    container.register('mongooseConnection', awilix.asValue(this.connection));
  }

  async stop() {
    await this.connection.close();
    return this.server.stop();
  }
}

module.exports = DBManager;
