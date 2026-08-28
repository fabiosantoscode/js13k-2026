
/* How many frames behind is the unicorn? */
let unicornSpeedEasy = 1000
let unicornSpeedImpossible = 300
let unicornScale = 2000
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

    unicornRecordedPlayerTform.push(cameraTransform[0])
    unicornTform[0] = unicornRecordedPlayerTform.length > unicornSpeed && unicornRecordedPlayerTform.shift()

    if (!unicornSpeed) {
        return
    }

    if (!unicornTform[0]) {
        frameLog('he approaches')

        return
    } else {
        frameLog('he follows')
    }

    frameLog('camera', cameraTransform[1])

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
