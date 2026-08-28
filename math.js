// micro-math3d.js
// Roughly equivalent to Godot math, in that Z is back, Y is up.
// But tiny and no objects used.
//
// ASSUMPTIONS:
// - you created a function called 'assertFail(x)' that's an alias for throw new Error(x)
// - you have configured your JS compiler to precompute `self.production` as `true`. That is, conditional compilation.
// Sine/cosine. `numSinCos` calculates both & returns sine
let sin
let cos
let numSinCos = n => {
    markMut('sin')
    markMut('cos')
    n = num(n)
    cos = Math.cos(n)
    return sin = Math.sin(n)
}
/** How wide is a sphere at `distance`, given `fov`? */
let numRadiusAtDistance = (radius, distance, fov) => {
    return num(radius / (distance * fov))
}

// SHAPE FUNCTIONS
// These functions do nothing but make sure you didn't mess up types
// num(n) will simply return `n` unless it's NaN, in which case it throws
// vec(v) will simply return `v` if it's an array of 3 non-NaN numbers
// etc.
let num = n => {
    if (!self.production && (typeof n !== 'number' || isNaN(n))) {
        assertFail(`${str(n)} is not a num`)
    }
    return n;
}
let vec = n => {
    if (!self.production) {
        if (n.length !== 3) assertFail(`${str(n)} is not a vec`)
        for (let vecNum = 0; vecNum < 3; vecNum++) {
            if (typeof n[vecNum] !== 'number' || isNaN(n[vecNum])) {
                assertFail(`${str(n[vecNum])} is not a vec num`)
            }
        }
    }
    return n;
}
let mat = n => {
    if (!self.production) {
        if (n.length !== 3) assertFail(`${str(n)} is not a mat`)
        for (let row = 0; row < 3; row++) {
            if (n[row].length !== 3) assertFail(`${str(n[row])} is not a mat row`)
            for (let cell = 0; cell < 3; cell++) {
                if (typeof n[row][cell] !== 'number' || isNaN(n[row][cell])) {
                    assertFail(`${str(n[row][cell])} is not a mat cell num`)
                }
            }
        }
    }
    return n;
}
let tform = n => {
    if (!self.production) {
        if (n[0].length !== 3) assertFail(`${str(n[0])} is not a vec`)
        for (let vecNum = 0; vecNum < 3; vecNum++) {
            if (typeof n[0][vecNum] !== 'number' || isNaN(n[0][vecNum])) {
                assertFail(`${str(n[0][vecNum])} is not a vec num`)
            }
        }

        if (n[1].length !== 3) assertFail(`${str(n[1])} is not a mat`)
        for (let row = 0; row < 3; row++) {
            if (n[1][row].length !== 3) assertFail(`${str(n[1][row])} is not a mat row`)
            for (let cell = 0; cell < 3; cell++) {
                if (typeof n[1][row][cell] !== 'number' || isNaN(n[1][row][cell])) {
                    assertFail(`${str(n[1][row][cell])} is not a mat cell num`)
                }
            }
        }
    }
    return n
}

let testMath = () => {
    num(1)
    vec([1, 2, 3])
    mat([
        [1, 2, 3],
        [1, 2, 3],
        [1, 2, 3]
    ])
    tform([
        [1, 2, 3],
        [
            [1, 2, 3],
            [1, 2, 3],
            [1, 2, 3]
        ]
    ])
    /* skip these tests because it makes debugging harder
    assertThrows(() => assertNotNaN(NaN))
    assertThrows(() => assertNotNaN([NaN]))
    assertThrows(() => assertNotNaN([[NaN]]))
    assertThrows(() => num(NaN))
    assertThrows(() => vec([NaN, 1, 1]))
    assertThrows(() => mat([[1, 0, 0], [0, 1, 0], [0, 0, NaN]]))
    /**/

    let rotate90deg = mat(matRotateY(-TAU * 0.25))
    assertEq(matTransformVec(rotate90deg, vec([0, 0, -1])), vec([1, 0, 0]))

    assertEq(
        tformTransformVec([[10, 10, 10], rotate90deg], vec([0, -1, -1])),
        vec([11, 9, 10])
    )

    let rotate90deg2 = matFromAxisAngle([0, -1, 0], TAU * 0.25)
    assertEq(matTransformVec(rotate90deg2, vec([0, 0, -1])), vec([1, 0, 0]))

    assertEq(
        tformTransformVec([[10, 10, 10], rotate90deg2], vec([0, 0, -1])),
        vec([11, 10, 10])
    )

    assertEq(vecNormalize([2, 0, 0]), [1, 0, 0])
    assertEq(vecNormalize([1, 1, 0]), [.707, .707, 0])

    assertEq(matTranspose([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
    ]), [
        [1, 4, 7],
        [2, 5, 8],
        [3, 6, 9],
    ])
    assertEq(matTranspose(matTranspose([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
    ])), [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
    ])

    // matrix by angle tests
    assertEq(matRotateX(0.5), matFromAxisAngle([1, 0, 0], 0.5))
    assertEq(matRotateY(0.5), matFromAxisAngle([0, 1, 0], 0.5))
    assertEq(matRotateZ(0.5), matFromAxisAngle([0, 0, 1], 0.5))

    assertEq(matOrthonormalize([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
    ]), matIdentity())
    assertEq(matOrthonormalize([
        [.1, 0, 0],
        [0, .1, 0],
        [0, 0, .1],
    ]), matIdentity())
}
let assertEq = (n1, n2) => {
    if (self.production) return
    if (typeof n1 === 'function') n1 = n1()
    if (typeof n2 === 'function') n2 = n2()
    if (shape(n1) !== shape(n2)) {
        throw new Error(`shape mismatch ${str(n1)} ${str(n2)}`)
    }
    n1 = [n1].flat(Infinity)
    n2 = [n2].flat(Infinity)
    assert(() => n1.length == n2.length)
    assert(() => n1.every((it, i) => Math.abs(it - n2[i]) < 0.001), () => `${str(n1)} != ${str(n2)}`)
}
// LCG deterministic random number generator.
// https://stackoverflow.com/a/72732727/1011311 (adapted)
// returns -0.5..0.5
let rngSeed
let rng = () => {
    rngSeed = numSinCos(rngSeed) * 10000;
    return (rngSeed - Math.round(rngSeed));
}
let assertThrows = (cb) => {
    try {
        cb()
    } catch (e) {
        return
    }
    assertFail('callback `' + cb + '` did not throw')
}
let isNum = n => typeof n == 'number'
let isStr = s => s && s.big
let isVec = vec => vec && vec.every && vec.length === 3 && vec.every(isNum)
let isQuat = quat => quat && quat.every && quat.length === 4 && quat.every(isNum)
let isMat = mat => mat && mat.every && mat.length === 3 && mat.every(isVec)
let isTform = tform => tform && tform.every && tform.length === 2 && isVec(tform[0]) && isMat(tform[1])
let shape = n => isNum(n) ? 1 : isVec(n) ? 2 : isMat(n) ? 3 : isTform(n) ? 4 : assertFail('unknown shape for ' + n)
let str = n => (
    isNum(n) ? (
        Math.floor(n) !== n && Math.abs(n) < 1000 && String(n).length > 6
            ? ('' + Math.round(n * 1000) / 1000)
                .replace(/^([0-9])/, ' $1') // add spc when no leading "-"
                .padEnd(5, '0') // add trailing zeros
            : n
    )
    : !n || isStr(n) ? n
    : isVec(n) ? `vec([${n.map(str)}])`
    : isMat(n) ? `mat([${n.map(n => `[${n.map(str)}]`)}])`
    : isTform(n) ? `tform([${str(n[0])}, ${str(n[1])}])`
    : isQuat(n) ? `quat([${n.map(str)}])`
    : n.map ? `[${n}]`
    : n
) + ''
let numCloseTo = (a, b) => {
    return Math.abs(num(a) - num(b)) < 0.02
}
let numLerp = (a, b, weight) => {
    return a + (b - a) * weight
}
let numClamp = (n, min, max) => n < min ? min : n > max ? max : n
let numMoveToward = (a, b, byN) => {
    assert(() => byN > 0)
    if (a < b) return numClamp(a + byN, a, b)
    else return numClamp(a - byN, a, b)
}
let vecMulNum = (v, n) => (vec(v), num(n), [v[x] * n, v[y] * n, v[z] * n])
let vecAddVec = (v1, v2) => (vec(v1), vec(v2), [v1[x] + v2[x], v1[y] + v2[y], v1[z] + v2[z]])
let vecSubVec = (v1, v2) => (vec(v1), vec(v2), [v1[x] - v2[x], v1[y] - v2[y], v1[z] - v2[z]])
let vecMulVec = (v1, v2) => (vec(v1), vec(v2), [v1[x] * v2[x], v1[y] * v2[y], v1[z] * v2[z]])
let vecDivVec = (v1, v2) => (vec(v1), vec(v2), [v1[x] / v2[x], v1[y] / v2[y], v1[z] / v2[z]])
let vecMoveToward = (v1, v2, byN) => (vec(v1), vec(v2), num(byN), [numMoveToward(v1[x], v2[x], byN), numMoveToward(v1[y], v2[y], byN), numMoveToward(v1[z], v2[z], byN)])
let vecNegative = (v) => mapI3(i=>-v[i])
let vecIsNormalized = (v) => {
    return numCloseTo(vecLengthSq(v), 1)
}
let vecNormalize = (v, lenSq = vecLengthSq(v), length = Math.sqrt(lenSq)) => {
    if (lenSq < .001) return v

    let norm = mapI3(axis => num(v[axis]/length))

    assert(() => vecIsNormalized(norm))

    return norm
}
let vecLength = v => num(Math.sqrt(vecLengthSq(v)))
let vecLengthSq = v => {
    return num(v[x] * v[x] + v[y] * v[y] + v[z] * v[z])
}
let vecZero = () => [0, 0, 0]
let matIdentity = () => [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
]
let tformIdentity = () => [
    vecZero(),
    matIdentity()
]
let vecDotVec = (v1, v2) => {
    return num((v1[x] * v2[x]) + (v1[y] * v2[y]) + (v1[z] * v2[z]))
}
// from godot vector3.h
let vecCrossVec = (v1, v2) => (
    vec(v1),
    vec(v2),
    [
        (v1[y] * v2[z]) - (v1[z] * v2[y]),
        (v1[z] * v2[x]) - (v1[x] * v2[z]),
        (v1[x] * v2[y]) - (v1[y] * v2[x]),
    ]
)
let vecLerp = (v1, v2, weight) => mapI3(axis => numLerp(v1[axis], v2[axis], weight))
let vecDistance = (v1, v2) => Math.sqrt(
    vecLengthSq(vecSubVec(v1, v2))
)
let vecDivNum = (v, n) => vec(mapI3(axis => v[axis] / n))
// Yoinked and ported from Godot
// https://github.com/godotengine/godot/blob/3defa2466e4f2c767c347f74620ee86b23282902/core/math/basis.h#L274
let matTransformVec = (m, v) => {
    return [
        vecDotVec(m[x], v),
        vecDotVec(m[y], v),
        vecDotVec(m[z], v),
    ]
}
let matFlip = (m) => matMulNum(m, -1)
let matMulNum = (m, n) => {
    mat(m)
    num(n)
    return [
        [m[x][x] * n, m[x][y] * n, m[x][z] * n],
        [m[y][x] * n, m[y][y] * n, m[y][z] * n],
        [m[z][x] * n, m[z][y] * n, m[z][z] * n],
    ]
}
let matTransformAndAddVec = (m, v, v2) => {
    return [
        vecDotVec(m[x], v) + v2[x],
        vecDotVec(m[y], v) + v2[y],
        vecDotVec(m[z], v) + v2[z],
    ]
}
// Transformed dot product
let matTDotxVec = (m, v) => num(m[x][x] * v[x] + m[y][x] * v[y] + m[z][x] * v[z])
let matTDotyVec = (m, v) => num(m[x][y] * v[x] + m[y][y] * v[y] + m[z][y] * v[z])
let matTDotzVec = (m, v) => num(m[x][z] * v[x] + m[y][z] * v[y] + m[z][z] * v[z])
let matTDotAxisVec = (m, v, axis) =>
    num(m[x][axis] * v[x] + m[y][axis] * v[y] + m[z][axis] * v[z])
// https://github.com/godotengine/godot/blob/89cea143987d564363e15d207438530651d943ac/core/math/basis.cpp#L36
let matCofac = (m, row1, col1, row2, col2) =>
    (m[row1][col1] * m[row2][col2] - m[row1][col2] * m[row2][col1])
let matInvert = (m) => {
    mat(m)

    let co0 = matCofac(m, 1, 1, 2, 2)
    let co1 = matCofac(m, 1, 2, 2, 0)
    let co2 = matCofac(m, 1, 0, 2, 1)

    let det =
        m[x][x] * co0 +
        m[x][y] * co1 +
        m[x][z] * co2

    // assert(() => det != 0)

    let s = 1/(det)

    return mat([
        [co0 * s, matCofac(m, 0, 2, 2, 1) * s, matCofac(m, 0, 1, 1, 2) * s],
        [co1 * s, matCofac(m, 0, 0, 2, 2) * s, matCofac(m, 0, 2, 1, 0) * s],
        [co2 * s, matCofac(m, 0, 1, 2, 0) * s, matCofac(m, 0, 0, 1, 1) * s],
    ])
}
// https://github.com/godotengine/godot/blob/89cea143987d564363e15d207438530651d943ac/core/math/basis.cpp#L56
let matOrthonormalize = (m) => {
    m = matTranspose(m)
    let vx = m[x]
    let vy = m[y]
    let vz = m[z]

    vx = vecNormalize(vx)
    vy = (vecSubVec(vy, vecMulNum(vx, vecDotVec(vx, vy))))
    vy = vecNormalize(vy)
    //z = (z - x * (x.dot(z))                 - y * (y.dot(z)));
    vz = [
        vz,
        vecMulNum(vx, vecDotVec(vx, vz)),
        vecMulNum(vy, vecDotVec(vy, vz))
    ].reduce(vecSubVec)
    vz = vecNormalize(vz)

    assert(() => vecIsNormalized(vx))
    assert(() => vecIsNormalized(vy))
    assert(() => vecIsNormalized(vz))

    m = matTranspose([vx, vy, vz])

    assert(() => vecIsNormalized(m[x]))
    assert(() => vecIsNormalized(m[y]))
    assert(() => vecIsNormalized(m[z]))

    return m
}
let matMoveToward = (m1, m2, byN) => matOrthonormalize(
    mapI3(row => vecMoveToward(m1[row], m2[row], byN))
)
let matDampen = (m, n) => matMoveToward(m, matIdentity(), n)
let matIsOrthonormalized = m =>
    numCloseTo(vecLengthSq(m[x]) + vecLengthSq(m[y]) + vecLengthSq(m[z]), 3)
    && numCloseTo(0, vecDotVec(m[x], m[y]))
    && numCloseTo(0, vecDotVec(m[x], m[z]))
    && numCloseTo(0, vecDotVec(m[y], m[z]))
let matTranspose = m => mat(mapI3(xs=>mapI3(ys=>m[ys][xs])))
let mapI3 = (cb) => [cb(0),cb(1),cb(2)]
let matTransformMat = (m1, m2) => {
    mat(m1)
    mat(m2)
    return mat(mapI3(row => mapI3(col => matTDotAxisVec(m2, m1[row], col))))
}
let matRotateX = (angle) => matFromAxisAngle([1, 0, 0], angle)
let matRotateY = (angle) => matFromAxisAngle([0, 1, 0], angle)
let matRotateZ = (angle) => matFromAxisAngle([0, 0, 1], angle)
let matScaled = S => matMulNum(matIdentity(), S)
let matLerp = (l, r, weight) => mapI3(row => vecLerp(l[row], r[row], weight))
// https://github.com/godotengine/godot/blob/89cea143987d564363e15d207438530651d943ac/core/math/basis.cpp#L840
let matFromAxisAngle = (axis, angle) => {
    assert(() => vecIsNormalized(axis))

    numSinCos(angle)

    let axis_sq = vecMulVec(axis, axis)

    let retMatrix = matIdentity()
    retMatrix[x][x] = axis_sq[x] + cos * (1 - axis_sq[x])
    retMatrix[y][y] = axis_sq[y] + cos * (1 - axis_sq[y])
    retMatrix[z][z] = axis_sq[z] + cos * (1 - axis_sq[z])

    let t = 1 - cos

    let xyzt = axis[x] * axis[y] * t
    let zyxs = axis[z] * sin
    retMatrix[x][y] = xyzt - zyxs;
    retMatrix[y][x] = xyzt + zyxs;

    xyzt = axis[x] * axis[z] * t
    zyxs = axis[y] * sin
    retMatrix[x][z] = xyzt + zyxs
    retMatrix[z][x] = xyzt - zyxs

    xyzt = axis[y] * axis[z] * t
    zyxs = axis[x] * sin
    retMatrix[y][z] = xyzt - zyxs
    retMatrix[z][y] = xyzt + zyxs

    return retMatrix
}
let matScaleNum = (m, n) => mapI3(row => mapI3(axis => m[row][axis] * n))
let tformTransformVec = (t, v) => (
    tform(t),
    [
        vecDotVec(t[1][x], v) + t[0][x],
        vecDotVec(t[1][y], v) + t[0][y],
        vecDotVec(t[1][z], v) + t[0][z],
    ]
)
let tformTransformVecUnchecked = (t, v) => {
    return [
        vecDotVec(t[1][x], v) + t[0][x],
        vecDotVec(t[1][y], v) + t[0][y],
        vecDotVec(t[1][z], v) + t[0][z],
    ]
}
let tformProjectVec = (t, v, fov) => {
    return tformProjectVecInner(t, [
        v[x] + t[0][x],
        v[y] + t[0][y],
        v[z] + t[0][z],
    ], fov)
}
/* Project each point of an asset with knowledge that
 *  assets are flat (Z is zero)
 *  point arrays are constructed in the asset code (ok to mutate)
 **/
let tformProjectAssetVec = (assetT, pointX, pointY, fov) => {
    // Careful here -- we're accessing a variable cameraTransformInv from another module
    return tformProjectVecInner(cameraTransformInv, [
        vecDotVec(assetT[1][x], [pointX, pointY, 0]) + assetT[0][x] + cameraTransformInv[0][x],
        vecDotVec(assetT[1][y], [pointX, pointY, 0]) + assetT[0][y] + cameraTransformInv[0][y],
        vecDotVec(assetT[1][z], [pointX, pointY, 0]) + assetT[0][z] + cameraTransformInv[0][z],
    ], fov)
}
let tformProjectAssetFlatVec = (assetT, pointX, pointY, fov) => {
    // TODO maybe don't need tformProjectVecInner, maybe something that allocates less
    let centerXY = tformProjectVecInner(cameraTransformInv, [
        assetT[0][x] + cameraTransformInv[0][x],
        assetT[0][y] + cameraTransformInv[0][y],
        assetT[0][z] + cameraTransformInv[0][z],
    ], fov)

    // Careful here -- we're accessing a variable cameraTransformInv from another module
    let distance = tformProjectZVec(cameraTransformInv, assetT[0])
    let scale = numRadiusAtDistance(tformGetScale(assetT), distance, fov)

    return [centerXY[x] + pointX * scale, centerXY[y] + pointY * scale]
}
let tformProjectVecInner = (t, v, fov) => {
    // Do z first because is necessary for perspective
    let distance = -vecDotVec(t[1][z], v)
    let perspective = distance && 1 / (distance * fov)
    // same as mat transform but we'll negate y for DOM canvas
    // and we add 0.5 to center on the screen
    return [
        (vecDotVec(t[1][x], v) * perspective + 0.5),
        (-vecDotVec(t[1][y], v) * perspective + 0.5),
    ]
}
let tformProjectZVec = (t, v) => {
    return -vecDotVec(t[1][z], [
        v[x] + t[0][x],
        v[y] + t[0][y],
        v[z] + t[0][z],
    ])
}
let tformTransformTform = (tParent, tChild) => {
    tform(tParent)
    tform(tChild)

    // scale/rot the child vec, then add parent
    let v = matTransformAndAddVec(tParent[1], tChild[0], tParent[0])
    let m = matTransformMat(tParent[1], tChild[1])
    return [v, m]
}
let tformTranslateByLocalVec = (t, v) => {
    tform(t)
    vec(v)
    v = matTransformAndAddVec(t[1], v, t[0])
    return [
        v,
        t[1]
    ]
}
let tformGetScale = t => {
    return (t[1][x][x] + t[1][x][y] + t[1][x][z])/3
}
let tformScaleNum = (t, s) => tform([t[0], matScaleNum(t[1], s)])
let assertFail = message => {
    throw new Error(message)
}
