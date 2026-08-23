let orZero = n => n?1:0
let vecAxis = (neg, pos, v) =>
    vecAddVec(
        vecMulNum(v, orZero(neg)),
        vecMulNum(vecNegative(v), orZero(pos))
    )

let onFrameDemo = isFirstFrame => {
    if (isFirstFrame) {
        setCameraPosition([0, 2, 10])
    }
    var demoRotation = numSinCos(TIME) * 0.2
    var demoRotationX = numSinCos(TIME * 0.5) * 0.1
    setCameraRotation(demoRotationX, demoRotation)

    let cameraMovement = vec([
        orZero(controls.l) * -1 + orZero(controls.r),
        orZero(controls.D) * -1 + orZero(controls.U),
        orZero(controls.u) * -1 + orZero(controls.d),
    ])
    cameraMovement = vecMulNum(cameraMovement, 0.2)
    setCameraPosition(vecAddVec(cameraTransform[0], cameraMovement))

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

    // Render a cloud
    if (assetCull(tformIdentity())) ctx.stroke(assetCloud(tformIdentity()))
}

let onFrameTestingCameraRotation = 0
let onFrameTestingCameraRotationX = 0
let onFrameTesting = isFirstFrame => {
    if (isFirstFrame) {
        setCameraPosition([4, 4, 13])
        onFrameTestingCameraRotation = -0.05 * TAU
        onFrameTestingCameraRotationX = 0.05 * TAU
    }
    onFrameTestingCameraRotation += (
        orZero(controls.C) * -1 + orZero(controls.c)
    ) * 0.01
    onFrameTestingCameraRotationX += (
        orZero(controls.D) * -1 + orZero(controls.U)
    ) * 0.01

    setCameraRotation(onFrameTestingCameraRotationX, onFrameTestingCameraRotation)

    let cameraMovement = vec([
        orZero(controls.l) * -1 + orZero(controls.r),
        0, // orZero(controls.D) * -1 + orZero(controls.U),
        orZero(controls.u) * -1 + orZero(controls.d),
    ])
    cameraMovement = matTransformVec(cameraTransform[1], cameraMovement)
    cameraMovement = vecMulNum(cameraMovement, 0.2)
    setCameraPosition(vecAddVec(cameraTransform[0], cameraMovement))

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

    let cubeParent = matRotateY(numSinCos(TIME))
    cubeParent = [vecZero(), matMulNum(cubeParent, 1.2 + 0.5 * Math.cos(TIME * 2.2))]

    // Render a bunch of clouds
    rngSeed = 123
    let rngScaled = () => num((rng() - 0.5) * 2 * 2)
    for (let i = 0; i < 100; i++) {
        var pos = [rng(), rng(), rng()]
        if (cameraDistance(pos) > 0.5) ctx.stroke(assetCloud(tformTranslateByLocalVec(cubeParent, pos)))
    }

    let parentTform = transform => tformTransformTform(cubeParent, transform)

    if (cameraDistance(vecZero()) > 5) {
        // Render a cube around the clouds
        ctx.stroke(assetSquare(parentTform([
            [0, 0, -7/2],
            [
                [7, 0, 0],
                [0, 7, 0],
                [0, 0, 7],
            ]
        ])))
        ctx.stroke(assetSquare(parentTform([
            [0, 0, 7/2],
            [
                [7, 0, 0],
                [0, 7, 0],
                [0, 0, 7],
            ]
        ])))
        ctx.stroke(assetSquare(parentTform([
            [7/2, 0, 0],
            [
                [0, 0, 7],
                [0, 7, 0],
                [7, 0, 0],
            ]
        ])))
        ctx.stroke(assetSquare(parentTform([
            [-7/2, 0, 0],
            [
                [0, 0, 7],
                [0, 7, 0],
                [7, 0, 0],
            ]
        ])))
    }
}

let menuMainMenu
let initMainMenu = () => {
    markMut('menuMainMenu')
    return menuMainMenu = createMenu([
        ['new game', () => (
            savedGame = 0,
            currentScreen = SCREEN_SPACE_GAME
        )],
        savedGame && ['continue', () => (
            currentScreen = SCREEN_SPACE_GAME
        )],
        ['free flight', () => (
            currentScreen = SCREEN_FREE_FLIGHT
        )]
    ])
}
let onFrameMainMenu = (isFirstFrame) => {
    if (isFirstFrame) {
        initMainMenu()
        resetCameraTransform()
    }

    setCameraRotation2(matTransformMat(matRotateZ(0.001), matRotateY(0.0001)))

    updateRenderStars()

    frameLog2('SPACE GAME 5', 1.2)
    frameLog2('REVENGE OF UNICORN', 1.2)

    menuMainMenu()

    return frameLog2('press space to go to space', 0.5)
}

let deadUntil
let deadReason
let onFrameDeath = (isFirstFrame) => {
    if (isFirstFrame) {
        markMut('deadUntil')
        deadUntil = TIME + 4
    }

    clearScreen('#e33')

    frameLog('DEAD', deadReason)

    if (deadUntil < TIME) { currentScreen = SCREEN_MAIN_MENU }
}
let die = reason => {
    markMut('deadReason')
    deadReason = reason
    currentScreen = SCREEN_DEAD
}

// For sorted rendering!
let deferLayerHud = []
let deferLayer3D = []
let allLayers = [deferLayerHud, deferLayer3D]
let deferRenderCommand = (layer, transform, cb, tmpDist) => (
    assert(() => layer === deferLayerHud || layer === deferLayer3D),
    tmpDist = cameraDistance(transform[0]),
    tmpDist > 1
        && layer.push([tmpDist, transform, cb])
)
let undeferRenderCommands = () =>
    allLayers.map(layer => {
        // distance sort
        layer.sort((a, b) => b[0] - a[0])

        layer.map(a => a[2](a[0]))

        layer.length = 0 // clear commands
    })

// Some of these are initialized in story.js :D
let spaceGameInertia
let spaceGameRotationInertia
let spaceGamePlanets
let onFrameSpaceGame = storyMode => isFirstFrame => {
    if (isFirstFrame) {
        markMut('spaceGamePlanets')
        markMut('planetSun')
        markMut('planetFishy')
        spaceGamePlanets = initPlanets()

        markMut('spaceGameInertia')
        spaceGameInertia = vecZero()
        markMut('spaceGameRotationInertia')
        spaceGameRotationInertia = matIdentity()

        updateLandedOnPlanet(isFirstFrame)
        // Initialize things (first frame, after all)
        if (storyMode) {
            updateRenderUnicorns(isFirstFrame)
            advanceStory(isFirstFrame)
        } else {
            setCameraPosition([3000, -1000, 0])
            setCameraRotation(-0.2, -TAU/4)
        }
        undeferRenderCommands()
        return
    }

    // Blip states (early return if one of these is truthy)
    if (
        storyMode && advanceStory(isFirstFrame)
        || updateLandedOnPlanet(isFirstFrame)
    ) {
        return
    }

    ctx.lineWidth = 0.005
    ctx.globalAlpha = 0.5
    ctx.strokeStyle = 'red'

    spaceGameInertia = updateSpaceInertia(spaceGameInertia)
    updateControls()
    updateRenderStars()
    updateRenderPlanets()
    storyMode && updateRenderUnicorns()

    undeferRenderCommands()

    updateRenderLanding()
}

let starDistance = 100_000
let range = n => (
    assert(() => n >= 0),
    n-- ? [...range(n), n] : []
)
let spaceGameStars = Array.from({ length: 1000 }, (_, i) => {
    rngSeed = i + 2 * 33

    return [rng(), rng() ** 2, vecMulNum(vecNormalize([rng(), rng(), rng()]), starDistance)]
})

let updateRenderStars = () => (
    spaceGameStars.map(([ speed, phase , vec ]) => (
        ctx.fillStyle = '#ccc',
        ctx.globalAlpha = 0.3 * (numSinCos(TIME * speed + phase) + 1.0),
        vec = cameraProject2d(vec),
        ctx.fillRect(
            vec[x] - canvasPixelWidth * 2, vec[y],
            canvasPixelWidth * 5, canvasPixelWidth * 2
        ),
        ctx.fillRect(
            vec[x], vec[y] - canvasPixelWidth * 2,
            canvasPixelWidth * 2, canvasPixelWidth * 5
        )
    )),
    ctx.globalAlpha = 1.0
)

let planetTransform = 0
let planetColor = 1
let planetName = 2
let planetSun
let planetFishy
let getPlanetSize = planet => vecLength(planet[planetTransform][1][x])
let initPlanets = () => [
    planetSun = [
        tform([
            [1, 1, 1],
            matScaled(450)
        ]),
        '#ff8c00',
        'sun',
    ],
    [
        tform([
            [ -1560, -27, 2520 ],
            matScaled(144),
        ]),
        "#fff59d",
        "zero"
    ],
    [
        tform([
            [ -3470, -376, -850 ],
            matScaled(93),
        ]),
        "#eac1e4",
        "one"
    ],
    [
        tform([
            [ 4190, -100, 2450 ],
            matScaled(15),
        ]),
        "#daffe5",
        "gooner"
    ],
    [
        tform([
            [ 2890, 295, 2440 ],
            matScaled(84),
        ]),
        "#ffb99a",
        "six"
    ],
    [
        tform([
            [ 3060, 257, 4360 ],
            matScaled(45),
        ]),
        "#91eaff",
        "seven"
    ],
    [
        tform([
            [ -4480, 254, -1620 ],
            matScaled(16),
        ]),
        "#89ff84",
        "goonest"
    ],
    [
        tform([
            [ -4350, -215, -1130 ],
            matScaled(14),
        ]),
        "#9fff86",
        "yes"
    ],
    [
        tform([
            [ -1540, -444, 1730 ],
            matScaled(81),
        ]),
        '#ffff93',
        "no"
    ],
    planetFishy = [
        tform([
            [ 4430, 443, -4920 ],
            matScaled(99),
        ]),
        "#443",
        "fishy"
    ],
].map(planet => (
    (planet[planetTransform][0] = vecMulNum(planet[planetTransform][0], 0.4)),
    planet
))

let getPlanetName = p => p == planetSun ? 'The sun' :  'Planet ' + p[planetName]

let updateRenderPlanets = () => spaceGamePlanets
    .map((planet) =>
        deferRenderCommand(deferLayer3D, planet[planetTransform], (distance) => {
            let planetScreenRadius = cameraProjectRadiusAtDistance(distance, getPlanetSize(planet))

            if (distance < 3000) {
                ctx.fillStyle = '#fff'
                ctx.font = screenFont(1)
                ctx.fillText(' ' + getPlanetName(planet), ...cameraProject2d(planet[planetTransform][0]).map((coord, i) => coord + (i ? screenFontHeight/2 : planetScreenRadius)))
            }

            ctx.fillStyle = planet[planetColor]
            ctx.beginPath()
            ctx.arc(
                ...cameraProject2d(planet[planetTransform][0]),
                planetScreenRadius,
                0,
                TAU
            )
            ctx.fill()
        })
    )


let updateSpaceInertia = inertia => inertia /* spaceGamePlanets.reduce((inertia, [planetTform, _planetColor, planetName]) => {
    // Let's gravitate towards the sun & planets?
    let planetPosition = vec(planetTform[0])
    let planetDistance = vecDistance(cameraTransform[0], planetPosition)
    let planetSize = vecLength(planetTform[1][x])

    // Gravity scale: 1000
    planetDistance = planetDistance / 3000

    if (planetDistance < 1) {
        let planetMass = (planetSize / 1000000)
        var intensity = Math.sqrt((1 - planetDistance)) * planetMass
        var vecToward = vecNormalize(vecSubVec(planetPosition, cameraTransform[0]))
        var gravityToward = vecMulNum(vecToward, intensity)
        //if (planetName == 'fishy') {
            //return vecAddVec(inertia, gravityToward)
        //}
        return inertia
    }
    return inertia
}, inertia) */

let updateControls = () => {
    assert(() => matIsOrthonormalized(cameraTransformInv[1]))
    assert(() => matIsOrthonormalized(cameraTransform[1]))

    let pitch = orZero(controls.p) * -1 + orZero(controls.P)
    let matPitch = matFromAxisAngle(cameraTransformInv[1][x], pitch * 0.0001)

    let yaw = orZero(controls.c) * -1 + orZero(controls.C)
    let matYaw = matFromAxisAngle(cameraTransformInv[1][y], yaw * 0.0001)

    let roll = orZero(controls.S) * -1 + orZero(controls.s)
    let matRoll = matFromAxisAngle(cameraTransformInv[1][z], roll * 0.0001)

    spaceGameRotationInertia = [
        spaceGameRotationInertia,
        matPitch,
        matYaw,
        matRoll,
    ].reduce(matTransformMat)

    if (Math.abs(pitch) + Math.abs(yaw) + Math.abs(roll) < 0.01) {
        // In space, there's no air resistance. But this is a game and it gets disorienting
        spaceGameRotationInertia = matLerp(spaceGameRotationInertia, matIdentity(), 0.002)
    }

    if (controls.B) {
        spaceGameRotationInertia = matLerp(spaceGameRotationInertia, matIdentity(), 0.1)
        if (cheatsOn) {
            spaceGameInertia = vecZero()
        }
    }
    spaceGameRotationInertia = matOrthonormalize(spaceGameRotationInertia)
    setCameraRotation2(spaceGameRotationInertia)

    let moveForward = vecNegative(cameraTransformInv[1][z])
    let moveUp = cameraTransformInv[1][y]
    let moveLeft = cameraTransformInv[1][x]

    let propulsion = [
        vecAxis(controls.u, controls.d, moveForward),
        vecAxis(controls.r, controls.l, moveLeft),
        vecAxis(controls.D, controls.U, moveUp),
    ].reduce(vecAddVec)

    propulsion = vecMulNum(propulsion, 0.001)

    spaceGameInertia = vecAddVec(spaceGameInertia, propulsion)
    setCameraPosition(vecAddVec(cameraTransform[0], spaceGameInertia))
}

let unicornPos
let updateRenderUnicorns = (isFirstFrame) => {
    if (isFirstFrame) {
        markMut('unicornPos')
        unicornPos = [0.1,0.1,-1000.1]
    }

    // TODO following the player

    let unicornTransform = [unicornPos, (matScaled(500))]
    let myForward = vec(vecNormalize(cameraTransformInv[1][z]))
    let towardUnicornForward = vecNormalize(vec(vecSubVec(cameraTransform[0], unicornTransform[0])))
    let unicornDotSelf = vecDotVec(myForward, towardUnicornForward)

    // TODO do this dot-strategy elsewhere too?
    if (unicornDotSelf < 0.1) return

    return deferRenderCommand(deferLayer3D, unicornTransform, () => {
        ctx.fillStyle = '#f06'
        ctx.fill(assetUnicornBody(unicornTransform))
        ctx.fillStyle = '#f0a'
        ctx.fill(assetUnicornHead(unicornTransform))
        ctx.fillStyle = '#fff'
        ctx.fill(assetUnicornHorn(unicornTransform))
        ctx.fillStyle = '#ff0'
        return ctx.fill(assetUnicornEyesMouth(unicornTransform))
    })
}

let landedOnPlanet
let landedMenu
let updateLandedOnPlanet = (isFirstFrame) => {
    if (isFirstFrame) {
        markMut('fuel')
        markMut('landedMenu')
        markMut('landedOnPlanet')
        fuel = 1

        landedMenu = createMenu([
            ['offblast now', offblast],
        ])
        return landedOnPlanet = 0
    } else if (!landedOnPlanet) {
        return 0
    } else {
        frameLog('FUEL SUC', landedOnPlanet[planetName])
        frameLog('FUEL LVL', (fuel = numClamp(fuel + 0.0005, 0, 1)))
        if (fuel > 0.2) landedMenu()
        return 1
    }
}

let offblastSpeed = 0.003
let offblast = () => {
    let planetCenter = landedOnPlanet[planetTransform][0]
    let playerPosition = cameraTransform[0]
    let awayFromPlanet = vecSubVec(playerPosition, planetCenter)
    spaceGameInertia = vecMulNum(awayFromPlanet, offblastSpeed)

    // Fuck off

    landedOnPlanet = 0
}

let speedTooFastToLand = 30
let updateRenderLanding = () => {
    let speed = vecLength(spaceGameInertia) * FRAME_INTERVAL_MS_INV
    let [closestPlanet, closestPlanetDistance] = spaceGamePlanets.map(a => [a, vecDistance(a[planetTransform][0], cameraTransform[0]) - getPlanetSize(a)]).toSorted((a, b) => (
        a[1] - b[1]
    ))[0]
    let message
    let towardsPlanet = vecSubVec(closestPlanet[planetTransform][0], cameraTransform[0])
    let dotTowardsPlanet = vecLengthSq(spaceGameInertia) > 0.01
        ? vecDotVec(
            vecNormalize(spaceGameInertia),
            vecNormalize(towardsPlanet)
        )
        : -0.1

    if (dotTowardsPlanet < 0 || closestPlanetDistance > 1000) return

    frameLog('approaching', getPlanetName(closestPlanet))
    frameLog('speed', speed.toFixed(2) + 'km/s')

    if (closestPlanet == planetSun) {
        frameLog('autopilot', 'cannot land safely on the sun')
    } else if (speed > speedTooFastToLand) {
        frameLog('autopilot', 'too fast to land safely')
    }

    if (
        closestPlanetDistance < 0
        // Easy-land: if not too fast, land earlier
        || closestPlanetDistance < 150 && speed < speedTooFastToLand
    ) {
        // When going away from planet, do not land
        if (dotTowardsPlanet > 0) {
            if (speed > speedTooFastToLand || closestPlanet == planetSun) {
                die('crash landed on ' + getPlanetName(closestPlanet))
            }
            landedOnPlanet = closestPlanet
        }
    }
}
