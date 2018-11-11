#!/usr/bin/env node
`use strict`;

const path = require(`path`);

// for command-line use
if (process.argv[2]) {
    let cmd = process.argv[2]
    if (cmd === `?` || cmd === `help`) {
        console.log(`mcpp help:\n
        mcpp i <input_dir> [output_dir] - Preprocesses (compiles) mcpp file into mcfunction\n
        mcpp v/version - Shows the version of mcpp running\n
        mcpp ?/help - Shows this message
        `);
    };

    if (cmd === `v` || cmd === `version`) {
        console.log(`\nmcpp is currently running on v${require('./package.json').version}\n`);
    };

    if (cmd === `i`) {
        let input = process.argv[3]
        let output;
        if (process.argv[4]) output = process.argv[4];
        else output = process.argv[4]
        if (input) require(`./processes/files.js`).init(path.resolve(input));
        else throw new Error(`\nInput path cannot be undefined\n`);
    };
};

// for script use
exports = (input, output) => {
    if (!output) output = ``;
    if (input) require(`./processes/files.js`).init(path.resolve(input));
    else throw new Error(`\nInput path cannot be undefined\n`);
};