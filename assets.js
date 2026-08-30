
// Assets are built in inkscape, by copying base.svg
// They exist in 0..100 space, so no decimal numbers required to reproduce correctly
/* vim command to remove decimal part:
%s/\([0-9]\)\.[0-9]\+/\1/g
JS code to turn lowercase commands to uppercase `M` commands
((string) => {
  let isAbsolute = true
  let position = [0,0]
  return string.replace(/(\S+)/gi, (_, $1) =>
		/[A-Z]/.test($1) ? (isAbsolute = true, $1)
  	: /[a-z]/.test($1) ? (isAbsolute = false, $1.toUpperCase())
		: (isAbsolute ? position = eval('[' + $1 + ']') : position = [position[0] + eval('[' + $1 + '][0]'), position[1] + eval('[' + $1 + '][1]')])
	)
})('m 46,44 3,-2 2,2 Z m 5,-15 3,-4 -0,7 Z m -6,-4 3,4 -3,3 Z')
*/

/** Macro-ish function we could run at compile time if we really wanted.
 * Turns SVG shapes into JS code that projects them by a transform */
let svgProjector = (svgShape) => {
    // turn SVG shape into JS code.
    // Later inserted into a template string `` so we can use ${}
    let jsShape = 'new Path2D(`' + svgShape
        .replace(/(-?\d+),(-?\d+)/g, (_, $1, $2) => {
            // Input: a vector in some SVG command (hopefully absolute)
            // Output: code that projects this vector by calling P
            let args = [(+$1/100) - 0.5,(+$2/100) - 0.5,FOV]
            return `$\{P(t,${args})}`
        }) + '`)'

    let shapeProjector =
        // Create a function with
        // - P (tformProjectAssetVec) argument
        // Into a pathmaker function with
        // - t (asset tform) argument
        globalEval(
            'P=>t=>' + jsShape
            // Provide our eval-ed function with `tformProjectAssetVec`
            // Because the minifier will rename `tformProjectAssetVec`
        )(tformProjectAssetVec)

    // A flat projector that doesn't transform, only moves and scales
    // This is because I can't work out some of the matrix math and gave up
    shapeProjector.flat =
        globalEval(
            'P=>t=>' + jsShape
        )(tformProjectAssetFlatVec)

    return shapeProjector
}
let assetCloud = `M 91,51 C 93,64 91,76 80,81 73,92 62,96 50,93 37,94 25,90 20,81 10,74 7,62 9,51 8,40 9,32 19,23 27,10 39,7 50,9 64,8 72,12 80,21 89,28 92,39 91,51 Z`
let assetSquare = `M 0,0 100,0 100,100 0,100 Z`
let assetUnicornBody = `M 50,27 60,31 66,51 59,71 63,86 60,93 53,87 53,74 53,64 46,65 51,88 46,95 41,86 43,72 34,58 35,37 Z`
let assetUnicornHead = `M 26,12 49,27 70,11 50,64 Z`
let assetUnicornHorn = `M 45,35 50,0 55,35 50,40 Z`
let assetUnicornEyesMouth = `M 35,40 40,35 45,40 40,45 Z M 55,40 60,35 65,40 60,45 Z`
let assetExplosion = `M 19,10 45,28 54,11 58,31 83,23 80,44 89,60 63,70 63,91 46,75 21,87 33,59 8,49 33,39 Z`
let assetExplosion2 = `M 19,19 45,28 54,10 60,34 83,24 78,45 93,72 68,63 65,90 46,73 21,85 33,60 11,49 32,40 Z`
let assetExplosion3 = `M 17,13 44,25 60,7 63,29 92,23 80,46 95,68 70,70 61,93 44,76 16,86 28,60 6,47 30,39 Z`
let assetCompositeUnicorn = unicornTform => {
    ctx.fillStyle = '#f06'
    ctx.fill(assetUnicornBody(unicornTform))
    ctx.fillStyle = '#f0a'
    ctx.fill(assetUnicornHead(unicornTform))
    ctx.fillStyle = '#fff'
    ctx.fill(assetUnicornHorn(unicornTform))
    ctx.fillStyle = '#ff0'
    ctx.fill(assetUnicornEyesMouth(unicornTform))
}
let assetCompositeUnicornFlat = unicornTform => {
    ctx.fillStyle = '#f06'
    ctx.fill(assetUnicornBody.flat(unicornTform))
    ctx.fillStyle = '#f0a'
    ctx.fill(assetUnicornHead.flat(unicornTform))
    ctx.fillStyle = '#fff'
    ctx.fill(assetUnicornHorn.flat(unicornTform))
    ctx.fillStyle = '#ff0'
    ctx.fill(assetUnicornEyesMouth.flat(unicornTform))
}
let prepareAssets = () => {
    assetCloud = svgProjector(assetCloud)
    assetSquare = svgProjector(assetSquare)
    assetUnicornBody = svgProjector(assetUnicornBody)
    assetUnicornHead = svgProjector(assetUnicornHead)
    assetUnicornHorn = svgProjector(assetUnicornHorn)
    assetUnicornEyesMouth = svgProjector(assetUnicornEyesMouth)
    assetExplosion = svgProjector(assetExplosion)
    assetExplosion2 = svgProjector(assetExplosion2)
    assetExplosion3 = svgProjector(assetExplosion3)
}

/* Check if, when rendered, this SVG would go behind or in front of the camera
 * In future, we might do frustum culling here too.
 * Or even do proper culling
 * assets are 1 unit in diameter, scaled by transform here */
let assetCull = (transform) => {
    return cameraDistance(transform[0]) > tformGetScale(transform)
}
