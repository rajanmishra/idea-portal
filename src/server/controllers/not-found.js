'use strict';

module.exports = class NotFoundController {
  // eslint-disable-next-line class-methods-use-this
  async getNotFound(request, h) {
    return h.response({
      code: 'ResourceNotFound',
      message: `${request.path} does not exist`,
    }).code(404);
  }
};
