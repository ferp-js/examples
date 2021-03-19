const fs = require('fs');
const { main } = require('./main.js');

main('hello-world.txt', fs.readFile);
main('hello-world.txt-not-exists', fs.readFile);
