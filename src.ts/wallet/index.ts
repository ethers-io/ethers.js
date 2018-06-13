'use strict';

import { Wallet } from './wallet';
import * as HDNode from './hdnode';
import { SigningKey } from './signing-key';

export { HDNode, SigningKey, Wallet };

/*

// Exporting
export = {
    HDNode: HDNode,
    Wallet: Wallet,

    SigningKey: SigningKey
};

// Default TypeScript
export default exporting;

// Node exports
declare var module: any;
(module).exports = exporting;
*/
