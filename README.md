# proxy-private-fields

This package enables you to create JS objects with private fields. You can define your own rules for private field detection, behaviour on overwrite attempts and more.

The default behaviour is such:

```javascript
import privatize, { lockpick } from "proxy-private-fields";

const object = {
  "@private a": 1,
  b: 2,
};

const privatized = privatize(object);

console.log(privatized.a); // undefined
console.log(privatized.b); // 2
```

As we can see, the privatized object blocks access to fields which have been annotated with `@private`. This behaviour can be of course customized, either via your own regexp or a handler:

```javascript
const object1 = {
  "myOwnPrefix a": 1,
  b: 2,
};

const object2 = {
  c: 3,
  d: 4,
};

const privateFields = ["c"];

const privatizedWithCustomRegExp = privatize(object1, {
  regexp: /^myOwnPrefix/,
});

const privatizedWithCustomHandler = privatize(object2, {
  handler: (object) => {
    return privateFields.map((el) => [el, el]);
  },
});

console.log(privatizedWithCustomRegExp.a); // undefined
console.log(privatizedWithCustomRegExp.b); // 2

console.log(privatizedWithCustomHandler.c); // undefined
console.log(privatizedWithCustomHandler.d); // 4
```

Bear in mind that the handler has to return `pairs` of keys. In this case this might seem a bit redundant, but in cases where a regexp is used the function has to know how the fields in the original object are named and how they are supposed to be named in the target one.

As you probably noticed in the import section, the package exposes something called `lockpick`. This is by default a `Symbol` that enables you to reconstruct the whole object, together with the private fields. In the next example I will show you how it's done. I will also demontrate the fact, that `methods` have access to private fields.

```javascript
const object = {
  "@private a": 1,
  b: 2,
  method() {
    this.a = 3;
    this.b = 4;
    console.log(this.a, this.b);
  },
};

const privatized = privatize(object);

privatized.method(); // 3 4

console.log(privatized.a); // undefined
console.log(privatized.b); // 4

const lockpicked = privatized[lockpick];

console.log(lockpicked.a); // 3
console.log(lockpicked.b); // 4

console.log(lockpicked === privatized); // false
console.log(lockpicked === object); // false
```

Bear in mind that using the `lockpick` creates a new reference. This is of course also customizable:

```javascript
const object = {
  "@private a": 1,
  b: 2,
};

const privatized = privatize(object, { newReferenceOnLockpick: false });

const lockpicked = privatized[lockpick];

console.log(lockpicked === privatized); // false
console.log(lockpicked === object); // true

console.log(lockpicked.a); // 1
```

The last thing I want to talk about are `overwrite errors`:

```javascript
const object = {
  "@private a": 1,
  b: 2,
};

const privatized = privatize(object);

privatized.a = 3; // Throws an error
```

If you want to prevent this, you can pass your own error handler:

```javascript
const object = {
  "@private a": 1,
  b: 2,
};

const privatized = privatize(object, {
  overwriteHandler: (target, path, value) => {
    console.log("This field cannot be mutated");
  },
});

privatized.a = 3; // This field cannot be mutated
```
