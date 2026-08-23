
// This is here because it needs to be defined early! See mut-check.js
let handledKeys = {}
let markMut = (k) => {
    if (self.production) return
    handledKeys[str(k)] = 1
}

// Putting assert before anything else. Terser inlines it better
let assert = self.production
    ? () => {}
    : (cond, message = 'assertion error') => {
        if (!cond()) {
            message = typeof message == 'function' ? message() : message
            assertFail(message + ' ' + cond)
        }
    }
