'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tagged = tagged;
exports.taggedSum = taggedSum;

var _lodash = require('lodash.tostring');

var _lodash2 = _interopRequireDefault(_lodash);

var _sanctuaryTypeIdentifiers = require('sanctuary-type-identifiers');

var _sanctuaryTypeIdentifiers2 = _interopRequireDefault(_sanctuaryTypeIdentifiers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// const MAX_DEFAULT_FIELDS = 10

// Names of prop used to store:
// * name of variant of a sum type
var TAG = '@@tag';
// * array of arguments used to create a value (to speed up `cata`)
var VALUES = '@@values';
// * `@@type` of its returned results
var TYPE = '@@type';
// * `@@type` of variant constructor's returned results
var RET_TYPE = '@@ret_type';

function tagged(typeName, fields) {
  var proto = { toString: tagged$toString };
  // this way we avoid named function
  var typeRep = makeConstructor(fields, proto);
  typeRep.toString = typeRepToString;
  typeRep.prototype = proto;
  typeRep.is = isType;
  typeRep[TYPE] = typeName;
  proto.constructor = typeRep;
  return typeRep;
}

function taggedSum(typeName, constructors) {
  var proto = { cata: sum$cata, toString: sum$toString };
  var typeRep = proto.constructor = {
    toString: typeRepToString,
    prototype: proto,
    is: isType,
    '@@type': typeName
  };
  Object.keys(constructors).forEach(function (tag) {
    var fields = constructors[tag];
    var tagProto = Object.create(proto);
    defProp(tagProto, TAG, tag);
    if (fields.length === 0) {
      typeRep[tag] = makeValue(fields, tagProto, [], 0);
      typeRep[tag].is = sum$isUnit;
      return;
    }
    typeRep[tag] = makeConstructor(fields, tagProto);
    typeRep[tag].is = sum$isVariant;
    typeRep[tag][TAG] = tag;
    typeRep[tag][RET_TYPE] = typeName;
    typeRep[tag].toString = sum$ctrToString;
  });
  return typeRep;
}

function sum$cata(fs) {
  var tag = this[TAG];
  if (!fs[tag]) {
    throw new TypeError('Constructors given to cata didn\'t include: ' + tag);
  }
  return fs[tag].apply(fs, _toConsumableArray(this[VALUES]));
}

function sum$ctrToString() {
  return this[RET_TYPE] + '.' + this[TAG];
}

function sum$toString() {
  return this.constructor[TYPE] + '.' + this[TAG] + arrToString(this[VALUES]);
}

function typeRepToString() {
  return this[TYPE];
}

function tagged$toString() {
  return this.constructor[TYPE] + arrToString(this[VALUES]);
}

function sum$isVariant(val) {
  return Boolean(val) && this[TAG] === val[TAG] && this[RET_TYPE] === (0, _sanctuaryTypeIdentifiers2.default)(val);
}

function sum$isUnit(val) {
  return this === val || Boolean(val) && this[TAG] === val[TAG] && (0, _sanctuaryTypeIdentifiers2.default)(this) === (0, _sanctuaryTypeIdentifiers2.default)(val);
}

function isType(val) {
  return this[TYPE] === (0, _sanctuaryTypeIdentifiers2.default)(val);
}

function makeValue(fields, proto, values, argumentsLength) {
  if (argumentsLength !== fields.length) {
    throw new TypeError('Expected ' + fields.length + ' arguments, got ' + argumentsLength);
  }
  var obj = Object.create(proto);
  defProp(obj, VALUES, values);
  for (var idx = 0; idx < fields.length; idx += 1) {
    obj[fields[idx]] = values[idx];
  }
  return obj;
}

// adopted version of withValue from    https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
function defProp(obj, prop, val) {
  var desc = defProp.desc || (defProp.desc = {
    enumerable: false,
    writable: false,
    configurable: false,
    value: null
  });
  desc.value = val;
  Object.defineProperty(obj, prop, desc);
}

// optimised version of `arr.map(toString).join(', ')`
function arrToString(arr) {
  if (arr.length === 0) return '';
  var str = '(' + (0, _lodash2.default)(arr[0]);
  for (var idx = 1; idx < arr.length; idx += 1) {
    str = str + ', ' + (0, _lodash2.default)(arr[idx]);
  }
  return str + ')';
}

function makeConstructor(fields, proto) {
  return Object.defineProperty(function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return makeValue(fields, proto, args, args.length);
  }, 'length', { value: fields.length });
}