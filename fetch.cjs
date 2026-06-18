const fs = require('fs');
fetch('http://invenio.test/store')
    .then(r => r.text())
    .then(text => fs.writeFileSync('store.html', text))
    .catch(console.error);
