#!/usr/bin/env sh

set -e

npx esbuild \
  --bundle \
  --format=esm \
  --platform=browser \
  --outdir=dist \
  --loader:.ttf=file \
    library/module.ts library/demo.ts

npx tsc
