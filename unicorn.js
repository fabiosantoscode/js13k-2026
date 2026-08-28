
/* How many frames behind is the unicorn? */
let unicornSpeedEasy = 1000
let unicornSpeedImpossible = 300
let unicornScale = 300 // This is negative so that we flip the player camera matrix
let unicornSpeed // Mutable, handled by story
let unicornRecordedPlayerTform // How it knows to follow player
let setUnicornSpeed = newSpeed => {
    markMut('unicornSpeed')
    unicornSpeed = newSpeed
}
let updateRenderUnicorn = isFirstFrame => {
    let unicornDotSelf
    let unicornPos
    let unicornTform = matIdentity()
    let vecTowardsUnicorn

    if (isFirstFrame) {
        markMut('unicornRecordedPlayerTform')
        unicornRecordedPlayerTform = []
        if (skipToUnicorn) setUnicornSpeed(unicornSpeedImpossible)
        return
    }

    if (!unicornSpeed) {
        return
    }

    unicornRecordedPlayerTform.push(cameraTransform[0])
    unicornTform[0] = unicornRecordedPlayerTform.length > unicornSpeed && unicornRecordedPlayerTform.shift()

    if (!unicornTform[0]) {
        frameLog('he approaches')

        return
    } else {
        frameLog('he follows')
    }

    frameLog('camera', cameraTransform[1])

    // make sure not to render our unicorn when he's behind. He glitches out
    vecTowardsUnicorn = vec(vecNormalize(vecSubVec(cameraTransform[0], unicornTform[0])))
    unicornDotMe = vecDotVec(cameraTransformInv[1][z], vecTowardsUnicorn)
    if (unicornDotMe < 0.1) return

    unicornTform[1] = matMulNum(matIdentity(), unicornScale)

    deferRenderCommand(deferLayer3D, unicornTform, () => {
        assetCompositeUnicornFlat(unicornTform)

        drawTransform(unicornTform)
        drawDebugCube(unicornTform)
    })
}
