'use strict'

// take the raw file and map it in 2 bytes at a time as unsigned 16bit integers using little-endian
const raw = require('fs').readFileSync('challenge.bin')
const file = raw.toJSON().data.slice(raw.toJSON().data.length / 2).map((v, i) => raw.readUInt16LE(i * 2))

// helper functions
const formatChar = i => i < 32768 ? String.fromCharCode(i) : "reg[" + i % 32768 + "]"
const format = i => i < 32768 ? i : "reg[" + i % 32768 + "]"

// dissasmbler
const disassemble = (file, position = 0, data = []) => {
    if (position >= file.length) return data
    else
        switch (file[position]) {
            case 0:
                data.push(position + " HALT")
                return disassemble(file, position + 1, data)
            case 1:
                data.push(position + " SET " + format(file[position + 1]) + " " + format(file[position + 2]))
                return disassemble(file, position + 3, data)
            case 2:
                data.push(position + " PUSH " + format(file[position + 1]))
                return disassemble(file, position + 2, data)
            case 3:
                data.push(position + " POP " + format(file[position + 1]))
                return disassemble(file, position + 2, data)
            case 4:
                data.push(position + " EQ " + format(file[position + 1]) + " " + format(file[position + 2]) + " " + format(file[position + 3]))
                return disassemble(file, position + 4, data)
            case 5: // gt a b c - set a to b > c
                data.push(position + " GT " + format(file[position + 1]) + " " + format(file[position + 2]) + " " + format(file[position + 3]))
                return disassemble(file, position + 4, data)
            case 6: // jmp a - jump to a
                data.push(position + " JMP " + format(file[position + 1]))
                return disassemble(file, position + 2, data)
            case 7: // jt a b - if a non zero jump to b
                data.push(position + " JT " + format(file[position + 1]) + " " + format(file[position + 2]))
                return disassemble(file, position + 3, data)
            case 8: // jf a b - if a zero jump to b
                data.push(position + " JF " + format(file[position + 1]) + " " + format(file[position + 2]))
                return disassemble(file, position + 3, data)
            case 9: // add a b c - assign a to b + c
                data.push(position + " ADD " + format(file[position + 1]) + " " + format(file[position + 2]) + " " + format(file[position + 3]))
                return disassemble(file, position + 4, data)
            case 10: // mult a b c - assign a to b * c
                data.push(position + " MULT " + format(file[position + 1]) + " " + format(file[position + 2]) + " " + format(file[position + 3]))
                return disassemble(file, position + 4, data)
            case 11: // mod a b c - assign a to b % c
                data.push(position + " MOD " + format(file[position + 1]) + " " + format(file[position + 2]) + " " + format(file[position + 3]))
                return disassemble(file, position + 4, data)
            case 12: // and a b c - set a to b & c
                data.push(position + " AND " + format(file[position + 1]) + " " + format(file[position + 2]) + " " + format(file[position + 3]))
                return disassemble(file, position + 4, data)
            case 13: // or a b c - set a to b | c
                data.push(position + " OR " + format(file[position + 1]) + " " + format(file[position + 2]) + " " + format(file[position + 3]))
                return disassemble(file, position + 4, data)
            case 14: // not a b - set reg a to ~b
                data.push(position + " NOT " + format(file[position + 1]) + " " + format(file[position + 2]))
                return disassemble(file, position + 3, data)
            case 15: // rmem a b - set reg a to mem b
                data.push(position + " RMEM " + format(file[position + 1]) + " " + format(file[position + 2]))
                return disassemble(file, position + 3, data)
            case 16: // wmem a b - set mem a to b
                data.push(position + " WMEM " + format(file[position + 1]) + " " + format(file[position + 2]))
                return disassemble(file, position + 3, data)
            case 17: // call a - write next position to stack and jmp a
                data.push(position + " CALL " + format(file[position + 2]))
                return disassemble(file, position + 2, data)
            case 18: // ret - return to address at top of stack
                data.push(position + " RET")//
                return disassemble(file, position + 1, data)
            case 19: // out a - write the char a to the screen
                data.push(position + " OUT " + formatChar(file[position + 1]).replace(/\n/, '\\n'))
                return disassemble(file, position + 2, data)
            case 20: // in a - read a line and repeatedly store in reg a
                data.push(position + " IN " + format(file[position + 1]))
                return disassemble(file, position + 2, data)
            case 21: // noop
                data.push(position + " NOOP")
                return disassemble(file, position + 1, data)
            default:
                return disassemble(file, position + 1, data)
        }
}

require('fs').writeFileSync("disassembled.txt", disassemble(file).join("\n"))