
let onFrameDemo = () => {
    let orZero = n => +n || 0
    var demoRotation = Math.sin(TIME) * 0.2
    var demoRotationX = Math.sin(TIME * 0.5) * 0.1
    cameraRotation = matTransformMat(matIdentity(), matRotateY(-demoRotation))
    cameraRotation = matTransformMat(cameraRotation, matRotateX(-demoRotationX))

    setCameraRotation(demoRotationX, demoRotation)

    let cameraMovement = vec([
        orZero(controls.l) * -1 + orZero(controls.r),
        orZero(controls.D) * -1 + orZero(controls.U),
        orZero(controls.u) * -1 + orZero(controls.d),
    ])
    cameraMovement = vecMulNum(cameraMovement, 0.2)
    cameraPosition = vecAddVec(cameraPosition, cameraMovement)

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
    ctx.stroke(assetCloud())
}

let onFrameTestingCameraRotation = 0
let onFrameTestingCameraRotationX = 0
let onFrameTesting = isFirstFrame => {
    if (isFirstFrame) {
        cameraPosition = [4, 4, 13]
        onFrameTestingCameraRotation = -0.05 * TAU
        onFrameTestingCameraRotationX = 0.05 * TAU
    }
    let orZero = n => +n || 0
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
    cameraMovement = matTransformVec(cameraRotationInv, cameraMovement)
    cameraMovement = vecMulNum(cameraMovement, 0.2)
    cameraPosition = vecAddVec(cameraPosition, cameraMovement)

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

    // Render a bunch of clouds
    let rng_ = makeRng(123)
    let rng = () => num((rng_() - 0.5) * 2 * 5)
    for (let i = 0; i < 100; i++) {
        var pos = [rng(), rng(), rng()]
        if (cameraProject(pos)[z] > 0.5) ctx.stroke(assetCloud(pos))
    }
}

