#!/usr/bin/env bash
# This is the old script-based method for launching Chrome headless.

trap 'kill $(jobs -p)' EXIT
logfile=`pwd`/bugout.log
cd bugout-service
python -m SimpleHTTPServer > "$logfile" 2>&1 &
chrome=`command -v chromium || command -v chromium-browser || command -v google-chrome || command -v "/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome" || command -v "/Applications/Chromium.app/Contents/MacOS/Chromium"`
"$chrome" --headless --disable-gpu --crash-dumps-dir=./crash-dumps --user-data-dir=./chromium-bugout --disable-web-security --enable-logging=stderr --remote-debugging-port=9222 http://localhost:8000/ > "$logfile" 2>&1

