require.paths.unshift(__dirname + '/server');
require.paths.unshift(__dirname + '/shared');
require.paths.unshift(__dirname + '/lib');

process.addListener('uncaughtException', function (err, stack) {
  console.log('------------------------');
  console.log('Exception: ' + err);
  console.log(err.stack);
  console.log('------------------------');
});

var Bomberman = require('./server/bomberman');

new Bomberman(8000);
