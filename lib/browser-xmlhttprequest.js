'use strict';

try {
    console.log('Starting load xml')
    module.exports.XMLHttpRequest = XMLHttpRequest;
    console.log('Done load xml')
} catch(error) {
    console.log('Warning: XMLHttpRequest is not defined');
    module.exports.XMLHttpRequest = null;
}
