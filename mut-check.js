
// Evil-ly retrieve all variables
// Somehow does not use eval
// But, reads source code!
let varDeclRegex = /(?:let|var)\s*(\w+)/g
let _allLetVariables = !self.production
    && (async () => {
        let scriptSources = await Promise.all(Array.from(document.getElementsByTagName('script'), async script => {
            if (!script.src) return ''
            let res = await fetch(script.src)
            return await res.text()
        }))
        let reduced = scriptSources.reduce((s1, s2) => s1 + s2)
        let variables = reduced.match(varDeclRegex).map(let_ => let_.replace(varDeclRegex, '$1')) // It's okay to have a few false positives AND false negatives.
        let variablesThatExist = variables.filter(let_ => {
            try {
                _variableReader(let_)()
                return true
            } catch {}
        })
        allLetVariables = variablesThatExist
    })()
let allLetVariables // defined asynchronously, above
let globalsAfterInit
let _variableReaders = {}

// let handledKeys
// let markMut

// After the first frame
let mutationCheckInit = () => {
    if (self.production) return
    if (!allLetVariables) return
    if (globalsAfterInit) return

    markMut('globalsAfterInit')
    markMut('_variableReaders')

    globalsAfterInit = Object.fromEntries(allLetVariables.map((let_) => {
        _variableReaders[let_] = _variableReader(let_)
        return [let_, mutationComparable(_variableReaders[let_]())]
    }))
}
let mutationComparable = self.production
    ? () => true
    : (a) => {
        if (typeof a === 'object' && a) return str(a)
        return a // everything else can be compared with ===
    }
let mutationCheck = () => {
    if (self.production) return
    if (!allLetVariables) return
    if (!globalsAfterInit) return

    for (const let_ of Object.keys(globalsAfterInit)) {
        if (let_ in handledKeys) continue

        const oldValue = globalsAfterInit[let_]
        const newValue = mutationComparable(_variableReaders[let_]())

        if (oldValue != newValue) {
            throw new Error('Property `' + let_ + '` has changed:\n  ' + oldValue + ' != ' + newValue)
        }
    }
}

let _variableReader =
    self.production
        ? () => {}
        : varname => globalThis.eval(`() => (${varname})`)

