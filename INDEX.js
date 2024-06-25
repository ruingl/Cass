var { spawn } = require('child_process');

var start = function() {
  var child = spawn('node SRC/MAIN.js', {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  child.on('close', function(code) {
    if (code === 2) {
      start();
    }
  });
}

start();