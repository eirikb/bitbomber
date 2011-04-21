require.paths.unshift(__dirname + '/server');

process.addListener('uncaughtException', function (err, stack) {
  console.log('------------------------');
  console.log('Exception: ' + err);
  console.log(err.stack);
  console.log('------------------------');
});

/*
require('bitbomber');

new Bitbomber(8000);
*/
