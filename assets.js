
// Assets are built in inkscape, by copying base.svg
// They exist in 0..100 space, so no decimal numbers required to reproduce correctly
/* vim command to remove decimal part:
%s/\([0-9]\)\.[0-9]\+/\1/g
*/

let svgProjector = s => {
    let commandsWithProjectCalls = '`' + s.replace(/(\d+),(\d+)/g, (_, $1, $2) => {
        return `$\{P([${(+$1/100) - 0.5} + V[0], ${(+$2/100) - 0.5} + V[1], V[2]])}`
    }) + '`'
    // Create a function with
    // - P (projector) argument
    // Into a pathmaker function with
    // - V (vector position) argument
    // Then immediately call it
    return globalEval(
        `P=>(V=[0,0,0])=>new Path2D(${commandsWithProjectCalls})`
    )(cameraProject2d)
}
let assetCloud = `M 91,51 C 93,64 91,76 80,81 73,92 62,96 50,93 37,94 25,90 20,81 10,74 7,62 9,51 8,40 9,32 19,23 27,10 39,7 50,9 64,8 72,12 80,21 89,28 92,39 91,51 Z`
let prepareAssets = () => {
    assetCloud = svgProjector(assetCloud)
}
