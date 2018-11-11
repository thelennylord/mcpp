# mcpp - Minecraft function preprocessor
mcpp is a [Minecraft function](https://minecraft.gamepedia.com/Function) preprocessor, which makes working in Minecraft functions more easier.

mcpp is in alpha, so you may experience bugs and glitches. If you encounter them, you can create an issue to report it.

## Install
```
npm i -g mcpp
```

# Getting started
To get started learning mcpp, take a look at our [documentation](https://github.com/thelennylord/mcpp/wiki).


# Example
```
@desc Adds some interesting features to the game
@type normal
@export single

# Makes the water poisonous!
if (block ~ ~ ~ water as @a at @s) {
    effect give @a minecraft:poison 1 1 false
}

function goldParty() {
    tellraw @a {"text":"Someone stepped on a gold block!"}
    kill @a
}

# Kills everyone if a player is on a gold block
if (block ~ ~-1 ~ gold_block as @a at @s) {
    tellraw @s {"text":"You should be more careful..."}
    goldParty()
}
```
The above example adds some features to the game by making water poisonous and by killing everyone if you step on a gold block. It produces a single mcfunction file which shares the same name as that of the mcpp file.


# Contributing
I haven't added enough documentation to make it practical for others to contribute to the language itself. If you are interested in fixing a bug or adding a feature, feel free to make a pull request.
