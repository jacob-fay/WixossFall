#!/bin/bash
# Start the Python Flask backend in the background, then the React dev server.
# The Flask server is killed automatically when the React dev server exits.

cd "$(dirname "$0")"
python server.py &
FLASK_PID=$!

cd front-end
npm start
EXIT_CODE=$?

kill "$FLASK_PID" 2>/dev/null
exit $EXIT_CODE
