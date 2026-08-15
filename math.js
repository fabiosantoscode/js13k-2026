
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

    let rotate90deg = mat(matRotateY(TAU * 0.25))
    assertEq(matTransformVec(rotate90deg, vec([0, 0, -1])), vec([1, 0, 0]))

    assertEq(
        tformTransformVec([[10, 10, 10], rotate90deg], vec([0, 0, -1])),
        vec([11, 10, 10])
    )
}
let assertEq = (n1, n2) => {
    if (self.production) return
    if (typeof n1 === 'function') n1 = n1()
    if (typeof n2 === 'function') n2 = n2()
    if (shape(n1) !== shape(n2)) {
        throw new Error(`shape mismatch ${str(n1)} ${str(n2)}`)
    }
    n1 = [n1].flat()
    n2 = [n2].flat()
    assert(() => n1.length == n2.length)
    assert(() => n1.every((it, i) => Math.abs(it - n2[i]) < 0.001), () => `${str(n1)} != ${str(n2)}`)
}
// LCG deterministic random number generator.
// https://stackoverflow.com/a/72732727/1011311 (adapted)
let makeRng = (seed, m = 2**35 - 31, a = 185852, s = seed % m) => {
    return (max) => (s = s * a % m) / m;
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
let isVec = vec => vec.length === 3 && vec.every(isNum)
let isMat = mat => mat.length === 3 && mat.every(isVec)
let isTform = tform => tform.length === 2 && isVec(tform[0]) && isMat(tform[1])
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
let shape = n => isNum(n) ? 1 : isVec(n) ? 2 : isMat(n) ? 3 : isTform(n) ? 4 : assertFail('unknown shape for ' + n)
let str = n => (
    isNum(n) ? (
        Math.floor(n) !== n && Math.abs(n) < 1000 && String(n).length > 6
            ? Math.round(n * 1000) / 1000
            : n
    )
    : isVec(n) ? `vec([${n.map(str)}])`
    : isMat(n) ? `mat([${n.map(n => `[${n.map(str)}]`)}])`
    : n.every ? `[${n}]`
    : n
) + ''
let vecMulNum = (v, n) => (vec(v), num(n), [v[x] * n, v[y] * n, v[z] * n])
let vecAddVec = (v1, v2) => (vec(v1), vec(v2), [v1[x] + v2[x], v1[y] + v2[y], v1[z] + v2[z]])
let vecSubVec = (v1, v2) => (vec(v1), vec(v2), [v1[x] - v2[x], v1[y] - v2[y], v1[z] - v2[z]])
let vecMulVec = (v1, v2) => (vec(v1), vec(v2), [v1[x] * v2[x], v1[y] * v2[y], v1[z] * v2[z]])
let vecDivVec = (v1, v2) => (vec(v1), vec(v2), [v1[x] / v2[x], v1[y] / v2[y], v1[z] / v2[z]])
let vecSubtract = (v1, v2) => {
    assert(() => v1.length === v2.length)
    return v1.map((v1, i) => v1 - v2[i])
}
let vecNegative = (v1) => {
    return v1.map((v1) => -v1)
}
let matIdentity = () => [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
]
let tformIdentity = () => [
    [0, 0, 0],
    matIdentity()
]
let vecDotVec = (v1, v2) => {
    vec(v1)
    vec(v2)
    return num(vecDotVecUnchecked(v1, v2))
}
let vecDotVecUnchecked = (v1, v2) => (v1[x] * v2[x]) + (v1[y] * v2[y]) + (v1[z] * v2[z])
let vecDotVec2Unchecked = (v1, v2) => (v1[x] * v2[x]) + (v1[y] * v2[y])
// Yoinked and ported from Godot
// https://github.com/godotengine/godot/blob/3defa2466e4f2c767c347f74620ee86b23282902/core/math/basis.h#L274
let matTransformVec = (m, v) => {
    return [
        vecDotVec(m[x], v),
        vecDotVec(m[y], v),
        vecDotVec(m[z], v),
    ]
}
let matMulNum = (m, n) => {
    mat(m)
    num(n)
    return [
        [m[x][x] * n, m[x][y] * n, m[x][z]],
        [m[y][x] * n, m[y][y] * n, m[y][z]],
        [m[z][x] * n, m[z][y] * n, m[z][z]],
    ]
}
let matTransformAndAddVec = (m, v, v2) => {
    vec(v2)
    return [
        vecDotVec(m[x], v) + v2[0],
        vecDotVec(m[y], v) + v2[1],
        vecDotVec(m[z], v) + v2[2],
    ]
}
let matTransformAndAddVecUnchecked = (m, v, v2) => {
    return [
        vecDotVecUnchecked(m[x], v) + v2[0],
        vecDotVecUnchecked(m[y], v) + v2[1],
        vecDotVecUnchecked(m[z], v) + v2[2],
    ]
}
// Transformed dot product
let matTDotxVec = (m, v) => num(m[x][x] * v[x] + m[y][x] * v[y] + m[z][x] * v[z])
let matTDotyVec = (m, v) => num(m[x][y] * v[x] + m[y][y] * v[y] + m[z][y] * v[z])
let matTDotzVec = (m, v) => num(m[x][z] * v[x] + m[y][z] * v[y] + m[z][z] * v[z])
let matTransformMat = (m1, m2) => {
    // TODO not tested or done
    mat(m1)
    mat(m2)
    return mat([
        [matTDotxVec(m2, m1[0]), matTDotyVec(m2, m1[0]), matTDotzVec(m2, m1[0])],
        [matTDotxVec(m2, m1[1]), matTDotyVec(m2, m1[1]), matTDotzVec(m2, m1[1])],
        [matTDotxVec(m2, m1[2]), matTDotyVec(m2, m1[2]), matTDotzVec(m2, m1[2])],
    ])
}
let matRotateY = (angle) => {
  angle = -num(angle)
    var cos = Math.cos(angle)
    var sin = Math.sin(angle)

    return [
        [ cos,  0.0,  sin],
        [ 0.0,  1.0,  0.0],
        [-sin,  0.0,  cos],
    ]
}
let matRotateX = (angle) => {
  angle = -num(angle)
    var cos = Math.cos(num(angle))
    var sin = Math.sin(angle)

    return [
        [ 1.0,  0.0,  0.0],
        [ 0.0,  cos, -sin],
        [-0.0,  sin,  cos],
    ]
}
let tformTransformVec = (t, v) => {
    tform(t)
    return [
        vecDotVecUnchecked(t[1][x], v) + t[0][0],
        vecDotVecUnchecked(t[1][y], v) + t[0][1],
        vecDotVecUnchecked(t[1][z], v) + t[0][2],
    ]
}
let tformTransformVecUnchecked = (t, v) => {
    return [
        vecDotVecUnchecked(t[1][x], v) + t[0][0],
        vecDotVecUnchecked(t[1][y], v) + t[0][1],
        vecDotVecUnchecked(t[1][z], v) + t[0][2],
    ]
}
let tformProjectVec = (t, v, fov) => {
    v = [
        v[0] + t[0][0],
        v[1] + t[0][1],
        v[2] + t[0][2],
    ]
    // Do z first because is necessary for perspective
    let distance = -vecDotVecUnchecked(t[1][z], v)
    let perspective = distance && 1 / (distance * fov)
    // same as mat transform but we'll negate y for DOM canvas
    // and we add 0.5 to center on the screen
    return [
        num(vecDotVecUnchecked(t[1][x], v) * perspective + 0.5),
        num(-vecDotVecUnchecked(t[1][y], v) * perspective + 0.5),
        distance
    ]
}
/* Project each point of an asset with knowledge that
 *  assets are flat (Z is zero)
 *  point arrays are constructed in the asset code (ok to mutate)
 *  we want 2d points
 **/
let tformProjectAssetVec = (t, assetT, v, fov) => {
    v = [
        vecDotVecUnchecked(assetT[1][x], v) + assetT[0][0] + t[0][x],
        vecDotVecUnchecked(assetT[1][y], v) + assetT[0][1] + t[0][y],
        vecDotVec2Unchecked(assetT[1][z], v) + assetT[0][2] + t[0][z],
    ]

    // Do z first because is necessary for perspective
    let distance = -vecDotVecUnchecked(t[1][z], v)
    let perspective = distance && 1 / (distance * fov)
    // same as mat transform but we'll negate y for DOM canvas
    // and we add 0.5 to center on the screen
    return [
        num(vecDotVecUnchecked(t[1][x], v) * perspective + 0.5),
        num(-vecDotVecUnchecked(t[1][y], v) * perspective + 0.5),
    ]
}
let tformProjectZVec = (t, v, fov) => {
    return -vecDotVecUnchecked(t[1][z], [
        v[0] + t[0][0],
        v[1] + t[0][1],
        v[2] + t[0][2],
    ])
}
let tformTransformTform = (tParent, tChild) => {
    tform(tParent)
    tform(tChild)

    // scale/rot the child vec, then add parent
    let v = matTransformAndAddVecUnchecked(tParent[1], tChild[0], tParent[0])
    let m = matTransformMat(tParent[1], tChild[1])
    return [v, m]
}
let tformTranslateByLocalVec = (t, v) => {
    tform(t)
    vec(v)
    v = matTransformAndAddVecUnchecked(t[1], v, t[0])
    return [
        v,
        t[1]
    ]
}
let tformGetScale = t => {
    let scale = t[1][x][x] + t[1][x][y] + t[1][x][z]
    assert(() => Math.abs(scale - (t[1][y][x] + t[1][y][y] + t[1][y][z])) < 0.01, 'detected sheared tform. This is valid but probably an accident')
    assert(() => Math.abs(scale - (t[1][z][x] + t[1][z][y] + t[1][z][z])) < 0.01, 'detected sheared tform. This is valid but probably an accident')
    return scale
}
let unwrapFunction = fn => typeof fn === 'function' ? fn() : fn
let assertNotNaN = (value) => {
    if (!self.production) {
        if (value && typeof value === 'object' && value.length === 2) {
            // tform
            assertNotNaN(value[0])
            assertNotNaN(value[1])
        } else if (typeof value === 'number') {
            if (isNaN(value)) throw new Error('NaN found')
        } else {
            for (let item = 0; item < 3; item++) {
                if (typeof value[item] === 'number') {
                    if (isNaN(value[item])) throw new Error('NaN found')
                } else {
                    for (let innerItem = 0; innerItem < 3; innerItem++) {
                        if (isNaN(value[item][innerItem]) || typeof value[item][innerItem] !== 'number') throw new Error('NaN found')
                    }
                }
            }
        }
    }
}
let assert = self.production
    ? () => {}
    : (cond, message = 'assertion error') => {
        if (!cond()) {
            assertFail(unwrapFunction(message) + ' ' + cond)
        }
    }
let assertFail = message => {
    throw new Error(message)
}
