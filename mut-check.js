
let mutationCheckInit = () => {
    if (self.production) return
    if (nativeGlobals) return

    nativeGlobals = { ...self }
}
let nativeGlobals
let handledKeys = {}
let mutationCheck = () => {
    if (self.production) return

    return // TODO

    for (const nativeKey of Object.keys(nativeGlobals)) {
        if (handledKeys[nativeKey]) continue

        if (nativeGlobals[nativeKey] != self[nativeKey]) {
            throw new Error('Property ' + nativeKey + ' has changed:\n  ' + str(nativeGlobals[nativeKey]) + ' != ' + str(self[nativeKey]))
        }
    }

    for (const newKey of Object.keys(self)) {
        if (newKey in handledKeys) continue
        if (newKey in nativeGlobals) continue // already checked above

        if (nativeGlobals[newKey] != self[newKey]) {
            throw new Error('Property ' + newKey + ' has changed:\n  ' + str(nativeGlobals[newKey]) + ' != ' + str(self[newKey]))
        }
    }
}
