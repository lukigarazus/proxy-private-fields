"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.lockpick = void 0;

var _proxyEntendObject = _interopRequireDefault(require("./proxyEntendObject"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEFAULT_REGEXP = /^@private (.+$)/;
const DEFAULT_LOCKPICK = Symbol("lockpick");

const mutableMerge = (...objects) => objects.reduce((acc, obj) => {
  Object.keys(obj).forEach(key => acc[key] = obj[key]);
  return acc;
});

const defaultOverwriteHandler = (t, p, v) => {
  throw new Error(`Cannot overwrite private field "${p}"`);
};

const defaultHandler = (object, regexp) => {
  const keys = Object.keys(object);
  return keys.map(key => {
    const match = key.match(regexp);
    return match && [key, match[1]];
  }).filter(Boolean);
};
/* The goal of making certain fields private could be achieved in a different way, for example
by checking the fields on the get trap and returning undefined for the private ones. The reason
for such a behaviour is explained below.
*/


const privatize = (object, {
  handler = defaultHandler,
  lockpick = DEFAULT_LOCKPICK,
  newReferenceOnLockpick = true,
  overwriteHandler = defaultOverwriteHandler,
  regexp = DEFAULT_REGEXP
} = {}) => {
  const privateFields = handler(object, regexp);
  const privateObj = privateFields.reduce((acc, [withPrivateIndicator, withoutPrivateIndicator]) => {
    acc[withoutPrivateIndicator] = object[withPrivateIndicator];
    delete object[withPrivateIndicator]; // This is a bit radical, but this way we make sure that there is absolutely no way of accessing these keys

    return acc;
  }, {});
  return new Proxy(object, {
    get(t, p) {
      if (p === lockpick) return newReferenceOnLockpick ? { ...privateObj,
        ...t
      } : mutableMerge(t, privateObj);
      const value = t[p];

      if (typeof value === "function") {
        // Enable methods to access private fields
        return value.bind((0, _proxyEntendObject.default)(t, [privateObj]));
      }

      return value;
    },

    set(t, p, v) {
      if (privateFields.find(([_w, wout]) => p === wout)) {
        overwriteHandler(t, p, v);
      } else {
        t[p] = v;
      }

      return true;
    }

  });
};

const lockpick = DEFAULT_LOCKPICK;
exports.lockpick = lockpick;
var _default = privatize;
exports.default = _default;
//# sourceMappingURL=index.js.map