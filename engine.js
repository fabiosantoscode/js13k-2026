// initialize 2D canvas (c)
// initialize game state (s)
// initialize keys states (u,r,d,l for directions, allKeys for all the keyboard)
/** @type {CanvasRenderingContext2D} */
let ctx=a.getContext`2d`

let main = self.main = () => tryCatch(() => {
    if (!self.production) {
        testMath()
    }
    resetToGameStart()
    prepareAssets()
    startLoopAndEvents()
}, fatalError)

let isFirstFrameOfThisScreen // is this the first frame of the screen (IE is it != previousScreen)
let previousScreen // used to check if changed
let onFrame = tmp => tryCatch(() => {
    if (!self.production && ERROR) {
        return
    }

    markMut('cameraTransform'),
    markMut('cameraTransformInv'),
    markMut('currentScreen')
    markMut('previousScreen')
    markMut('isFirstFrameOfThisScreen')
    isFirstFrameOfThisScreen = previousScreen != currentScreen
    previousScreen = currentScreen
    frameLogReset()
    recalculateViewport()
    TIME = getTime()
    initCanvasMatrix()
    clearScreen('#111')
    updateControlsWithGamepad()

    // DEV: In the first frame, freeze all variables
    mutationCheckInit()

    tmp = ({
        [SCREEN_MAIN_MENU]: onFrameMainMenu,
        [SCREEN_SPACE_GAME]: onFrameSpaceGame(1),
        [SCREEN_FREE_FLIGHT]: onFrameSpaceGame(),
        [SCREEN_DEAD]: onFrameDeath,
        [SCREEN_ENDGAME]: onFrameEndgame,
        [SCREEN_TESTING]: onFrameTesting,
    })[currentScreen]

    if (!self.production && !tmp) {
        assertFail('unknown screen ' + currentScreen)
    }

    tmp(isFirstFrameOfThisScreen)

    undeferRenderCommands()

    mutationCheck()
}, fatalError)
let tryCatch = (try_, catch_ = str /* str is an okay no-op */) => {
    try {
        return try_(try_)
    } catch (try_) {
        catch_(try_)
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
let canvasPixelWidth
let FONT_HEIGHT = 32
let FONT_WIDTH = 20
let ERROR_LINE_LENGTH = 60

// The game is a big state machine
let SCREEN_MAIN_MENU = 1
let SCREEN_SPACE_GAME = 2
let SCREEN_DEAD = 3
let SCREEN_ENDGAME = 4
let SCREEN_FREE_FLIGHT = 11
let SCREEN_TESTING = 123

// VARIABLES

let ERROR
let getTime = () => (new Date - PAUSED_LOST_TIME) * .001
let PAUSED_LOST_TIME = 0 // keep track of amount of time paused
let PAUSE_TIME // keep track of amount of time paused
let TIME = getTime()

// Put these together to benefit from zip
let locationHref = '' + location
let currentScreen = +(locationHref).match(/screen=(\d+)/)?.[1] || SCREEN_MAIN_MENU
let currentStoryBeat = +(locationHref).match(/story=(\d+)/)?.[1] || 0
let cheatsOn = /cheats=1/.test(locationHref)
let skipStory = /skipstory=1/.test(locationHref)
let skipToFishy = /skiptofishy=1/.test(locationHref)
let skipToUnicorn = /skiptounicorn=1/.test(locationHref)

let recalculateViewport = () => {
    canvasSize = [a.width = innerWidth, a.height = innerHeight];
    canvasSmallSideLength = Math.min(...canvasSize)
    canvasLargeSideLength = Math.max(...canvasSize)
    canvasPixelWidth = 1 / canvasSmallSideLength
    viewportFocusSize = [canvasSmallSideLength, canvasSmallSideLength]
    ERROR_LINE_LENGTH = Math.floor(canvasSize[0] / FONT_WIDTH)

    markMut('canvasSize')
    markMut('canvasSmallSideLength')
    markMut('canvasLargeSideLength')
    markMut('canvasPixelWidth')
    markMut('viewportFocusSize')
    markMut('ERROR_LINE_LENGTH')
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
    fatalError(e)
    console.error(e)
}
let fatalError = (err) => {
    if (ERROR) return
    ERROR = err // stop further frames
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
    cameraTransform[1] = cameraTransformInv[1] = matIdentity()

    cameraTransform[1] = matTransformMat(cameraTransform[1], matRotateY(-rotationY))
    cameraTransform[1] = matTransformMat(cameraTransform[1], matRotateX(-rotationX))

    cameraTransformInv[1] = matTransformMat(cameraTransformInv[1], matRotateX(rotationX))
    return cameraTransformInv[1] = matTransformMat(cameraTransformInv[1], matRotateY(rotationY))
}
let setCameraRotation2 = (rotation) => {
    mat(rotation)

    assert(() => matIsOrthonormalized(rotation))

    cameraTransform[1] = matTransformMat(cameraTransform[1], rotation)

    cameraTransformInv[1] = matTransformMat(cameraTransformInv[1], matInvert(rotation))
}
let resetCameraTransform = () => (
    cameraTransform = tformIdentity(),
    cameraTransformInv = tformIdentity()
)
let cameraProject2d = v => {
    return tformProjectVec(cameraTransformInv, vec(v), FOV)
}
let cameraDistance = (v) => tformProjectZVec(cameraTransformInv, v)
let cameraProjectRadiusAtDistance = (distance, radius) => {
    return numRadiusAtDistance(distance, radius, FOV)
}
let globalEval = self.eval

let frameKeys
let currentTextY = 0
let frameLogReset = () => {
    markMut('frameKeys')
    markMut('currentTextY')
    frameKeys = {};
    currentTextY = 0;
}
let frameLog = (key, ...message) => {
    if (frameKeys[key]) return;

    frameKeys[key] = 1

    frameLog2(key + ': ' + message.map(str).join(" "))
}
let frameLog2 = (message, size) => deferDrawUICommand(() => {
    message = message.split('\n')
    _drawText(message, .101, 0.101 + currentTextY, '#200', size)
    _drawText(message, 0.1, 0.1 + currentTextY, '#fff', size)
    return (currentTextY += 0.1 * message.length)
})
let frameLogAdvanceXYWidthHeight = (widthMultiplier) => [0.1, (currentTextY += 0.1) - 0.1, 0.8 * widthMultiplier, 0.1]
let _drawText = (lines, x, y, fillStyle='#fff', size = 1) => {
    ctx.fillStyle = fillStyle
    ctx.font = screenFont(size)
    return lines.map((word, i) => {
        ctx.fillText(word, x, y + (0.1 * i))
    })
}

// For sorted rendering!
let deferLayerHud = []
let deferLayer3D = []
let deferRenderCommand = (transform, cb, tmpDist) => (
    assert(() => deferLayer3D === deferLayerHud || deferLayer3D === deferLayer3D),
    tmpDist = cameraDistance(transform[0]),
    tmpDist > 1
        && vecDotVec(
            vecNormalize(vecSubVec(transform[0], cameraTransform[0])),
            vecMulNum(cameraTransformInv[1][z], -1)
        ) > 0.2
        && deferLayer3D.push([tmpDist, transform, cb])
)
let deferDrawUICommand = cb => deferLayerHud.push(cb)
let undeferRenderCommands = () => {
    // distance sort
    deferLayer3D.sort((a, b) => b[0] - a[0])
    deferLayer3D.map(a => a[2](a[0]))
    deferLayerHud.map(cb => cb())
    deferLayer3D.length = deferLayerHud.length = 0
    markMut('deferLayer3D')
    markMut('deferLayerHud')
}

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
// https://w3c.github.io/gamepad/#remapping
let gamepadAxesToControls = [
    'r',
    'd',
    'c',
    'p',
]
let gamepadButtonsToControls = Object.assign([], {
    // Cross (bottom face button)
    0: 'B',
    // L1, R1
    4: 's',
    5: 'S',
    6: 'U',
    7: 'D',
    // D-pad
    12: 'u',
    13: 'd',
    14: 'l',
    15: 'r',
})
let updateControlsWithGamepad = () =>
    navigator.getGamepads?.().map(gamepad => {
        gamepadAxesToControls
            .map((axisControl, axisIdx) => (gamepadAxes[axisControl] = gamepad?.axes[axisIdx]))
        gamepadButtonsToControls
            .map((buttonControl, buttonIdx) => (gamepadButtons[buttonControl] = gamepad?.buttons[buttonIdx]?.value))
    })
let gamepadAxes = {}
let keyControls = {}
let gamepadButtons = {}
let readControl = key =>
    numSmallOrZero(gamepadAxes[key]) ||
    numSmallOrZero(gamepadButtons[key]) ||
    numSmallOrZero(keyControls[key])

let requestFullscreenForCanvas = (userEvent) =>
    // a is the canvas
    userEvent && !document.fullscreenElement && a.requestFullscreen?.()?.catch(() => {})

let FRAME_INTERVAL = 16
let FRAME_INTERVAL_MS_INV = 63 // 62.5 actually

let startLoopAndEvents = () => {
    onclick = requestFullscreenForCanvas
    onkeydown = onKeyDownKeyUp(1)
    onkeyup = onKeyDownKeyUp(0)
    onblur = stopLoop
    onfocus = runLoop

    markMut('loop')
    markMut('TIME')
    markMut('PAUSE_TIME')
    markMut('PAUSED_LOST_TIME')
    PAUSE_TIME = getTime() // a usable valid PAUSE_TIME for our runLoop
    runLoop()

    if (!self.production) {
        onerror = onError
    }
}

// This is a little state machine.
// There either is a loop (setInterval handle) or there isn't.
let loop
let runLoop = (maybeEvent) => {
    requestFullscreenForCanvas(maybeEvent)
    if (loop) return
    loop = setInterval(onFrame, FRAME_INTERVAL)
    PAUSED_LOST_TIME = getTime() - PAUSE_TIME
}
let stopLoop = () => {
    if (!loop) return
    loop = clearInterval(loop)
    PAUSE_TIME = getTime()
    clearScreen('#fff', 0.5)
    _drawText(['paused. click to continue'], 0, 0.5, '#fff', /* size */1.5)
}

let onKeyDownKeyUp = downOrUp01 => event => {
    if (keyCodesToControls[event.which]) {
        keyControls[keyCodesToControls[event.which]] = downOrUp01
        event.preventDefault()
    }
}

let clearScreen = (color = '#f00', alpha=1) => {
    ctx.globalAlpha = alpha
    ctx.fillStyle = color
    ctx.fillRect(-10, -10, 20, 20) // returns undefined
    ctx.globalAlpha = 1
}

// GUI utility. Scopes a menu index variable, from which the user can choose
let menuIndexChangeTime
let menuHasMovedNow
let menuHasMovedBefore
let createMenu = (options, i = 0) => {
    markMut('menuIndexChangeTime')
    markMut('menuHasMovedBefore')
    markMut('menuHasMovedNow')
    options = options.filter(o => !!o)
    menuIndexChangeTime = TIME
    return () => {
        menuHasMovedNow =
            readControlNegPos('u', 'd')
            + readControlNegPos('P', 'p')
        if (!menuHasMovedBefore && menuHasMovedNow) {
            i = ((menuHasMovedNow > 0 ? i + 1 : i - 1) + options.length) % options.length
            menuIndexChangeTime = TIME
        }
        menuHasMovedBefore = menuHasMovedNow
        return options.map(([optWords, optCb], optI) => {
            if (optI - i) {
                ctx.globalAlpha = 1
                return frameLog2('  ' + optWords, 1)
            } else {
                if (readControl('B')) {
                    return optCb()
                }
                ctx.globalAlpha = 1.2 + Math.sin((TIME - menuIndexChangeTime) * 20)
                return frameLog2('> ' + optWords, 1)
            }
        }), ctx.globalAlpha = 1
    }
}

