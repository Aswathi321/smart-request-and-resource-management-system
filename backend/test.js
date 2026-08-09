const fs = require('fs');
try {
  require('./index');
} catch (e) {
  fs.writeFileSync('err.txt', e.stack);
}
