
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

let drawTransform = self.production
    ? () => {}
    : (t) => {
        let origin = cameraProject2d(t[0])

        let x1 = cameraProject2d(vecAddVec(t[0], t[1][x]))
        let y1 = cameraProject2d(vecAddVec(t[0], t[1][y]))
        let z1 = cameraProject2d(vecAddVec(t[0], t[1][z]))

        let originZ = cameraDistance(t[0])
        let xbehind = cameraDistance(vecAddVec(t[0], t[1][x])) > originZ
        let ybehind = cameraDistance(vecAddVec(t[0], t[1][y])) > originZ
        let zbehind = cameraDistance(vecAddVec(t[0], t[1][z])) > originZ

        // Axes are 3 lines from origin to 1-at-x, 1-at-y, 1-at-z
        ctx.strokeStyle = xbehind ? '#800' : '#F00'
        ctx.beginPath()
        ctx.moveTo(...origin)
        ctx.lineTo(...x1)
        if (!xbehind) ctx.arc(...x1, canvasPixelWidth * 2, 0, TAU)
        ctx.stroke()

        ctx.strokeStyle = ybehind ? '#080' : '#0F0'
        ctx.beginPath()
        ctx.moveTo(...origin)
        ctx.lineTo(...y1)
        if (!ybehind) ctx.arc(...y1, canvasPixelWidth * 2, 0, TAU)
        ctx.stroke()

        ctx.strokeStyle = zbehind ? '#008' : '#00F'
        ctx.beginPath()
        ctx.moveTo(...origin)
        ctx.lineTo(...z1)
        if (!zbehind) ctx.arc(...z1, canvasPixelWidth * 2, 0, TAU)
        ctx.stroke()

    }

let drawDebugCube = self.production
    ? () => {}
    : (t) => {
        // Draw a debug cube, too
        ctx.strokeStyle = 'red'
        ctx.stroke(assetSquare([
            vecAddVec(t[0], t[1][x]),
            matTransformMat(matRotateY(TAU * .25), matMulNum(t[1], 2)),
        ]))
        ctx.strokeStyle = 'green'
        ctx.stroke(assetSquare([
            vecAddVec(t[0], t[1][y]),
            matTransformMat(matRotateX(TAU * .25), matMulNum(t[1], 2)),
        ]))
        ctx.strokeStyle = 'blue'
        ctx.stroke(assetSquare([
            vecAddVec(t[0], t[1][z]),
            matMulNum(t[1], 2),
        ]))
    }
