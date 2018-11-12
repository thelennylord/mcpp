#!/usr/bin/env node

`use strict`;

const path = require(`path`);

if (process.argv[2]) {
    let cmd = process.argv[2]
    if (cmd === `?` || cmd === `help`) {
        console.log(`mcpp help:\n
        mcpp i <input_dir> [output_dir] - Preprocesses (compiles) mcpp file into mcfunction\n
        mcpp v/version - Shows the version of mcpp running\n
        mcpp ?/help - Shows this message
        `);
    } else if (cmd === `v` || cmd === `version`) {
        console.log(`\nmcpp is currently running on v${require('../package.json').version}\n`);
    } else if (cmd === `i`) {
        let input = process.argv[3]
        let output;
        if (process.argv[4]) output = process.argv[4];
        else output = process.argv[4]
        if (input) require(`./files.js`).init(path.resolve(input));
        else throw new Error(`\nInput path cannot be undefined\n`);
    } else {
        console.log(`\nDo "mcpp help" to see usage information`);
    };
} else {
    console.log(`Do "mcpp help" to see usage information`);
};