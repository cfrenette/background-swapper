#!/bin/sh
set -ex

# Figure out where we are
SCRIPTS=$(dirname "$(readlink -f "$0")")
PROJECT=$(dirname $SCRIPTS)

# Clean up any previous builds
rm -rf ${PROJECT}/dist

# Compile Schemas and prepare dist folder
glib-compile-schemas ${PROJECT}/schemas &
mkdir -p ${PROJECT}/dist

# Transpile (with local node ts compiler if available, global otherwise)
npx tsc >/dev/null 2>&1 || (cd ${PROJECT} && tsc)
wait

# Copy all necessary files to the dist folder to prepare for install
cp -r ${PROJECT}/metadata.json ${PROJECT}/schemas ${PROJECT}/templates ${PROJECT}/dist &

# Replace Module Imports with GJS-Compatible Imports -- Credit to Michael Murphy (https://github.com/mmstick) for this script
transpile() {
    cat "${src}" | sed -e 's#export function#function#g' \
        -e 's#export var#var#g' \
        -e 's#export const#var#g' \
        -e 's#Object.defineProperty(exports, "__esModule", { value: true });#var exports = {};#g' \
        | sed -E 's/export class (\w+)/var \1 = class \1/g' \
        | sed -E "s/import \* as (\w+) from ['\"](\w+)['\"]/const \1 = Me.imports.\2/g" > "${dest}"
}
for src in $(find ${PROJECT}/_build -name '*.js'); do
    dest=$(echo "$src" | sed s#_build#dist#g)
    transpile
done

wait