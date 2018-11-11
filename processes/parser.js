`use strict`;

const fs = require(`fs`);
const path = require(`path`);

const combi = () => {
    let _length = 10;
    let combination = "";
    let possibiliies = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      
    for (var i = 0; i < _length; i++)
    combination += possibiliies.charAt(Math.floor(Math.random() * possibiliies.length));
      
    return combination;
};

module.exports = (input, out, isPack) => {
    if (!input) throw new Error(`Input cannot be undefined`);
    input = path.resolve(input);
    if (out && !fs.existsSync(out) && !fs.lstatSync(out).isDirectory()) throw new ReferenceError(`Output cannot be undefined`);
    if (!path.extname(input) == `.mcpp`) throw new ReferenceError(`Input is not a .mcpp file`);
    if (!out) out = path.dirname(path.resolve(input));

    fs.readFile(input, `utf-8`, (err, data) => {
        if (err) throw err;
        let mcfunc_type = false;
        let isNeeded = false;
        let func_dummy = false;
        let hasExportProp = false;
        let filename = path.basename(input).replace(/\.[^/.]+$/, "");
        let output = []; 
        let scanning_func = []; 
        let scanning_if = [];
        let scanning_total = [];
        let parentprop = [];
        let summonASF = []; 
        let commons = [];
        let ifTagsAdd = [];
        let ifStatements = [];
        let functionsExecutor = [];
        let functionsContent = [];
        let ifTagsRemover = [];

        let content = data.toString().split(`\n`);
        data.toString().includes(`\r`) ? content = data.toString().split(`\r\n`) : ``;

        const ifIf = () => {
            if (!parentprop.length) return ``;
            else return `,tag=${parentprop.join(`,tag=`)}`;
        };

        const funFun = () => {
            if (!scanning_func.length) return ``;
            else return `,tag=${scanning_func.join(`,tag=`)}`;
        }

        for (let lines = 0; lines < content.length; lines++) { // for loop is much better and faster than for..in
            let line = content[lines].trim();
            if (line.startsWith(`#`)) continue;
            else if (line.trim().startsWith(`@`)) {
                let property = line.trim().slice(1).split(/ +/g);
                if (property[0] == `type`) {
                    if (property[1] == `loop`) {
                        mcfunc_type = `loop`;
                        isNeeded = true;
                    } else if (property[1] == `load`) {
                        mcfunc_type = `load`;
                        isNeeded = true;
                    } else if (property[1] == `normal`) {
                        mcfunc_type = `normal`;
                    } else throw new TypeError(`Invalid sub property ${property[1]} of @type at line ${lines + 1}`);
                } else if (property[0] == `desc`) {
                    // some desc about the file, will be turned into a mcfunction comment later on
                    let _desc = property.slice(1).join(` `);
                    output.unshift(`# ${_desc.trim()}`);
                } else if (property[0] == `export`) {
                    let type = property.slice(1).join(` `);
                    if (type == `single`) {
                        if (isPack) return;
                        else hasExportProp = true;
                    } else if (type == `pack`) {
                        if (!isPack) throw new Error(`Export property of file expected to be pack but received single`);
                        else hasExportProp = true;
                    } else throw new ReferenceError(`Invalid sub property ${type} of @export at line ${lines + 1}`);
                } else {
                    throw new TypeError(`Invalid property at line ${lines + 1}`);
                };
            } else if (line.startsWith(`function`)) {
                let args = line.trim().slice(`function`.length + 1).split(/ +/g);
                if (args[0] !== `()` && args[0] !== `{` && (args[0].substring(args[0].length -2) == `()` && args[1] == `{`) || (args[0].substring(args[0].length-3) == `(){`)) {
                    if (!func_dummy) {
                        // https://bugs.mojang.com/browse/MC-136112
                        // summonASF.push(`execute unless entity @e[type=armor_stand,name="mcppfunc",limit=1] run forceload add ~ ~ ~ ~`);
                        summonASF.push(`execute unless entity @e[type=armor_stand,name="mcppfunc",limit=1] run summon minecraft:armor_stand ~ 256 ~ {Invisible:1b,Invulnerable:1b,NoGravity:1b,CustomName:"\\"mcppfunc\\"",CustomNameVisible:0b}`);
                        func_dummy = true;
                    };
                    let func_name = args[0].substring(0, args[0].length -2);
                    if (args[0].substring(args[0].length-3) == `(){`) func_name = args[0].substring(0, args[0].length -3);
                    scanning_func.push(func_name);
                    scanning_total.push(`function`);
                    if (!scanning_func.length) throw new Error(`Error while parsing function on line ${lines + 1}`); //incase
                } else throw new TypeError(`Function statement not defined properly at line ${lines + 1}`);
            }  else if (line.trim().startsWith(`if`)) {
                let statement = line.slice(`if`.length).trim();
                if (statement.substring(0, 1) == `(` && statement.substring(statement.length-3) == `) {`) {
                    let cmd = statement.substring(1).substring(0, statement.length-2).substring(0, statement.length-4).trim();
                    let dd = combi();
                    scanning_if.push(`execute if ${cmd} run`);
                    ifTagsAdd.push(`execute as @e[type=armor_stand,name="mcppfunc",limit=1${funFun()}${ifIf()},tag=!${dd}] run ${scanning_if.join(` `)} tag @e[type=armor_stand,name="mcppfunc",limit=1${funFun()}${ifIf()},tag=!${dd}] add ${dd}`);
                    parentprop.push(dd);
                    scanning_total.push(`if`);
                } else throw TypeError(`if statement not constructed properly at line ${lines + 1}`);
            } else if (func_dummy && line.substring(line.length-2) == `()`) {
                //handles execution of function
                let calling_func = line.substring(0, line.length-2);
                if (scanning_func[scanning_func.length-1] == calling_func) throw new TypeError(`The same function cannot be executed inside itself at line ${lines + 1}`);
                if (!scanning_if.length && scanning_func.length) functionsExecutor.unshift(`tag @e[type=armor_stand,name="mcppfunc"${funFun()},tag=!${calling_func}] add ${calling_func}`);
                else functionsExecutor.unshift(`execute as @e[type=armor_stand,name="mcppfunc",limit=1${funFun()}${ifIf()}] run tag @e[type=armor_stand,name="mcppfunc",tag=!${calling_func}] add ${calling_func}`);
            } else if (line.trim().startsWith(`}`) && scanning_total.length) {
                if (scanning_total[scanning_total.length - 1] == `function`) {
                    functionsContent.push(`execute as @e[type=armor_stand,name="mcppfunc",limit=1,tag=${scanning_func[scanning_func.length-1]}] run tag @e[type=armor_stand,name="mcppfunc",limit=1,tag=${scanning_func[scanning_func.length-1]}] remove ${scanning_func[scanning_func.length-1]}`);
                    scanning_func.pop();
                    scanning_total.pop();
                } else if (scanning_total[scanning_total.length - 1] == `if`) {
                    ifTagsRemover.push(`execute as @e[type=armor_stand,name="mcppfunc",limit=1${ifIf()}] run tag @e[type=armor_stand,name="mcppfunc",limit=1${ifIf()}] remove ${parentprop[parentprop.length - 1]}`);
                    scanning_if.pop();
                    scanning_total.pop();
                    parentprop.pop();
                } else throw new Error(`Error occurred at line ${lines + 1}`);
            } else if (line.trim().startsWith(`store`)) {
                // TODO
                let var_name = line.trim().slice(5).split(/ +/g);
                if (var_name[1] == `=`) {
                    // TODO
                } else {
                    throw new Error(`Variable not defined properly at line ${lines + 1}`);
                }
            } else if (line.trim().startsWith(`var`)) {
                // var is used for storing only int without using execute store
            } else if (line) {

                    if (scanning_total[scanning_total.length-1] == `function`) {
                        if (!scanning_if.length && scanning_func.length) functionsContent.push(`execute as @e[type=armor_stand,name="mcppfunc",limit=1${funFun()}] run ${line.trim()}`); //
                        else if (scanning_func.length && scanning_if.length) functionsContent.push(`execute as @e[type=armor_stand,name="mcppfunc",limit=1${funFun()}${ifIf()}] run ${line.trim()}`);
                        
                    } else if (scanning_total[scanning_total.length-1] == `if`) {
                        if (!scanning_func.length && scanning_if.length) ifStatements.push(`${scanning_if.join(` `)} ${line.trim()}`);
                        else if (scanning_func.length && scanning_if.length) ifStatements.push(`execute as @e[type=armor_stand,name="mcppfunc",limit=1${funFun()}${ifIf()}] run ${scanning_if.join(` `)} ${line.trim()}`);

                    } else if (!scanning_total.length) commons.push(line);
                    else throw new Error(`Error occurred at line ${lines + 1}`);
            };
        };

        if (!mcfunc_type) throw new Error(`@type missing from ${filename}.mcpp`);
        if (!hasExportProp) throw new Error(`@export missing from ${filename}.mcpp`);

        output = summonASF.concat(commons).concat(ifTagsAdd).concat(ifStatements).concat(functionsExecutor).concat(functionsContent).concat(ifTagsRemover);

        if (isPack) require(`./files.js`).final({
            "name": filename,
            "path": input,
            "export": mcfunc_type,
            "content": output
        }, out, isNeeded);
        else {
            fs.writeFile(`${out}/${filename}.mcfunction`,  output.join(`\r\n`), (err) => {
                if (err) throw err;
            });
        };
    });
};