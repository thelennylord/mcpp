/**
 * Manages pack creation of mcpp
 */

`use strict`;

const fs = require(`fs`);
const path = require(`path`);
const mkdirp = require(`mkdirp`);
const parser = require(`./parser.js`);

let mcppdatajson;
let mcppdatapath;
let structureCreated = false;
let mcDir = false;
let loopFile = false;
let loadFile = false;

const getParentPath = (a, b, callback) => {
    a = a.replace(/\\/g, "/");
    b = b.replace(/\\/g, "/");
    let c = b.indexOf(a);
    if (c === -1) return false;
    else {
        let l = a.length;
        let d;
        if (c === 0) d = b.substring(l);
        else {
            d = b.subtring(0, c)
            d = b.subtring(c + l);
        };
        return callback(d.trim());
    };
};

const createPack = (p, o, callback) => {
    p = path.resolve(p);
    const search = (startPath, callback) => {
        if (!fs.existsSync(startPath)) throw new Error(`Invalid file path ${startPath}`);
        filter = `.mcpp`;
        let result = [];
        let files = fs.readdirSync(startPath);
        for (let i = 0; i < files.length; i++) {
            let filepath = path.join(startPath, files[i]);
            let stat = fs.lstatSync(filepath);
            if (stat.isDirectory()) search(filepath, callback);
            else if (filepath.indexOf(filter) >= 0 && !result.includes(filepath)) result.push(filepath);
        };
        if (!result.length) return;
        else return callback(result);
    };
    search(path.dirname(p), (res) => {
        if (!res.length) throw new Error(`\nCould not find any .mcpp file in ${p}\n`);
        for (let i = 0; i < res.length; i++) {
            parser(res[i], mcppdatapath, true);
        };
    });
};

module.exports.init = (p, o) => {
    // detect whether the file is mcppdata or mcpp
    if (path.extname(p) == `.mcpp`) {
        // if the user puts .mcpp file as input, assume file's export type is single
        // if it isn't single, throw an error
        parser(p, o, false);
    } else if (path.basename(p) == `mcppdata.json`) {
        // if the user puts mcppdata.json file then assume export type is pack
        let mcppdata = require(path.resolve(p));
        if (!mcppdata.name) throw new Error(`mcppdata missing "name"`);
        else if (!mcppdata.description) throw new Error(`mcppdata missing "description"`);
        mcppdatapath = path.resolve(path.dirname(p));
        mcppdatajson = mcppdata;
        createPack(p, o);
    } else throw new Error(`\nPath does not reach to .mcpp or mcppdata.json\n`); 
};

module.exports.final = async (data, output, isNeeded) => {
    // manages export of files
    let json = data;
    let name = json.name;
    let dir = path.dirname(json.path);
    let type = json.export;
    let content = json.content;
    let datapack = `${path.resolve(output)}/${mcppdatajson.name}`;

    if (!structureCreated) {
        let mcmeta = {
            "pack": {
                "pack_format": 4,
                "description": mcppdatajson.description
            }
        };
        mkdirp.sync(`${datapack}/data/${mcppdatajson.name}/functions`);
        fs.writeFileSync(`${datapack}/pack.mcmeta`, JSON.stringify(mcmeta));
        structureCreated = true;
    };

    if (!mcDir && isNeeded) {
        mkdirp.sync(`${datapack}/data/minecraft/tags/functions`);
        mcDir = true;
    };
    
    const getRelative = (oh, wow, yes) => {
        let toReturn;
        getParentPath(mcppdatapath, oh, (res) => {
            if (!yes) {
                if (res == ``) {
                    toReturn = `/${wow}.mcfunction`;
                } else {
                    mkdirp.sync(`${datapack}/data/${mcppdatajson.name}/functions${res}`);
                    toReturn = `${res}/${wow}.mcfunction`;
                }
            } else {
                if (res == ``) toReturn = `${mcppdatajson.name}:${wow}`;
                else toReturn = `${mcppdatajson.name}:${res.substring(1)}/${wow}`;
            };
        });
        return toReturn;
    };

    if  (type == `loop`) {
        if (!loopFile) {
            let ticknew = {
                "values": []
            };
            fs.writeFileSync(`${datapack}/data/minecraft/tags/functions/tick.json`, JSON.stringify(ticknew));
            loopFile = true;
        }
        let tick = fs.readFileSync(`${datapack}/data/minecraft/tags/functions/tick.json`, `utf-8`);
        tick = JSON.parse(tick);
        tick[`values`].push(getRelative(dir, name, true));
        fs.writeFileSync(`${datapack}/data/minecraft/tags/functions/tick.json`, JSON.stringify(tick));
        fs.writeFileSync(`${datapack}/data/${mcppdatajson.name}/functions${getRelative(dir, name, false)}`, content.join(`\r\n`));
    } else if (type == `load`) {
        if (!loadFile) {
            let loadnew = {
                "values": []
            };
            fs.writeFileSync(`${datapack}/data/minecraft/tags/functions/load.json`, JSON.stringify(loadnew));
            loadFile = true;
        }
        let load = fs.readFileSync(`${datapack}/data/minecraft/tags/functions/load.json`, `utf-8`);
        load = JSON.parse(load);
        load[`values`].push(getRelative(dir, name, true));
        fs.writeFileSync(`${datapack}/data/minecraft/tags/functions/load.json`, JSON.stringify(load));
        fs.writeFileSync(`${datapack}/data/${mcppdatajson.name}/functions${getRelative(dir, name, false)}`, content.join(`\r\n`));
    } else if (type == `normal`) {
        fs.writeFileSync(`${datapack}/data/${mcppdatajson.name}/functions${getRelative(dir, name, false)}`, content.join(`\r\n`));
    };
};