require.paths.unshift(__dirname + '/src');
require.paths.unshift(__dirname + '/lib');

process.addListener('uncaughtException', function (err, stack) {
  console.log('------------------------');
  console.log('Exception: ' + err);
  console.log(err.stack);
  console.log('------------------------');
});

var BlastingBob = require('./src/blastingbob');

new BlastingBob(8000);
