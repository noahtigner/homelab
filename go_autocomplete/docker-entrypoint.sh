#!/bin/sh

set -eu

if [ ! -s /app/data/movies.jsonl ]; then
    mkdir -p /app/data
    echo "IMDb dataset is missing; downloading and generating it now."
    /app/go-autocomplete-etl
fi

exec /app/go-autocomplete
