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
let undeferRenderCommands = () => {
    allLayers.map(layer => {
        // distance sort
        layer.sort((a, b) => b[0] - a[0])

        layer.map(a => a[2](a[0]))

        layer.length = 0 // clear commands
    })
}

let spaceGameInertia
let spaceGameRotationInertia
let spaceGamePlanets
let spaceGameStars
let onFrameSpaceGame = isFirstFrame => {
    if (isFirstFrame) {
        setCameraPosition([3, 100, 1000])
        spaceGameInertia = vecZero()
        spaceGameRotationInertia = matIdentity()
        //spaceGameRotationInertia = matFromAxisAngle([0,0,1], 0.001)
        spaceGamePlanets = initPlanets()
        spaceGameStars = initStars()
        updateRenderUnicorns = initUpdateRenderUnicorns()
    }

    ctx.fillStyle = '#111'
    ctx.fillRect(-10, -10, 100, 100)

    ctx.lineWidth = 0.005
    ctx.globalAlpha = 0.5
    ctx.strokeStyle = 'red'

    spaceGameInertia = updateSpaceInertia(spaceGameInertia)
    updateControls()
    updateRenderStars()
    updateRenderPlanets()
    updateRenderUnicorns()

    undeferRenderCommands()
}

let starDistance = 100_000
let initStars = () => Array.from({ length: 1000 }, (_, i) => {
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
let initPlanets = () => [
    [
        tform([
            [1, 1, 1],
            matScaled(450)
        ]),
        '#ff8c00',
        'sun',
    ],
    [
        tform([
            [ 4430, 443, -4920 ],
            matScaled(99),
        ]),
        "#ffffff",
        "fishy"
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
    ]
].map(([t,...rest]) => [[vecMulNum(t[0], 0.4), t[1]],...rest])


let updateRenderPlanets = () => spaceGamePlanets
    .map(([
        planetTform,
        color,
        name,
    ]) =>
        deferRenderCommand(deferLayer3D, planetTform, (distance) => {
            let planetSize = vecLength(planetTform[1][x])
            let planetScreenRadius = cameraProjectRadiusAtDistance(distance, planetSize) / 2

            if (distance < 5000) {
                ctx.fillStyle = '#fff'
                ctx.font = screenFont
                ctx.fillText((name == 'sun' ? ' The ' : ' Planet ') + name, ...cameraProject2d(planetTform[0]).map((coord, i) => coord + (i ? screenFontHeight/2 : planetScreenRadius)))
            }

            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(
                ...cameraProject2d(planetTform[0]),
                planetScreenRadius,
                0,
                TAU
            )
            ctx.fill()
        })
    )


let updateSpaceInertia = inertia => spaceGamePlanets.reduce((inertia, [planetTform]) => {
    // Let's gravitate towards the sun
    let planetPosition = vec(planetTform[0])
    let planetDistance = vecDistance(cameraTransform[0], planetPosition)
    let planetSize = vecLength(planetTform[1][x])

    // Gravity scale: 1000
    planetDistance = planetDistance / 10000

    if (planetDistance < 1) {
        let planetMass = (planetSize / 1000000)
        var intensity = ((1 - planetDistance) ** 2) * planetMass
        var vecToward = vecNormalize(vecSubVec(planetPosition, cameraTransform[0]))
        var gravityToward = vecMulNum(vecToward, intensity)
        return vecAddVec(inertia, gravityToward)
    }
    return inertia
}, inertia)

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

let updateRenderUnicorns
let initUpdateRenderUnicorns = () => {
    let unicornStart = TIME + 10
    let unicornPos = cameraTransform[0]
    let recordedPlayerPositions = []

    return () => {
        // TODO following
        unicornPos = [0.1,0.1,-1000.1]

        let transform = [unicornPos, (matScaled(500))]
        deferRenderCommand(deferLayer3D, transform, () => {
            ctx.fillStyle = '#f06'
            ctx.fill(assetUnicornBody(transform))
            ctx.fillStyle = '#f0a'
            ctx.fill(assetUnicornHead(transform))
            ctx.fillStyle = '#fff'
            ctx.fill(assetUnicornHorn(transform))
            ctx.fillStyle = '#ff0'
            ctx.fill(assetUnicornEyesMouth(transform))
        })
    }
}
