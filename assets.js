
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

let svgProjector = s => {
    let commandsWithTransformAndProjectCalls = s
        .replace(/(-?\d+),(-?\d+)/g, (_, $1, $2) => {
            // asset X, Y, FOV
            let args = [(+$1/100) - 0.5,(+$2/100) - 0.5,FOV]
            return `$\{P(T,t,${args})}`
        })
    // Create a function with
    // - P (tformProjectAssetVec) argument
    // - T (cameraTransformInv) argument
    // Into a pathmaker function with
    // - t (asset tform) argument
    // Then immediately call it
    return globalEval(
        `(P,T)=>t=>new Path2D(\`${commandsWithTransformAndProjectCalls}\`)`
    )(tformProjectAssetVec,cameraTransformInv)
}
let assetCloud = `M 91,51 C 93,64 91,76 80,81 73,92 62,96 50,93 37,94 25,90 20,81 10,74 7,62 9,51 8,40 9,32 19,23 27,10 39,7 50,9 64,8 72,12 80,21 89,28 92,39 91,51 Z`
let assetSquare = `M 0,0 100,0 100,100 0,100 Z`
let assetUnicornBody = `M 50,27 60,31 66,51 59,71 63,86 60,93 53,87 53,74 53,64 46,65 51,88 46,95 41,86 43,72 34,58 35,37 Z`
let assetUnicornHead = `M 26,12 49,27 70,11 50,64 Z`
let assetUnicornHorn = `M 45,35 50,0 55,35 50,40 Z`
let assetUnicornEyesMouth = `M 35,40 40,35 45,40 40,45 Z M 55,40 60,35 65,40 60,45 Z`
let prepareAssets = () => {
    assetCloud = svgProjector(assetCloud)
    assetSquare = svgProjector(assetSquare)
    assetUnicornBody = svgProjector(assetUnicornBody)
    assetUnicornHead = svgProjector(assetUnicornHead)
    assetUnicornHorn = svgProjector(assetUnicornHorn)
    assetUnicornEyesMouth = svgProjector(assetUnicornEyesMouth)
}

/* Check if, when rendered, this SVG would go behind or in front of the camera
 * In future, we might do frustum culling here too.
 * Or even do proper culling
 * assets are 1 unit in diameter, scaled by transform here */
let assetCull = (transform) => {
    return cameraDistance(transform[0]) > tformGetScale(transform)
}
