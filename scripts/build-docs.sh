#!/usr/bin/env sh

set -e

ARGS=""

if [ "$NOVA_TASK_NAME" == "run" ]
then
  ARGS="$ARGS --serve"
fi

npx eleventy --config=.eleventy.cjs $ARGS
