#!/bin/bash

FILES="math.js assets.js game.js engine.js story.js"
OUT_FILE="build/index.html"
mkdir -p build

COMPRESSOR=cat
COMPRESSOR_OPTS=
if which terser >/dev/null 2>&1; then
    echo 'terser is available'
    COMPRESSOR="terser"
    COMPRESSOR_OPTS="-mc passes=99 --module --define self.production=1"
fi


cat index-just-head.html > $OUT_FILE
echo "<script>'use strict';" >> $OUT_FILE
eval "$COMPRESSOR $FILES $COMPRESSOR_OPTS" >> $OUT_FILE
echo "</script>" >> $OUT_FILE
echo "<script>main()</script>" >> $OUT_FILE

echo 'file size: '
wc -c $OUT_FILE
