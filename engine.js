// initialize 2D canvas (c)
// initialize game state (s)
// initialize keys states (u,r,d,l for directions, allKeys for all the keyboard)
/** @type {CanvasRenderingContext2D} */
let c=a.getContext`2d`
let allKeys=[]
let controls = { /* u, d, l, r, U, D */ }

let main = () => {
    try {
        if (!self.production) {
            testMath()
        }
        startLoopAndEvents()
    } catch (e) {
        fatalError(e)
    }
}

let onFrame = e => {
    try {
        frameLogReset()
        recalculateViewport()
        updateTime()
        perFrameValidation()

        if (!self.production && ERROR) {
            renderError()
            return
        }
        try {
            initCanvasMatrix()

            // TODO change screen here
            onFrameDemo()
        } catch (e) {
            ERROR = e
        }
    } catch (e) {
        fatalError(e)
    }
}

// CONSTANTS
// Vector keys
let x = 0
let y = 1
let z = 2
let w = 3

/** @type {CanvasRenderingContext2D} */
let ctx = c
let TAU = Math.PI
let FOV = 0.5
let canvasSize = [0, 0]
let viewportFocusSize = [0, 0]
let canvasSmallSideLength = 0
let canvasLargeSideLength = 0
let FONT_HEIGHT = 32
let FONT_WIDTH = 20
let ERROR
let ERROR_LINE_LENGTH = 60
let mouseClick = [0, 0]
let START = (Date.now() - 1000) / 1000.0 // avoid negative nums: start at 10 seconds
let TIME = (Date.now() - START) / 1000.0
let updateTime = () => TIME = (Date.now() - START) / 1000.0

let recalculateViewport = () => {
    canvasSize = [a.width = innerWidth, a.height = innerHeight];
    canvasSmallSideLength = Math.min(...canvasSize)
    canvasLargeSideLength = Math.max(...canvasSize)
    viewportFocusSize = [canvasSmallSideLength, canvasSmallSideLength]
    ERROR_LINE_LENGTH = Math.floor(canvasSize[0] / FONT_WIDTH)
}

let onFrameDemo = () => {
    let orZero = n => +n || 0
    let cameraMovement = vec([
        orZero(controls.l) * -1 + orZero(controls.r),
        orZero(controls.D) * -1 + orZero(controls.U),
        orZero(controls.u) * -1 + orZero(controls.d),
    ])
    cameraMovement = vecMulNum(cameraMovement, 0.2)

    cameraPosition = vecAddVec(cameraPosition, cameraMovement)

    let rectangle = [
        [-5, -5],
        [ 5, -5],
        [ 5,  5],
        [-5,  5],
        [-5, -5]
    ]
    // Render 10 progressively further squares
    for (let dist = 0; dist < 10; dist++) {

        ctx.lineWidth = 0.005
        ctx.globalAlpha = 0.5
        ctx.strokeStyle = 'red'

        // Avoid rendering behind us
        if (cameraDistance([0, 0, -dist * 10]) < 0.5) continue;

        ctx.moveTo(...cameraProject2d([...rectangle[0], -dist * 10]))
        for (let i = 1; i < rectangle.length; i++) {
            ctx.lineTo(...cameraProject2d([...rectangle[i], -dist * 10]))
        }
        ctx.stroke()
    }
}

let initCanvasMatrix = () => {
    // landscape
    if (canvasSize[1] > canvasSize[0]) ctx.translate(0, (canvasLargeSideLength - canvasSmallSideLength) / 2)
    // portrait
    else ctx.translate((canvasLargeSideLength - canvasSmallSideLength) / 2, 0)
    ctx.scale(canvasSmallSideLength, canvasSmallSideLength)
}
let errorFont = 'italic 32px \'Comic Mono\', monospace'
let renderError = () => {
    ctx.opacity = 0.5
    ctx.fillStyle = 'red'
    ctx.fillRect(0, 0, ...canvasSize)
    ctx.opacity = 1
    ctx.fillStyle = 'white'
    ctx.font = errorFont
    var lines = errorLines(ERROR)
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], FONT_HEIGHT, (i + 2) * FONT_HEIGHT)
    }
}
let onError = (_, __, ___, ____, e) => {
    if (!self.production) debugger
    ERROR = e
    console.error(e)
}
let fatalError = (err) => {
    if (!self.production) debugger
    console.error(err)
    var bod = document.body
    // `a` is the canvas
    bod.style = "background:red;color:white;white-space:preserve;font:" + errorFont;
    bod.innerText = errorLines(err).join('\n')
}
let errorLines = (err) => {
    var lines = (err.toString() + '\n' + err.stack)
        .split(/\n/g)
    if (lines[0]?.trim() === lines[1]?.trim()) lines.shift()
    lines = lines
        .flatMap(line => {
            var out = []
            while (line.length > ERROR_LINE_LENGTH) {
                out.push(line.slice(0, ERROR_LINE_LENGTH) + '\n')
                line = line.slice(ERROR_LINE_LENGTH)
            }
            if (line.length) out.push(line)
            return out
        })
    return lines
}
let cameraPosition = [0, 0, 0]
let cameraRotation = TAU * 0
let cameraProject2d = (v) => {
    let [x, y] = cameraProject(v)
    return [x, y]
}
let cameraProject = (a) => {
    if (a.length === 4) a.length = 3 // backwards compat TODO remove
    var transformed = vec(a)

    frameLog('cameraPosition', cameraPosition)

    frameLog('coord', transformed)

    var transformed = vecSubVec(transformed, cameraPosition)
    assertNotNaN(transformed)

    frameLog('coord' + "'", transformed)

    // TODO give control to user
    var demoRotation = Math.sin(TIME) * 0.2
    var demoRotationX = Math.sin(TIME * 0.5) * 0.1

    // project onscreen
    var transformed = matTransformVec(mat([
        [  1,   0,   0],
        [  0,  -1,   0],
        [  0,   0,  -1],
    ]), transformed)

    var transformed = matTransformVec(matRotateZX(demoRotation), transformed)
    frameLog('coordrot', ...transformed)
    var transformed = matTransformVec(matRotateYZ(demoRotation), transformed)
    frameLog('coordrot', ...transformed)

    // Perspective divide!
    transformed[x] /= transformed[z] * FOV
    transformed[y] /= transformed[z] * FOV

    frameLog('coord' + "''", transformed)

    // Center on the screen!
    transformed[x] += 0.5
    transformed[y] += 0.5

    return transformed
}
let cameraDistance = (v) => {
    return cameraProject(v)[z]
}

let frameKeys
let frameLogY = 0
let frameLogReset = self.production
    ? () => {}
    : () => { frameKeys = {}; frameLogY = 0 }
let frameLog = self.production
    ? () => {}
    : (key, ...message) => {
        if (frameKeys[key]) return; else frameKeys[key] = true

        ctx.font = '0.05px red sans-serif'
        ctx.fillText(key + ': ' + message.map(str).join(" "), 0, 0.1 + (frameLogY += 0.1))
    }

// (initialize your global variables here)

// update u,l,d,r globals when an arrow key/wasd/zqsd is pressed or released
// update allKeys[keyCode] if any other key is pressed/released
let keyCodesToControls = {
    65: 'l',
    87: 'u',
    83: 'd',
    68: 'r',
    37: 'l',
    38: 'u',
    40: 'd',
    39: 'r',
    32: 'U', // Space: UP
    17: 'D', // Shift: DOWN
}

let startLoopAndEvents = () => {
    onkeydown = onkeyup = e => ((allKeys[e.which] = controls[keyCodesToControls[e.which]] = +!!e.type[5]), e.preventDefault())

    // start game loop (60fps)
    // the canvas is cleared and adjusted to fullscreen at each frame
    // draw each screen in the switch's cases
    // in each screen, you can make key presses update the game state
    // ex: "press enter to open the menu" => `if(allKeys[13])s=1;`
    setInterval(onFrame, 16)

    // handle click/touch events
    // globals x and y contain the pointer's coordinates
    // in each screen, you can make a click update the game state
    // ex: "game over if we click on the bottom half of the screen" => `if(y>h/2)s=3;`
    onmousedown = e => ((mouseClick = [e.pageX, e.pageY]), e.preventDefault())

    if (!self.production) {
        onerror = onError
    }
}

let perFrameValidation = () => {
    assert(() => x === 0)
    assert(() => y === 1)
    assert(() => z === 2)
}

self.main = main