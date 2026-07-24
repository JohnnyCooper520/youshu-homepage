#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RELEASE_DIR="${ROOT_DIR}/.release"
ARCHIVE_PATH="${ROOT_DIR}/youshu-release.tar.gz"

cd "${ROOT_DIR}"
npm ci
npm test -- --run
npm run build

rm -rf "${RELEASE_DIR}" "${ARCHIVE_PATH}"
mkdir -p "${RELEASE_DIR}"

cp -R api deploy dist server src package.json package-lock.json "${RELEASE_DIR}/"

tar -czf "${ARCHIVE_PATH}" -C "${RELEASE_DIR}" .
rm -rf "${RELEASE_DIR}"

echo "Release package created: ${ARCHIVE_PATH}"
