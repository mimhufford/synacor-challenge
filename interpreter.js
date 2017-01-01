'use strict'

// take the raw file and map it in 2 bytes at a time as unsigned 16bit integers using little-endian
const raw = require('fs').readFileSync('challenge.bin')
const file = raw.toJSON().data.slice(raw.toJSON().data.length / 2).map((v, i) => raw.readUInt16LE(i * 2))

// memory
const register = [0, 0, 0, 0, 0, 0, 0, 0]
const stack = []
const input = []

// helper functions
const rval = i => i < 32768 ? i : register[i % 32768]
const lval = i => i % 32768

// virtual machine
const interpret = (file, position = 0) => {
    switch (file[position]) {
        case 0: // exit
            return
        case 1: // set a b - set reg a to b
            register[lval(file[position + 1])] = rval(file[position + 2])
            return interpret(file, position + 3)
        case 2: // push a - push a onto stack
            stack.push(rval(file[position + 1]))
            return interpret(file, position + 2)
        case 3: // pop a - pop stack and store in a
            register[lval(file[position + 1])] = stack.pop()
            return interpret(file, position + 2)
        case 4: // eq a b c - set a to b == c
            register[lval(file[position + 1])] = rval(file[position + 2]) === rval(file[position + 3]) ? 1 : 0
            return interpret(file, position + 4)
        case 5: // gt a b c - set a to b > c
            register[lval(file[position + 1])] = rval(file[position + 2]) > rval(file[position + 3]) ? 1 : 0
            return interpret(file, position + 4)
        case 6: // jmp a - jump to a
            return interpret(file, rval(file[position + 1]))
        case 7: // jt a b - if a non zero jump to b
            return interpret(file, rval(file[position + 1]) === 0 ? position + 3 : rval(file[position + 2]))
        case 8: // jf a b - if a zero jump to b
            return interpret(file, rval(file[position + 1]) !== 0 ? position + 3 : rval(file[position + 2]))
        case 9: // add a b c - assign a to b + c
            register[lval(file[position + 1])] = lval(rval(file[position + 2]) + rval(file[position + 3]))
            return interpret(file, position + 4)
        case 10: // mult a b c - assign a to b * c
            register[lval(file[position + 1])] = lval(rval(file[position + 2]) * rval(file[position + 3]))
            return interpret(file, position + 4)
        case 11: // mod a b c - assign a to b % c
            register[lval(file[position + 1])] = rval(file[position + 2]) % rval(file[position + 3])
            return interpret(file, position + 4)
        case 12: // and a b c - set a to b & c
            register[lval(file[position + 1])] = rval(file[position + 2]) & rval(file[position + 3])
            return interpret(file, position + 4)
        case 13: // and a b c - set a to b | c
            register[lval(file[position + 1])] = rval(file[position + 2]) | rval(file[position + 3])
            return interpret(file, position + 4)
        case 14: // not a b - set reg a to ~b
            register[lval(file[position + 1])] = (~rval(file[position + 2]) + 32768) % 32768
            return interpret(file, position + 3)
        case 15: // rmem a b - set reg a to mem b
            register[lval(file[position + 1])] = file[rval(file[position + 2])]
            return interpret(file, position + 3)
        case 16: // wmem a b - set mem a to b
            file[rval(file[position + 1])] = rval(file[position + 2])
            return interpret(file, position + 3)
        case 17: // call a - write next position to stack and jmp a
            stack.push(position + 2)
            return interpret(file, rval(file[position + 1]))
        case 18: // ret - return to address at top of stack
            return interpret(file, stack.pop())
        case 19: // out a - write the char a to the screen
            process.stdout.write(String.fromCharCode(rval(file[position + 1])))
            return interpret(file, position + 2)
        case 20: // in a - read a line and repeatedly store in reg a
            if (input.length == 0) input.push(...require('readline-sync').question("> ").split(""), '\n')
            register[lval(file[position + 1])] = input.shift().charCodeAt(0)
            return interpret(file, position + 2)
        case 21: // noop
            return interpret(file, position + 1)
        default:
            console.log("failed to interpret instruction " + position + " : " + file[position])
            return interpret(file, position + 1)
    }
}

interpret(file)