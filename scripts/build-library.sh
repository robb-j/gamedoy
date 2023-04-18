#!/usr/bin/env sh

set -e

npx esbuild \
  --bundle \
  --format=esm \
  --platform=browser \
  --outdir=dist \
    library/mod.ts library/simple.css library/docs.css library/demo.ts \
  --loader:.ttf=base64 \
  --loader:.woff2=base64 \

npx tsc
