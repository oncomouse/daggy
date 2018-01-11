import toString from 'lodash.tostring';
import type from 'sanctuary-type-identifiers';

// Names of prop used to store:
// * name of variant of a sum type
const TAG = '@@tag';
// * array of arguments used to create a value (to speed up `cata`)
const VALUES = '@@values';
// * `@@type` of its returned results
const TYPE = '@@type';
// * `@@type` of variant constructor's returned results
const RET_TYPE = '@@ret_type';

export function tagged(typeName, fields) {
  const proto = {toString: tagged$toString};
  // this way we avoid named function
  const typeRep = makeConstructor(fields, proto);
  typeRep.toString = typeRepToString;
  typeRep.prototype = proto;
  typeRep.is = isType;
  typeRep[TYPE] = typeName;
  proto.constructor = typeRep;
  return typeRep;
}

export function taggedSum(typeName, constructors) {
  const proto = {cata: sum$cata, toString: sum$toString};
  const typeRep = proto.constructor = {
    toString: typeRepToString,
    prototype: proto,
    is: isType,
    '@@type': typeName,
  };
  Object.keys(constructors).forEach(tag => {
    const fields = constructors[tag];
    const tagProto = Object.create(proto);
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
  const tag = this[TAG];
  if (!fs[tag]) {
    throw new TypeError(`Constructors given to cata didn't include: ${tag}`);
  }
  return fs[tag](...this[VALUES]);
}

function sum$ctrToString() {
  return `${this[RET_TYPE]}.${this[TAG]}`;
}

function sum$toString() {
  return `${this.constructor[TYPE]}.${
    this[TAG]}${arrToString(this[VALUES])}`;
}

function typeRepToString() {
  return this[TYPE];
}

function tagged$toString() {
  return this.constructor[TYPE] + arrToString(this[VALUES]);
}

function sum$isVariant(val) {
  return Boolean(val) &&
        this[TAG] === val[TAG] &&
        this[RET_TYPE] === type(val);
}

function sum$isUnit(val) {
  return this === val || Boolean(val) &&
        this[TAG] === val[TAG] &&
        type(this) === type(val);
}

function isType(val) {
  return this[TYPE] === type(val);
}

function makeValue(fields, proto, values, argumentsLength) {
  if (argumentsLength !== fields.length) {
    throw new TypeError(
      `Expected ${fields.length} arguments, got ${argumentsLength}`
    );
  }
  const obj = Object.create(proto);
  defProp(obj, VALUES, values);
  for (let idx = 0; idx < fields.length; idx += 1) {
    obj[fields[idx]] = values[idx];
  }
  return obj;
}

// adopted version of withValue from    https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
function defProp(obj, prop, val) {
  const desc = defProp.desc || (
    defProp.desc = {
      enumerable: false,
      writable: false,
      configurable: false,
      value: null,
    }
  );
  desc.value = val;
  Object.defineProperty(obj, prop, desc);
}

// optimised version of `arr.map(toString).join(', ')`
function arrToString(arr) {
  if (arr.length === 0) return '';
  let str = `(${toString(arr[0])}`;
  for (let idx = 1; idx < arr.length; idx += 1) {
    str = `${str}, ${toString(arr[idx])}`;
  }
  return `${str})`;
}

function makeConstructor(fields, proto) {
  return Object.defineProperty(
    (...args) => makeValue(fields, proto, args, args.length)
    , 'length'
    , {value: fields.length}
  );
}
