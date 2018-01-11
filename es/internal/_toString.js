'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash.tostring');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = x => {
  if (typeof x === 'string') {
    return `"${x}"`;
  }
  return (0, _lodash2.default)(x);
};