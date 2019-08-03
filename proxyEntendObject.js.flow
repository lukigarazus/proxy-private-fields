const getObjectThatHasAKey = (objects, key) =>
  objects.find(object => Object.keys(object).includes(key));

const extend = (object, objects, { shadowKeys = false } = {}) =>
  new Proxy(object, {
    get(t, p) {
      return getObjectThatHasAKey([t, ...objects], p)[p];
    },
    set(t, p, v) {
      if (shadowKeys) {
        t[p] = v;
      } else {
        const objectThatHasTheKey =
          getObjectThatHasAKey([t, ...objects], p) || t; // If there are no objects containing this key then add it to the target
        objectThatHasTheKey[p] = v;
      }
      return true;
    }
  });

export default extend;
