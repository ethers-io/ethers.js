import { dirname, resolve as _resolve } from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const ROOT = _resolve(__dirname, "../../../");
export function resolve(...args) {
    args = args.slice();
    args.unshift(ROOT);
    return _resolve.apply(null, args);
}
//# sourceMappingURL=path.js.map