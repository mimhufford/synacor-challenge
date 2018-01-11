let r0 = 0
let r1 = 0
let r7 = 1
const stack = []

function f() {
    if (r0 == 0) {
        r0 = r1 + 1
        return
    }
    
    if (r1 == 0) {
        r0 = r0 - 1
        r1 = r7
        f()
        return
    }
    
    stack.push(r0)
    r1 = r1 - 1
    f()
    
    r1 = r0
    r0 = stack.pop()
    r0 = r0 - 1
    f()    
}