#!/bin/bash

HTML_FILE="index-production.html"
FILES="prelude.js math.js assets.js engine.js game.js story.js unicorn.js mut-check.js"
OUT_FILE="build/index.html"
rm -rf build
mkdir -p build

COMPRESSOR=cat
COMPRESSOR_OPTS=
if which terser >/dev/null 2>&1; then
    echo 'terser is available'
    COMPRESSOR="terser"
    COMPRESSOR_OPTS="--mangle --compress passes=99,inline=1,keep_fargs=false,builtins_ecma=2020,builtins_pure,hoist_vars=true --module --define self.production=1"
fi

cat "$HTML_FILE" > $OUT_FILE
echo "<script>'use strict';" >> $OUT_FILE
eval "$COMPRESSOR $FILES $COMPRESSOR_OPTS" >> $OUT_FILE
echo "</script>" >> $OUT_FILE
echo "<script>main()</script>" >> $OUT_FILE

echo 'JS file size: '
wc -c $OUT_FILE

cp -r sounds build/

(cd build/ && rm -f build.zip && zip -X -9 -r build.zip *)

echo 'zip file size: '
wc -c build/build.zip

