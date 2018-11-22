# mcpp - Minecraft function preprocessor
[![Build Status](https://travis-ci.com/thelennylord/mcpp.svg?branch=master)](https://travis-ci.com/thelennylord/mcpp)

mcpp is a [Minecraft function](https://minecraft.gamepedia.com/Function) preprocessor, which makes working in Minecraft functions more easier.

mcpp is in alpha, so you may experience bugs and glitches. If you encounter them, you can create an [issue](https://github.com/thelennylord/mcpp/issues) to report it.

## Install
```
npm i -g mcpp
```

# Getting started
## Usage
Once you have downloaded the package, you can compile a mcpp into mcfunction by running the command `mcpp <input> [output]` from the command line or from a JavaScript file.

To get started on learning how to program in mcpp, take a look at our [documentation](https://github.com/thelennylord/mcpp/wiki).

# Examples
mcpp has two types of export settings which can compile your file into a standalone mcfunction or either compile your file and makes it a Minecraft datapack (mcpp makes the datapack for you so you do not need to worry about creating one). The following examples given below show these features of mcpp.

## Example 1
```
@desc Adds some interesting features to the game
@type normal
@export single

# The type of the file is normal (it won't loop or fire on load)
# Here the export is single, so it will be compiled into a standalone file

# Makes the water poisonous!
if ([as @a at @s] block ~ ~ ~ water) {
    effect give @a minecraft:poison 1 1 false
}

function goldParty() {
    tellraw @a {"text":"Someone stepped on a gold block!"}
    kill @a
}

# Kills everyone if a player is on a gold block
if ([as @a at @s] block ~ ~-1 ~ gold_block) {
    tellraw @s {"text":"You should be more careful..."}
    goldParty()
} else {
    tellraw @s {"text":"You are not on a gold block!"}
}
```
The above example adds some features to the game by making water poisonous and by killing everyone if you step on a gold block. It produces a single mcfunction file which shares the same name as that of the mcpp file.

## Example 2
```
@desc Prevent others from jumping
@type loop
@export pack

# Here, the type is set loop (the file will loop, that is, it will fire every tick in Minecraft)
# The export is set to pack (mcpp will create a datapack and include this file in it). 
# We'll see more about the power of mcpp's datapack creation where multiple files can be included in the same datapack mcpp makes

local MAX_HEALTH = 100

if ([as @a] score @s Health matches 0) {
    tellraw @s {"text":"You died!"}
    kill @s
    scoreboard players set @s Health $MAX_HEALTH
}

if ([as @a] score @s Magic matches 25..) {
    tellraw @s {"text":"You have plenty of magic left!"}
} elseif ([as @a] score @s Magic matches ..25) {
    tellraw @s {"text":"You are running out of magic!"}
} else {
    tellraw @s {"text":"You ran out of magic!"}
}
```
To learn about this, take a look at the [documentation](https://github.com/thelennylord/mcpp/wiki).

# Contributing
I haven't added enough documentation to make it practical for others to contribute to the language itself. If you are interested in fixing a bug or adding a feature, feel free to make a pull request. If you have more question, feel free to join the mcpp [Discord](https://discord.gg/zpAcaNe) server.
