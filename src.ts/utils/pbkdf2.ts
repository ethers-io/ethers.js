"use strict";

import { arrayify } from "./bytes";

// Imported Types
import { Arrayish } from "./bytes";
import libraries from "../libraries";

function bufferify(value: Arrayish): Buffer {
  return Buffer.from(arrayify(value));
}

export function pbkdf2(
  password: Arrayish,
  salt: Arrayish,
  iterations: number,
  keylen: number,
  hashAlgorithm: string
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    libraries.pbkdf2(
      bufferify(password),
      bufferify(salt),
      iterations,
      keylen,
      hashAlgorithm,
      (err, derivedKey) => {
        if (err) {
          reject(err);

          return;
        }

        resolve(arrayify(derivedKey));
      }
    );
  });
}
