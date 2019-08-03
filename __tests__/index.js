import privatize, { lockpick } from "../src/index";

describe("privatize(object, regexp, handler)", () => {
  it("Default handler, regexp, error, lockpick work", () => {
    const obj = {
      "@private a": 2,
      b: 3,
      method() {
        this.a = 3;
      }
    };
    const privatized = privatize(obj);
    privatized.method();
    expect(privatized.a).toBeFalsy();
    expect(privatized.b).toEqual(3);
    try {
      privatized.a = 4;
    } catch (e) {
      expect(e).toBeTruthy();
    }
    const lockpicked = privatized[lockpick];
    expect(lockpicked.a).toEqual(3); // Change from the method applied
    expect(lockpicked === obj).toBeFalsy();
  });
});
