import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
export function saveTests(tag, data) {
    let filename = path.resolve(__dirname, '../testcases', tag + '.json.gz');
    fs.writeFileSync(filename, zlib.gzipSync(JSON.stringify(data, undefined, ' ') + '\n'));
    console.log('Save testcase: ' + filename);
}
export function loadTests(tag) {
    let filename = path.resolve(__dirname, '../testcases', tag + '.json.gz');
    return JSON.parse(zlib.gunzipSync(fs.readFileSync(filename)).toString());
}
export function loadData(filename) {
    return fs.readFileSync(path.resolve(__dirname, filename));
}
//# sourceMappingURL=disk-utils.js.map