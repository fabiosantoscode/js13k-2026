let readControlAxis = (neg, pos, v) => {
    return vecMulNum(v, readControlNegPos(neg, pos))
}
let readControlNegPos = (neg, pos) => readControl(neg) * -1 + readControl(pos)

let onFrameDemo = isFirstFrame => {
    if (isFirstFrame) {
        setCameraPosition([0, 2, 10])
    }
    var demoRotation = numSinCos(TIME) * 0.2
    var demoRotationX = numSinCos(TIME * 0.5) * 0.1
    setCameraRotation(demoRotationX, demoRotation)

    let cameraMovement = vec([
        readControlNegPos('l', 'r'),
        readControlNegPos('D', 'U'),
        readControlNegPos('u', 'd'),
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
        readControlNegPos('C', 'c')
    ) * 0.01
    onFrameTestingCameraRotationX += (
        readControlNegPos('D', 'U')
    ) * 0.01

    setCameraRotation(onFrameTestingCameraRotationX, onFrameTestingCameraRotation)

    let cameraMovement = vec([
        readControlNegPos('l', 'r'),
        0, // readControlNegPos('D', 'U'),
        readControlNegPos('u', 'd'),
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
let spaceGamePlanets
let spaceGamePlanetsInitialLength
let onFrameSpaceGame = storyMode => isFirstFrame => {
    if (isFirstFrame) {
        sound_engine.play()
        sound_engine.volume = 0
        markMut('spaceGamePlanets')
        markMut('spaceGamePlanetsInitialLength')
        markMut('planetSun')
        markMut('planetFishy')
        spaceGamePlanets = initPlanets()
        spaceGamePlanetsInitialLength = spaceGamePlanets.length

        // Initialize things (first frame, after all)
        updateLandedOnPlanet(storyMode, isFirstFrame)
        updateControls(isFirstFrame)
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

    updateControls(isFirstFrame)
    updateRenderStars()
    updateRenderPlanets()

    updateRenderLanding()
    updateRenderConsumedPlanet()

    deferDrawUICommand(UI_LAYER_FRAME_LOG, () => {
        // TODO smaller in SVG subsystem?
        let top = 0.45
        let bottom = 0.55
        let middle = 0.5
        let left = 0.45
        let right = 0.55

        ctx.strokeStyle = 'rgba(255,255,255,0.5)'
        ctx.beginPath()
        ctx.moveTo(left, middle)
        ctx.lineTo(right, middle)
        ctx.moveTo(middle, top)
        ctx.lineTo(middle, bottom)
        ctx.stroke()
    })
}
let onFrameNotSpaceGame = () => {
    sound_engine.volume = numLerp(sound_engine.volume, 0, 0.1)
}

let starDistance = 100_000_000
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
            matScaled(400),
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
let planetExplosionRenderTime = 2
let planetsConsumed // initialized to [] in resetToGameStart
let planetExplosionTransform
let planetExplosionTimeout
let consumePlanet = (planet) => {
    planetsConsumed.push(planet[planetName])
    spaceGamePlanets = initPlanets()
    markMut('planetExplosionTransform')
    markMut('planetExplosionTimeout')
    planetExplosionTransform = [planet[planetTransform][0], matScaleNum(planet[planetTransform][1], 10)]
    planetExplosionTimeout = TIME + planetExplosionRenderTime
}
let updateRenderConsumedPlanet = (explosionTime) => {
    explosionTime = planetExplosionTimeout - TIME

    if (!(explosionTime > 0)) return 0 // accepts NaN

    deferRenderCommand(planetExplosionTransform, (_tmp) => {
        _tmp = Math.floor(explosionTime * 12) % 3
        ctx.fillStyle = ['#f33', '#f92', '#fe6'][_tmp]
        drawTransform(planetExplosionTransform)
        return ctx.fill(
            [
                assetExplosion,
                assetExplosion2,
                assetExplosion3
            ][_tmp]
                .flat(planetExplosionTransform)
        )
    })
}
let getConsumedPlanets = () => {
    return planetsConsumed.length
}

let getPlanetName = p => p == planetSun ? 'The sun' :  'Planet ' + p[planetName]

let updateRenderPlanets = () => spaceGamePlanets
    .map((planet) =>
        deferRenderCommand(planet[planetTransform], (distance) => {
            let planetScreenRadius = cameraProjectRadiusAtDistance(getPlanetSize(planet), distance)

            if (distance < 5000) {
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

/*
let getCumulativeGravity = () => spaceGamePlanets.reduce((accumulateInertia, [planetTform, _planetColor, planetName]) => {
    // Let's gravitate towards the sun & planets?
    let planetPosition = vec(planetTform[0])
    let planetDistance = vecDistance(cameraTransform[0], planetPosition)
    let planetSize = vecLength(planetTform[1][x])

    // Gravity scale: 1000
    planetDistance = planetDistance / (planetSize * 10)

    frameLog('planetDistance', planetDistance)

    if (planetDistance < 1) {
        let planetMass = 1
        var intensity = Math.sqrt((1 - planetDistance)) * planetMass
        frameLog('intensity', intensity)
        var vecToward = vecNormalize(vecSubVec(planetPosition, cameraTransform[0]))
        var gravityToward = vecMulNum(vecToward, intensity)
        return vecAddVec(accumulateInertia, gravityToward)
    }
    return accumulateInertia
}, vecZero())
*/

let dampenVelocity = 0.01
let accelerationRate = 0.01 + dampenVelocity
let angularAccelerationRate = 0.05
let maxVelocity = 5
let maxAngularVelocitySloppilyMeasured = 0.01
let spaceGameInertia
let spaceGameRotationLog
let spaceGameRotationLogMaxLength = FRAME_INTERVAL_MS_INV // X,Y,Z rotators times 60 FPS
let spaceGameRotationLogInfluence = (fromEnd) => {
    assert(() => fromEnd >= -0.01 && fromEnd < 1.01)
    return numClamp((1 - fromEnd) ** 4, 0, 1) / spaceGameRotationLogMaxLength
}
let resetInertia = () => {
    markMut('spaceGameInertia')
    markMut('spaceGameRotationLog')
    spaceGameRotationLog = []
    spaceGameInertia = vecZero()
}
let updateControls = (isFirstFrame) => {
    if (isFirstFrame) {
        resetInertia()
    }

    assert(() => matIsOrthonormalized(cameraTransformInv[1]))
    assert(() => matIsOrthonormalized(cameraTransform[1]))

    let rotations = vecLimitLength([
        readControlNegPos('p', 'P'), // P-itch
        readControlNegPos('c', 'C'), // yaw (clockwise/counterclockwise)
        readControlNegPos('S', 's'), // roll (S-pin)
    ], 1)

    spaceGameRotationLog.push(rotations)
    if (spaceGameRotationLog.length >= spaceGameRotationLogMaxLength) spaceGameRotationLog.shift()

    let reducedRotation = spaceGameRotationLog.reduce((rotationAccumulator, rotations, i) => {
        let influenceAmount =
            angularAccelerationRate *
            spaceGameRotationLogInfluence(1 - (i / spaceGameRotationLogMaxLength))
        let rotationMatrices = [
            matFromAxisAngle(cameraTransformInv[1][x], rotations[x] * influenceAmount),
            matFromAxisAngle(cameraTransformInv[1][y], rotations[y] * influenceAmount),
            matFromAxisAngle(cameraTransformInv[1][z], rotations[z] * influenceAmount),
        ]
        return rotationMatrices.reduce(matTransformMat, rotationAccumulator)
    }, matIdentity())
    setCameraRotation2(matOrthonormalize(reducedRotation))

    let directionX = cameraTransformInv[1][x]
    let directionY = cameraTransformInv[1][y]
    let directionZ = vecNegative(cameraTransformInv[1][z])

    // Add propulsion!
    let propulsion = vecLimitLength(vecAddVec(
        readControlAxis('d', 'u', directionZ),
        vecAddVec(
            readControlAxis('l', 'r', directionX),
            readControlAxis('U', 'D', directionY),
        )
    ), 1)
    let propulsionLength = vecLength(propulsion)
    spaceGameInertia = vecAddVec(
        spaceGameInertia,
        vecMulNum(propulsion, accelerationRate)
    )

    setCameraPosition(vecAddVec(cameraTransform[0], spaceGameInertia))

    // Dampen movement!
    let currentVelocity = vecLength(spaceGameInertia)
    let dampenedVelocity = numClamp(currentVelocity - dampenVelocity, 0.001, maxVelocity)
    spaceGameInertia = vecMulNum(vecNormalize(spaceGameInertia), dampenedVelocity)

    // When already moving fast, align directions
    let alignmentRate = currentVelocity > .1 && propulsionLength > .1 && vecDotVec(vecNormalize(spaceGameInertia), vecNormalize(propulsion))
    if (alignmentRate > 0) {
        spaceGameInertia = vecMoveToward(spaceGameInertia, vecMulNum(vecNormalize(propulsion), dampenedVelocity), alignmentRate * 0.01)
    }

    // Do some audio
    sound_engine.volume = numLerp(sound_engine.volume, propulsionLength * (dampenedVelocity / maxVelocity), propulsionLength > 0.2 ? 0.2 : 0.01)
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
        resetInertia()

        landedMenu = createMenu([
            ['offblast now', offblast(storyMode)],
        ])
        return landedOnPlanet = 0
    } else if (!landedOnPlanet) {
        return 0
    } else {
        sound_engine.volume = numLerp(sound_engine.volume, 0, 0.1)
        frameLog('FUEL SUC', landedOnPlanet[planetName])
        frameLog('FUEL LVL', (fuel = numClamp(fuel + 0.0005, 0, 1)))
        if (fuel > 0.2) landedMenu()
        return 1
    }
}

let offblastSpeed = 5
let lastOffblast = 0
let offblast = storyMode => () => {
    let planetCenter = landedOnPlanet[planetTransform][0]
    let playerPosition = cameraTransform[0]
    let awayFromPlanet = vecSubVec(playerPosition, planetCenter)
    if (storyMode) {
        // CONSUME THE PLANET OMG
        consumePlanet(landedOnPlanet)
        resetUnicornToPlanet(planetCenter)
        sound_explosion.play()
    }

    // Go away from planet
    setCameraPosition(vecAddVec(cameraTransform[0], awayFromPlanet))
    spaceGameInertia = vecMulNum(vecNormalize(awayFromPlanet), offblastSpeed)

    // Fuck off

    landedOnPlanet = 0
    markMut('lastOffblast') // safe to use without reset
    lastOffblast = TIME
}

let getIsLandedOrStillOffBlasting = () =>
    landedOnPlanet || TIME - lastOffblast < planetExplosionRenderTime

let speedTooFastToLand = 50
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
        frameLog('autopilot', 'can\'t land on the sun')
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
                sound_explosion.play()
                die('crash landed on ' + getPlanetName(closestPlanet))
            }
            landedOnPlanet = closestPlanet
        }
    }
}
