
let unicornSpeedMaximum = 1100
let unicornSpeedMinimum = 100

/* How many frames behind is the unicorn? */
let unicornSpeedEasy = 1000
let unicornAccelEasy = 0.1

let unicornSpeedVeryEasy = 1200
let unicornAccelVeryEasy = 0.01

let unicornSpeedMedium = 800
let unicornAccelMedium = 0.2

let unicornScale = 1000
let unicornAcceleration = 0
let unicornSpeed // Mutable, handled by story
let unicornRecordedPlayerTform // How it knows to follow player
let setUnicornSpeedAccel = (newSpeed, newAccel) => {
    unicornSpeed = newSpeed
    unicornAcceleration = newAccel
}
let unicornInitialPosition
let resetUnicornToPlanet = planetCenter => {
    unicornInitialPosition = planetCenter
}
let updateRenderUnicorn = isFirstFrame => {
    let unicornDotSelf
    let unicornPos
    let unicornTform = matIdentity()
    let vecTowardsUnicorn

    if (isFirstFrame) {
        markMut('unicornRecordedPlayerTform')
        markMut('unicornInitialPosition')
        markMut('unicornSpeed')
        markMut('unicornAcceleration')
        unicornSpeed = 0
        unicornAcceleration = 0
        unicornRecordedPlayerTform = []
        unicornInitialPosition = 0
        if (skipToUnicorn) setUnicornSpeedAccel(unicornSpeedEasy, unicornAccelEasy)
        return
    }

    unicornRecordedPlayerTform.push(cameraTransform[0])
    trimTopOf(unicornRecordedPlayerTform, Math.ceil(unicornSpeed))
    unicornTform[0] =
        unicornRecordedPlayerTform.length >= unicornSpeed ? unicornRecordedPlayerTform[0] : unicornInitialPosition

    if (!unicornSpeed || !unicornTform[0] || getIsLandedOrStillOffBlasting()) {
        return
    }

    unicornSpeed -= unicornAcceleration

    assert(() => unicornSpeed > 0, 'UNICORN got too close. The player should have died')

    deferDrawUICommand(UI_LAYER_UNICORN_BAR, () => {
        ctx.fillStyle = '#f00'
        ctx.fillRect(...frameLogAdvanceXYWidthHeight(
            1.0 - (unicornSpeed / (unicornSpeedMaximum - unicornSpeedMinimum))
        ))
    })

    if (vecLength(vecSubVec(cameraTransform[0], unicornTform[0])) < unicornScale * .1) {
        die('The UNICORN caught up')
    }

    // make sure not to render our unicorn when he's behind. He glitches out
    vecTowardsUnicorn = vec(vecNormalize(vecSubVec(cameraTransform[0], unicornTform[0])))
    if (vecDotVec(cameraTransformInv[1][z], vecTowardsUnicorn) < 0.1) return

    unicornTform[1] = matMulNum(matIdentity(), unicornScale)

    deferRenderCommand(unicornTform, () => {
        assetCompositeUnicornFlat(unicornTform)

        drawTransform(unicornTform)
        drawDebugCube(unicornTform)
    })
}

// Trim the top of the array
let trimTopOf = (array, unicornSpeed) =>
    (array.length > unicornSpeed + 1)
        ? (array.shift(), trimTopOf(array, unicornSpeed))
        : 0
