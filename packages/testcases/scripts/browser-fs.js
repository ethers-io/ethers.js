'use strict';

const fs = require('fs');
const path = require('path');
const through = require('through');

module.exports = function(pathname, options) {

    let data = '';
    return through(function(chunk) {
        data += chunk;
    }, function () {
        if (pathname.match(/\/browser-fs\.json$/)) {
            let contents = { "_": "browser-fs" };

            let info = JSON.parse(data);
            (info.dirs || []).forEach((dirname) => {
                let fulldirname = path.resolve(path.dirname(pathname), dirname);
                fs.readdirSync(fulldirname).forEach((filename) => {
                    contents[path.join(dirname, filename)] = fs.readFileSync(path.resolve(fulldirname, filename)).toString("base64");
                });
            });
            data = JSON.stringify(contents);
        }

        this.queue(data);
        this.queue(null);
    });
}
