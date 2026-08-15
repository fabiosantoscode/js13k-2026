#!/bin/bash

FILES="math.js assets.js engine.js"
OUT_FILE="build/index.html"

COMPRESSOR=cat
COMPRESSOR_OPTS=
if which terser >/dev/null 2>&1; then
    echo 'terser is available'
    COMPRESSOR="terser"
    COMPRESSOR_OPTS="-mc --module --define self.production=0"
fi


cat index-just-head.html > $OUT_FILE
echo "<script>'use strict';" >> $OUT_FILE
eval "$COMPRESSOR $FILES $COMPRESSOR_OPTS" >> $OUT_FILE
echo "</script>" >> $OUT_FILE
