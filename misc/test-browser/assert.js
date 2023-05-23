
function throwError(message, info) {
  const error = new Error(`AssertionError: ${ message }`);
  error.code = "ERR_ASSERTION";
  for (const key in info) { error[key] = info[key]; }
  throw error;
}

export function equal(actual, expected, reason) {
  if (actual == expected) { return; }

  if (reason == null) { reason = `${ actual } == ${ expected }`; }
  throwError(reason, { actual, expected, operator: "==" });
}

function isDeepEqual(actual, expected, memo) {
  if (actual === expected) { return true; }

  // One or both things aren't objects
  if (actual === null || typeof(expected) !== 'object') {
    if (expected === null || typeof(expected) !== 'object') {
      return actual == expected;
    }

    return false;

  } else if (expected === null || typeof(expected) !== 'object') {
    return false;
  }

  if (Array.isArray(actual)) {
    if (!Array.isArray(expected) || actual.length !== expected.length) {
      return false;
    }

    for (let i = 0; i < actual.length; i++) {
      if (!isDeepEqual(actual[i], expected[i])) { return false; }
    }

    return true;
  }

  // Object
  const keysActual = Object.keys(actual).sort(), keysExpected = Object.keys(expected).sort();
  if (!isDeepEqual(keysActual, keysExpected)) { return false; }
  for (const key of keysActual) {
    if (!isDeepEqual(actual[key], expected[key], memo)) { return false; }
  }

  return true;
}

export function deepEqual(actual, expected, reason) {
  const memo = [ ];
  const isOk = isDeepEqual(actual, expected, memo);
  if (!isOk) {
     equal(actual, expected, reason);
  }
}

export function ok(check, reason) {
  equal(!!check, true, reason);
}

export function throws(func, checkFunc, reason) {
  try {
    func();

  } catch (e) {
    if (checkFunc(e)) { return; }

    throwError(`The expected exception validation function returned false`, {
      actual: e,
      expected: checkFunc,
      operation: "throws"
    });
  }

  throwError("Missing expected exception", {
    operator: "throws"
  });
}

export async function rejects(func, checkFunc, reason) {
  try {
    if (func.then) {
      await func;
    } else {
      await func();
    }
  } catch (e) {
    if (checkFunc(e)) { return true; }

    throwError(`The rejection validation function returned false`, {
      actual: e,
      expected: checkFunc,
      operation: "throws"
    });
  }

  throwError("Missing rejection", {
    operation: "rejects"
  });
}

export default {
  equal, deepEqual, ok, rejects, throws
};
