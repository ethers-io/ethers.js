
function getTime() {
    return (new Date()).getTime();
}

function getDelta(t0) {
    var ds = parseInt((getTime() - t0) / 1000);
    var minutes = parseInt(ds / 60);
    var seconds = String(parseInt(ds) % 60);
    while (seconds.length < 2) { seconds = '0' + seconds; }
    return '(' + minutes + ':' + seconds + ')';
}

function Reporter(runner) {
    var self = this;
    var suites = [];

    function getIndent() {
        var result = '';
        for (var i = 0; i < suites.length; i++) { result += '  '; }
        return result;
    }

    runner.on('suite', function(suite) {
        if (!suite.title) {
            console.log(getIndent() + 'Testing: Found ' + suite.suites.length + ' test suites');
        } else {
            var filename = (suite.file || '').split('/').pop();
            if (filename) { filename = ' (' + filename + ')'; }
            console.log(getIndent() + 'Test Suite: ' + suite.title + filename);
        }
        suites.push(suite);
        suite._t0 = getTime();
        suite._countFail = 0;
        suite._countPass = 0;
        suite._countTotal = 0;
    });

    runner.on('suite end', function() {
        var suite = suites.pop();
        console.log(getIndent() + '  Total Tests: ' + suite._countPass + '/' + suite._countTotal + ' passed ' + getDelta(suite._t0));
        console.log('');
        if (suites.length > 0) {
            var currentSuite = suites[suites.length - 1];
            currentSuite._countFail += suite._countFail;
            currentSuite._countPass += suite._countPass;
            currentSuite._countTotal += suite._countTotal;
        }
    });

    runner.on('test', function(test) {
        var currentSuite = suites[suites.length - 1];
        currentSuite._countTotal++;
    });

    runner.on('fail', function(test, error) {
        var currentSuite = suites[suites.length - 1];
        currentSuite._countFail++;

        var countFail = currentSuite._countFail;
        var indent = getIndent();

        if (countFail > 100) {
            if (countFail === 101) {
                console.log(indent + '[ Over 100 errors; skipping remaining suite output ]');
            }
            return;
        }

        if (countFail > 25) {
            console.log(indent + 'Failure: ' + test.title + ' (too many errors; skipping dump)');
            return;
        }

        console.log(indent + 'Failure: ' + test.title);
        error.toString().split('\n').forEach(function(line) {
            console.log(indent + '  ' + line);
        });
        Object.keys(error).forEach(function(key) {
            console.log(indent + '  ' + key + ': ' + error[key]);
        });
        error.stack.split('\n').forEach(function(line) {
            console.log(indent + '  ' + line);
        });
    });

    runner.on('pass', function(test) {
        var currentSuite = suites[suites.length - 1];
        currentSuite._countPass++;
    });

/*
    runner.once('end', function() {
        var ds = ((new Date()).getTime() - t0) / 1000;
        var minutes = ds / 60;
        var seconds = String(ds % 60);
        while (seconds.length < 2) { seconds = '0' + seconds; }
        console.log('Completed in ' + minutes + ':' + seconds);
    });
*/
}

module.exports = Reporter;
