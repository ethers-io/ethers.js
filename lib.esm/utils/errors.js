//export type TransactionReceipt {
//}
/**
 *  try {
 *      // code....
 *  } catch (e) {
 *      if (isError(e, errors.CALL_EXCEPTION)) {
 *          console.log(e.data);
 *      }
 *  }
 */
export function isError(error, code) {
    return (error && error.code === code);
}
export function isCallException(error) {
    return isError(error, "CALL_EXCEPTION");
}
//# sourceMappingURL=errors.js.map