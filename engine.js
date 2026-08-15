// initialize 2D canvas (c)
// initialize game state (s)
// initialize keys states (u,r,d,l for directions, allKeys for all the keyboard)
/** @type {CanvasRenderingContext2D} */
let ctx=a.getContext`2d`

let main = () => {
    try {
        if (!self.production) {
            testMath()
        }
        prepareAssets()
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
            return
        }
        let changedScreen = currentScreen != previousScreen
        previousScreen = currentScreen

        initCanvasMatrix()

        // TODO currentScreen frame function array? Or object?
        // currentScreen = { 1() {...}, 123() {...} }
        switch (currentScreen) {
          case SCREEN_DEFAULT: {
            onFrameDemo(changedScreen)
            break
          }
          case SCREEN_TESTING: {
            onFrameTesting(changedScreen)
            break
          }
          default: {
            assertFail("unknown screen " + currentScreen)
            break
          }
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
let TAU = Math.PI * 2
let FOV = 0.5
let canvasSize = [0, 0]
let viewportFocusSize = [0, 0]
let canvasSmallSideLength = 0
let canvasLargeSideLength = 0
let FONT_HEIGHT = 32
let FONT_WIDTH = 20
let ERROR_LINE_LENGTH = 60
// where was the last click
let mouseClick = [0, 0]

// The game is a big state machine
let SCREEN_DEFAULT = 1
let SCREEN_TESTING = 123

// VARIABLES

let START = (Date.now() - 1000) / 1000.0 // avoid negative nums: start at 10 seconds
let TIME = (Date.now() - START) / 1000.0
let ERROR
let updateTime = () => TIME = (Date.now() - START) / 1000.0
let currentScreen = +('' + location).match(/screen=(\d+)/)?.[1] || SCREEN_DEFAULT
let previousScreen // used to check if changed

let recalculateViewport = () => {
    canvasSize = [a.width = innerWidth, a.height = innerHeight];
    canvasSmallSideLength = Math.min(...canvasSize)
    canvasLargeSideLength = Math.max(...canvasSize)
    viewportFocusSize = [canvasSmallSideLength, canvasSmallSideLength]
    ERROR_LINE_LENGTH = Math.floor(canvasSize[0] / FONT_WIDTH)
}

let initCanvasMatrix = () => {
    // landscape
    if (canvasSize[1] > canvasSize[0]) ctx.translate(0, (canvasLargeSideLength - canvasSmallSideLength) / 2)
    // portrait
    else ctx.translate((canvasLargeSideLength - canvasSmallSideLength) / 2, 0)
    ctx.scale(canvasSmallSideLength, canvasSmallSideLength)
}
let errorFont = 'italic 32px \'Comic Mono\', monospace'
let onError = (_, __, ___, ____, e) => {
    if (!self.production) debugger
    fatalError(e)
    console.error(e)
}
let fatalError = (err) => {
    ERROR = err // stop further frames
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
let cameraTransform = tformIdentity()
let cameraTransformInv = tformIdentity()
let setCameraPosition = (v) => {
    cameraTransform[0] = vec(v)
    cameraTransformInv[0] = vecMulNum(v, -1)
}
let setCameraRotation = (rotationX, rotationY) => {
    num(rotationY), num(rotationX)

    // positionSetter is a callback because movement may depend on rotation
    cameraTransform[1] = cameraTransformInv[1] = matIdentity()

    cameraTransform[1] = matTransformMat(cameraTransform[1], matRotateY(onFrameTestingCameraRotation))
    cameraTransform[1] = matTransformMat(cameraTransform[1], matRotateX(onFrameTestingCameraRotationX))

    cameraTransformInv[1] = matTransformMat(cameraTransformInv[1], matRotateX(-onFrameTestingCameraRotationX))
    cameraTransformInv[1] = matTransformMat(cameraTransformInv[1], matRotateY(-onFrameTestingCameraRotation))
}
let cameraProject2d = (v) => {
    v = cameraProject(v)
    return [v[0], v[1]]
}
let cameraProject = (a) => {
    // var transformed = vecAddVec(transformed, cameraTransformInv[0])
    // var transformed = matTransformVec(cameraTransformInv[1], transformed)
    return tformProjectVec(cameraTransformInv, vec(a), FOV)
}
let cameraDistance = (v) => tformProjectZVec(cameraTransformInv, v)
let cameraProjectAsset2d = (assetT, pointV) => {
    return tformProjectAssetVec(tform(cameraTransformInv), tform(assetT), vec(pointV), FOV)
}
let globalEval = self.eval

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
    16: 'D', // Shift: DOWN
    81: 'C', // q: turn counter-clockwise
    69: 'c', // e: turn clockwise
}
let controls = {
  u: 0,
  d: 0,
  l: 0,
  r: 0,
  U: 0,
  D: 0,
  c: 0,
  C: 0,
}

let startLoopAndEvents = () => {
    onkeydown = onkeyup = e => {
      if (keyCodesToControls[e.which]) {
        controls[keyCodesToControls[e.which]] = +!!e.type[5]
        e.preventDefault()
      }
    }

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
