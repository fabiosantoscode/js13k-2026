let readControlAxis = (neg, pos, v) => {
    return vecAddVec(
        vecMulNum(v, readControl(neg)),
        vecMulNum(vecNegative(v), readControl(pos))
    )
}

let onFrameDemo = isFirstFrame => {
    if (isFirstFrame) {
        setCameraPosition([0, 2, 10])
    }
    var demoRotation = numSinCos(TIME) * 0.2
    var demoRotationX = numSinCos(TIME * 0.5) * 0.1
    setCameraRotation(demoRotationX, demoRotation)

    let cameraMovement = vec([
        readControl('l') * -1 + readControl('r'),
        readControl('D') * -1 + readControl('U'),
        readControl('u') * -1 + readControl('d'),
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
        setCameraPosition([5, 5, 10])
        onFrameTestingCameraRotation = -0.07 * TAU
        onFrameTestingCameraRotationX = 0.05 * TAU
    }
    onFrameTestingCameraRotation += (
        readControl('C') * -1 + readControl('c')
    ) * 0.01
    onFrameTestingCameraRotationX += (
        readControl('D') * -1 + readControl('U')
    ) * 0.01

    setCameraRotation(onFrameTestingCameraRotationX, onFrameTestingCameraRotation)

    let cameraMovement = vec([
        readControl('l') * -1 + readControl('r'),
        0, // readControl('D') * -1 + readControl('U'),
        readControl('u') * -1 + readControl('d'),
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
    cubeParent = matTransformMat(matRotateZ(0.3), cubeParent)
    cubeParent = matTransformMat(matRotateX(0.3), cubeParent)
    cubeParent = [vec([1,1,1]), matMulNum(cubeParent, 1.2 + 0.5 * Math.cos(TIME * 2.2))]

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
    menuMainMenu = createMenu([
        ['play', () => (currentScreen = SCREEN_SPACE_GAME)],
        ['free flight', () => (currentScreen = SCREEN_FREE_FLIGHT)]
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

    frameLog2('press space to go to space', 0.5)
    frameLog2('use controller or keyboard WASD&Arrows', 0.5)
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
let onFrameEndgame = (isFirstFrame) => {
    // Let's reuse variable `deadUntil`
    if (isFirstFrame) {
        markMut('deadUntil')
        deadUntil = TIME + 20
    }

    clearScreen('#022')

    frameLog2('You go to the doctor. It turns out\nthe UNICORN was a manifestation of\nyour regret.\n\nYou feel very disappointed, though\nnot very surprised.\n\n~ THE END ~')

    if (deadUntil < TIME) { currentScreen = SCREEN_MAIN_MENU }
}
let die = reason => {
    markMut('deadReason')
    deadReason = reason
    currentScreen = SCREEN_DEAD
}


// Some of these are initialized in story.js :D
let spaceGameInertia
let spaceGameRotationInertia
let spaceGamePlanets
let spaceGamePlanetsInitialLength
let onFrameSpaceGame = storyMode => isFirstFrame => {
    if (isFirstFrame) {
        markMut('spaceGamePlanets')
        markMut('spaceGamePlanetsInitialLength')
        markMut('planetSun')
        markMut('planetFishy')
        spaceGamePlanets = initPlanets()
        spaceGamePlanetsInitialLength = spaceGamePlanets.length

        markMut('spaceGameInertia')
        spaceGameInertia = vecZero()
        markMut('spaceGameRotationInertia')
        spaceGameRotationInertia = matIdentity()

        updateLandedOnPlanet(storyMode, isFirstFrame)
        // Initialize things (first frame, after all)
        if (storyMode) {
            updateRenderUnicorn(isFirstFrame)
            advanceStory(isFirstFrame)
        } else {
            setCameraPosition([5000, -300, 0])
            setCameraRotation(-0.12, TAU * -.23)
            spaceGameInertia = [0.1, 0.1, -0.1]
        }
        return
    }

    if (storyMode && (advanceStory(isFirstFrame) || updateRenderUnicorn(isFirstFrame))) {
        return
    }

    // Blip states (early return if one of these is truthy)
    if (updateLandedOnPlanet(storyMode, isFirstFrame)) {
        return
    }

    ctx.lineWidth = 0.005
    ctx.globalAlpha = 0.5
    ctx.strokeStyle = 'red'

    spaceGameInertia = updateSpaceInertia(spaceGameInertia)
    updateControls()
    updateRenderStars()
    updateRenderPlanets()

    return updateRenderLanding()
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
            matScaled(700)
        ]),
        '#f62',
        'Sun',
    ],
    [
        tform([
            [ -4350, -215, -1130 ],
            matScaled(14),
        ]),
        "#9fff86",
        "Yes"
    ],
    [
        tform([
            [ -3470, -376, -850 ],
            matScaled(81),
        ]),
        '#c45',
        "No"
    ],
    [
        tform([
            [ -1700, 0, 2700 ],
            matScaled(500),
        ]),
        "#eac1e4",
        "One"
    ],
    [
        tform([
            [ 3060, 300, 4360 ],
            matScaled(300),
        ]),
        "#91eaff",
        "Seven"
    ],
    [
        tform([
            [ 2890, 290, 2440 ],
            matScaled(90),
        ]),
        "#ffb99a",
        "Six"
    ],
    [
        tform([
            [ -1560, -27, -2520 ],
            matScaled(144),
        ]),
        "#332266",
        "Zero"
    ],
    planetFishy = [
        tform([
            [ 3333, 443, -3333 ],
            matScaled(99),
        ]),
        "#443",
        "Fishy"
    ],
].filter(planet => !planetsConsumed.includes(planet[planetName]))
let planetsConsumed
let consumePlanet = (planet) => {
    planetsConsumed.push(planet[planetName])
    spaceGamePlanets = initPlanets()
}
let getConsumedPlanets = () => {
    return planetsConsumed.length
}

let getPlanetName = p => p == planetSun ? 'The sun' :  'Planet ' + p[planetName]

let updateRenderPlanets = () => spaceGamePlanets
    .map((planet) =>
        deferRenderCommand(planet[planetTransform], (distance) => {
            let planetScreenRadius = cameraProjectRadiusAtDistance(getPlanetSize(planet), distance)

            if (distance < 999999) {
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

            drawTransform(planet[planetTransform])
            drawDebugCube(planet[planetTransform])
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

    let pitch = readControl('p') * -1 + readControl('P')
    let matPitch = matFromAxisAngle(cameraTransformInv[1][x], pitch * 0.0001)

    let yaw = readControl('c') * -1 + readControl('C')
    let matYaw = matFromAxisAngle(cameraTransformInv[1][y], yaw * 0.0001)

    let roll = readControl('S') * -1 + readControl('s')
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

    if (readControl('B')) {
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
        readControlAxis('u', 'd', moveForward),
        readControlAxis('r', 'l', moveLeft),
        readControlAxis('D', 'U', moveUp),
    ].reduce(vecAddVec)

    propulsion = vecMulNum(vecNormalize(propulsion), 0.006)

    spaceGameInertia = vecLimitLength(
        vecAddVec(spaceGameInertia, propulsion),
        // speed limit
        5
    )
    setCameraPosition(vecAddVec(cameraTransform[0], spaceGameInertia))
}

let fuel
let landedOnPlanet
let landedMenu
let updateLandedOnPlanet = (storyMode, isFirstFrame) => {
    if (isFirstFrame) {
        markMut('fuel')
        markMut('landedMenu')
        markMut('landedOnPlanet')
        fuel = 1

        landedMenu = createMenu([
            ['offblast now', offblast(storyMode)],
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
let offblast = storyMode => () => {
    let planetCenter = landedOnPlanet[planetTransform][0]
    let playerPosition = cameraTransform[0]
    let awayFromPlanet = vecSubVec(playerPosition, planetCenter)
    if (storyMode) {
        // CONSUME THE PLANET OMG
        consumePlanet(landedOnPlanet)
        resetUnicornToPlanet(planetCenter)
    }
    spaceGameInertia = vecMulNum(vecNormalize(awayFromPlanet), offblastSpeed)

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
