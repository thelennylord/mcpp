`use strict`;

const path = require(`path`);

module.exports = (input, output) => {
    if (!output) output = ``;
    if (input) require(`./processes/files.js`).init(path.resolve(input));
    else throw new Error(`\nInput path cannot be undefined\n`);
};