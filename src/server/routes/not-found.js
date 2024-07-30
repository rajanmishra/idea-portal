'use strict';

module.exports = ([
  {
    method: ['DELETE', 'GET', 'PATCH', 'POST', 'PUT'],
    path: '/{any*}',
    options: {
      description: 'Return 404 response for invalid routes',
      plugins: {
        logging: true,
        cache: { enabled: false },
      },
    },
    handler: 'NotFoundController.getNotFound',
  },
]);
