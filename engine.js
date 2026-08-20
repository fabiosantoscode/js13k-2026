// initialize 2D canvas (c)
// initialize game state (s)
// initialize keys states (u,r,d,l for directions, allKeys for all the keyboard)
/** @type {CanvasRenderingContext2D} */
let ctx=a.getContext`2d`

let main = () => tryCatch(() => {
    if (!self.production) {
        testMath()
    }
    prepareAssets()
    startLoopAndEvents()
}, fatalError)

let isFirstFrameOfThisScreen // is this the first frame of the screen (IE is it != previousScreen)
let previousScreen // used to check if changed
let onFrame = tmp => tryCatch(() => {
    if (!self.production && ERROR) {
        return
    }

    isFirstFrameOfThisScreen = previousScreen != currentScreen
    previousScreen = currentScreen
    frameLogReset()
    recalculateViewport()
    TIME = getTime()
    perFrameValidation()
    initCanvasMatrix()
    clearScreen('#111')

    mutationCheckInit()

    tmp = ({
        [SCREEN_MAIN_MENU]:onFrameMainMenu,
        [SCREEN_SPACE_GAME]:onFrameSpaceGame,
        [SCREEN_DEAD]:onFrameDeath,
        [SCREEN_TESTING]:onFrameTesting,
    })[currentScreen]

    if (!self.production && !tmp) {
        assertFail('unknown screen ' + currentScreen)
    }

    tmp(isFirstFrameOfThisScreen)

    mutationCheck()
}, fatalError)
let tryCatch = (try_, catch_ = str /* str is an okay no-op */) => {
    try {
        return try_(try_)
    } catch (try_) {
        return catch_(try_)
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
let canvasPixelWidth = 0
let FONT_HEIGHT = 32
let FONT_WIDTH = 20
let ERROR_LINE_LENGTH = 60

// The game is a big state machine
let SCREEN_MAIN_MENU = 1
let SCREEN_SPACE_GAME = 2
let SCREEN_DEAD = 3
let SCREEN_TESTING = 123

// VARIABLES

let ERROR
let getTime = () => new Date * .001
let TIME = getTime()

// Put these together to benefit from zip
let locationHref = '' + location
let currentScreen = +(locationHref).match(/screen=(\d+)/)?.[1] || SCREEN_MAIN_MENU
let cheatsOn = /cheats=1/.test(locationHref)
let skipStory = /skipstory=1/.test(locationHref)
let skipToFishy = /skiptofishy=1/.test(locationHref)

let recalculateViewport = () => {
    canvasSize = [a.width = innerWidth, a.height = innerHeight];
    canvasSmallSideLength = Math.min(...canvasSize)
    canvasLargeSideLength = Math.max(...canvasSize)
    canvasPixelWidth = 1 / canvasSmallSideLength
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
let errorFont = '32px monospace'
let screenFont = size => (size * .05) + 'px monospace'
let screenFontHeight = 0.025
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
    err = (err + '\n' + err.stack).split(/\n/g)
    if (err[0]?.trim() === err[1]?.trim()) return err.slice(1)
    else return err
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

    cameraTransform[1] = matTransformMat(cameraTransform[1], matRotateY(-onFrameTestingCameraRotation))
    cameraTransform[1] = matTransformMat(cameraTransform[1], matRotateX(-onFrameTestingCameraRotationX))

    cameraTransformInv[1] = matTransformMat(cameraTransformInv[1], matRotateX(onFrameTestingCameraRotationX))
    return cameraTransformInv[1] = matTransformMat(cameraTransformInv[1], matRotateY(onFrameTestingCameraRotation))
}
let setCameraRotation2 = (rotation) => {
    mat(rotation)
    // positionSetter is a callback because movement may depend on rotation
    cameraTransform[1] = matTransformMat(cameraTransform[1], rotation)

    cameraTransformInv[1] = matTransformMat(cameraTransformInv[1], matInvert(rotation))
}
let cameraProject2d = v => {
    return tformProjectVec(cameraTransformInv, vec(v), FOV)
}
let cameraDistance = (v) => tformProjectZVec(cameraTransformInv, v)
let cameraProjectRadiusAtDistance = (distance, radius) => {
    return radius / (distance * FOV)
}
let globalEval = self.eval

let frameKeys
let frameLogY = 0
let frameLogReset = () => { frameKeys = {}; frameLogY = 0 }
let frameLog = (key, ...message) => {
    if (frameKeys[key]) return;

    frameKeys[key] = true

    frameLog2(key + ': ' + message.map(str).join(" "))
}
let frameLog2 = (message, size) => {
    frameLogY += 0.1
    drawText(message, .001, 0.101 + frameLogY, '#200', size)
    return drawText(message, 0, 0.1 + frameLogY, '#fff', size)
}
let drawText = (words, x, y, fillStyle='#fff', size = 1) => {
    ctx.fillStyle = fillStyle
    ctx.font = screenFont(size)
    return words.split('\n').map((word, i) => {
        ctx.fillText(word, x, y + (0.1 * i))
    })
}
// (initialize your global variables here)

// update u,l,d,r globals when an arrow key/wasd/zqsd is pressed or released
let keyCodesToControls = {
    // wasd keys
    65: 'l',
    87: 'u',
    83: 'd',
    68: 'r',
    // q,e: up/down
    81: 'U',
    69: 'D',
    // arrow keys
    38: 'P', // arrow up, pitch down
    40: 'p', // arrow down, pitch up
    37: 'C', // arrow left turn counter-clockwise
    39: 'c', // arrow right turn clockwise
    // roll (Screw): Z and C
    90: 's',
    67: 'S',
    // B stands for "bress the button in the UI"
    13: 'B',
    32: 'B',
    // UNUSED?
    32: 'B', // space: brake
    16: 'b', // shift: release "babeety"
}
let controls = {}

let FRAME_INTERVAL = 16
let FRAME_INTERVAL_MS_INV = 63 // 62.5 actually

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
    setInterval(onFrame, FRAME_INTERVAL)

    if (!self.production) {
        onerror = onError
    }
}

let perFrameValidation = () => {
    assert(() => x === 0)
    assert(() => y === 1)
    assert(() => z === 2)
}

let clearScreen = (color = '#f00') => {
    ctx.fillStyle = color
    return ctx.fillRect(-10, -10, 20, 20) // returns undefined
}

// GUI utility. Scopes a menu index variable, from which the user can choose
let menuIndexChange
let createMenu = (options, i = 0) => {
    options = options.filter(o => !!o)
    menuIndexChange = TIME
    return () => {
        if (controls.u || controls.P) {
            controls.u = controls.P = 0
            i--
            menuIndexChange = TIME
        }
        if (controls.d || controls.p) {
            controls.d = controls.p = 0
            i++
            menuIndexChange = TIME
        }
        i += options.length
        i %= options.length
        return options.map(([optWords, optCb], optI) => {
            if (optI - i) {
                ctx.globalAlpha = 1
                return frameLog2('  ' + optWords, 1)
            } else {
                if (controls.B) {
                    return optCb()
                }
                ctx.globalAlpha = 1.2 + Math.sin((TIME - menuIndexChange) * 20)
                return frameLog2('> ' + optWords, 1)
            }
        }), ctx.globalAlpha = 1
    }
}

self.main = main
