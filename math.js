
let testMath = () => {
    num(1)
    vec([1, 2, 3])
    mat([
        [1, 2, 3],
        [1, 2, 3],
        [1, 2, 3]
    ])
    assertThrows(() => assertNotNaN(NaN))
    assertThrows(() => assertNotNaN([NaN]))
    assertThrows(() => assertNotNaN([[NaN]]))
    assertThrows(() => num(NaN))
    assertThrows(() => vec([NaN, 1, 1]))
    assertThrows(() => mat([[1, 0, 0], [0, 1, 0], [0, 0, NaN]]))

    let rotate90deg = mat(matRotateZX(TAU * 0.25))
    assertEq(matTransformVec(rotate90deg, vec([0, 0, 1])), vec([0, -1, 0]))
}
let assertEq = (n1, n2) => {
    if (self.production) return
    if (typeof n1 === 'function') n1 = n1()
    if (typeof n2 === 'function') n2 = n2()
    if (shape(n1) !== shape(n2)) {
        throw new Error(`shape mismatch ${str(n1)} ${str(n2)}`)
    }
}
let assertThrows = (cb) => {
    try {
        cb()
    } catch (e) {
        return
    }
    assert(() => false, 'callback `' + cb + '` did not throw')
}
let isNum = n => typeof n == 'number'
let isVec = vec => vec.length === 3 && vec.every(isNum)
let isMat = mat => mat.length === 3 && mat.every(isVec)
let num = n => { if (self.production) return n; assert(() => isNum(n), `${str(n)} is not a num`); assertNotNaN(n); return n }
let vec = n => { if (self.production) return n; assert(() => isVec(n), `${str(n)} is not a vec`); assertNotNaN(n); return n }
let mat = n => { if (self.production) return n; assert(() => isMat(n), `${str(n)} is not a mat`); assertNotNaN(n); return n }
let shape = n => isNum(n) ? 1 : isVec(n) ? 2 : isMat(n) ? 3 : assert(() => false, 'unknown shape for ' + n)
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
let mat4Zeroes = () => [
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
]
let mat4Identity = () => [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
]
let vecDotVec = (v1, v2) => {
    vec(v1)
    vec(v2)
    return num((v1[x] * v2[x]) + (v1[y] * v2[y]) + (v1[z] * v2[z]))
}
// Yoinked and ported from Godot
// https://github.com/godotengine/godot/blob/3defa2466e4f2c767c347f74620ee86b23282902/core/math/basis.h#L274
let matTransformVec = (m, v) => {
    return vec([
        vecDotVec(m[x], v),
        vecDotVec(m[y], v),
        vecDotVec(m[z], v),
    ])
}
let matTransformMat = (m1, m2) => {
    todo('not tested or done')
    mat(m1)
    mat(m2)
    return mat([
        [matTDotx(m2, m1[0]), matTDoty(m2, m1[0]), matTDotz(m2, m1[0])],
        [matTDotx(m2, m1[1]), matTDoty(m2, m1[1]), matTDotz(m2, m1[1])],
        [matTDotx(m2, m1[2]), matTDoty(m2, m1[2]), matTDotz(m2, m1[2])],
    ])
}
// https://lisyarus.github.io/blog/posts/implementing-a-tiny-cpu-rasterizer-part-4.html#section-3d-transformations
let mat4Multiply = (m1, m2) => {
    var ret = mat4Zeroes()

    assert(() => m1.length === ret.length)
    assert(() => m2.length === ret.length)

    for (let i = 0; i < 4; ++i)
        for (let j = 0; j < 4; ++j)
            for (let k = 0; k < 4; ++k)
                ret[4 * i + j] += m1[4 * i + k] * m2[4 * k + j];

    return ret;
}
let matRotateZX = (angle) => {
    var cos = Math.cos(num(angle))
    var sin = Math.sin(angle)

    return [
        [ cos,  0.0,  sin],
        [ 0.0,  1.0,  0.0],
        [-sin,  0.0,  cos],
    ]
}
let matRotateYZ = (angle) => {
    var cos = Math.cos(num(angle))
    var sin = Math.sin(angle)

    return [
        [ 1.0,  0.0,  0.0],
        [ 0.0,  cos, -sin],
        [-0.0,  sin,  cos],
    ]
}
let mat4RotateZX = (angle) => {
    var cos = Math.cos(angle)
    var sin = Math.sin(angle)

    return [
        cos, 0.0, sin, 0.0,
        0.0, 1.0, 0.0, 0.0,
        -sin, 0.0, cos, 0.0,
        0.0, 0.0, 0.0, 1.0,
    ]
}
let mat4Transform = (v, m) => {
    assert(() => v.length === 4)
    assert(() => m.length === 16)

    return [
        (m[0 + 0] * v[0]) + (m[1 + 0] * v[1]) + (m[2 + 0] * v[2]) + (m[3 + 0] * v[3]),
        (m[0 + 4] * v[0]) + (m[1 + 4] * v[1]) + (m[2 + 4] * v[2]) + (m[3 + 4] * v[3]),
        (m[0 + 8] * v[0]) + (m[1 + 8] * v[1]) + (m[2 + 8] * v[2]) + (m[3 + 8] * v[3]),
        (m[0 +12] * v[0]) + (m[1 +12] * v[1]) + (m[2 +12] * v[2]) + (m[3 +12] * v[3]),
    ]
}
let mat4Perspective = (near, far, fovY, aspect_ratio) => {
    let top = near * Math.tan(fovY / 2.0);
    let right = top * aspect_ratio;

    return [
        near / right, 0,          0,                            0,
        0,            near / top, 0,                            0,
        0,            0,          -(far + near) / (far - near), -2.0 * far * near / (far - near),
        0,            0,          -1.0,                         0,
    ]
}
let mat4Translate = (vec) => {
    assert(() => !vec[3])
    return [
        1,  0,  0,  vec[0],
        0,  1,  0,  vec[1],
        0,  0,  1,  vec[2],
        0,  0,  0,  1,
    ];
}
let assertNotNaN = (value) => {
    if (!self.production) {
        if (Array.isArray(value)) value.forEach(assertNotNaN)
        else assert(() => typeof value === 'number' && !isNaN(value))
    }
}
let assert = self.production
    ? () => {}
    : (cond, message = 'assertion error') => {
        if (!cond()) {
            throw new Error(message + ' ' + cond)
        }
    }