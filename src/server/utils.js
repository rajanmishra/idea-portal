'use strict';

const { createHash } = require('crypto');

const getRequestIdFromRequest = ({ request }) => (
  request.headers.requestid || request.info.id
);

const stringFormat = ({ str, data }) => (
  str.replace(/{([a-z0-9_$]+)}/gi, (match) => data[match.slice(1, -1)])
);

const generateMD5Hash = (string) => (createHash('md5').update(string).digest('hex'));

module.exports = {
  getRequestIdFromRequest,
  stringFormat,
  generateMD5Hash,
};
