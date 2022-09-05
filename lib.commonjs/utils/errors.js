"use strict";
//export type TransactionReceipt {
//}
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCallException = exports.isError = void 0;
/**
 *  try {
 *      // code....
 *  } catch (e) {
 *      if (isError(e, errors.CALL_EXCEPTION)) {
 *          console.log(e.data);
 *      }
 *  }
 */
function isError(error, code) {
    return (error && error.code === code);
}
exports.isError = isError;
function isCallException(error) {
    return isError(error, "CALL_EXCEPTION");
}
exports.isCallException = isCallException;
//# sourceMappingURL=errors.js.map