#!/bin/sh
set -ex

# Figure out where we are
SCRIPTS=$(dirname "$(readlink -f "$0")")
PROJECT=$(dirname $SCRIPTS)

# Get the extension name
EXT_ID=$(grep -E '[[:space:]]*"uuid":[[:space:]]*' ${PROJECT}/metadata.json | grep -Eo '[^[:space:]"]+@[^[:space:]"]+')

# Figure out where we need to install
BASE_DIR=$XDG_DATA_HOME

if [ -z "$XDG_DATA_HOME"]; then
    BASE_DIR=$HOME
fi

EXTENSIONS_DIR="${BASE_DIR}/gnome-shell/extensions"
INSTALL_DIR="${EXTENSIONS_DIR}/${EXT_ID}"

# Build the project
${SCRIPTS}/build.sh
wait

# Install the Extension
mkdir -p ${INSTALL_DIR}
cp -r ${PROJECT}/dist/* ${INSTALL_DIR}/
