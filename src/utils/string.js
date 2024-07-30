'use strict';

const { Types: { ObjectId } } = require('mongoose');

const deepObjectIdToString = ({ value }) => {
  if (value instanceof ObjectId) {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map((arrayElement) => deepObjectIdToString({ value: arrayElement }));
  }

  if (value instanceof Object) {
    return (
      Object.entries(value)
        .reduce((acc, [innerKey, innerValue]) => ({
          ...acc,
          [innerKey]: deepObjectIdToString({ value: innerValue }),
        }), {})
    );
  }

  return value;
};

module.exports = {
  deepObjectIdToString,
};
