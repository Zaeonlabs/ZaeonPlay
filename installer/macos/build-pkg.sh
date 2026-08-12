#!/usr/bin/env bash
# StreamPlugins -- macOS .pkg builder
#
# Usage:
#   ./installer/macos/build-pkg.sh --variant=obs-plugin --version=0.1.0
#   ./installer/macos/build-pkg.sh --variant=tray-app --version=0.1.0
#
# Prerequisites:
#   - Built artifacts in dist/obs-plugin-macos or dist/tray-app-macos
#   - pkgbuild and productbuild (Xcode Command Line Tools)

set -euo pipefail

VARIANT="obs-plugin"
VERSION="0.1.0"
ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
DIST_DIR="${ROOT_DIR}/dist"
OUTPUT_DIR="${DIST_DIR}/installers"
IDENTIFIER_BASE="dev.streamplugins"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --variant=*)
      VARIANT="${1#*=}"
      shift
      ;;
    --version=*)
      VERSION="${1#*=}"
      shift
      ;;
    --help|-h)
      echo "Usage: $0 --variant=obs-plugin|tray-app [--version=X.Y.Z]"
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

if [[ "${VARIANT}" != "obs-plugin" && "${VARIANT}" != "tray-app" ]]; then
  echo "Error: --variant must be 'obs-plugin' or 'tray-app'" >&2
  exit 1
fi

mkdir -p "${OUTPUT_DIR}"
STAGE_DIR="$(mktemp -d)"
PAYLOAD_DIR="${STAGE_DIR}/payload"
SCRIPTS_DIR="${STAGE_DIR}/scripts"
COMPONENT_PKG="${STAGE_DIR}/component.pkg"

cleanup() {
  rm -rf "${STAGE_DIR}"
}
trap cleanup EXIT

mkdir -p "${PAYLOAD_DIR}" "${SCRIPTS_DIR}"

if [[ "${VARIANT}" == "obs-plugin" ]]; then
  SOURCE_DIR="${DIST_DIR}/obs-plugin-macos/streamplugins.plugin"
  if [[ ! -d "${SOURCE_DIR}" ]]; then
    echo "Error: missing source at ${SOURCE_DIR}" >&2
    echo "Build the native OBS plugin and stage it under dist/obs-plugin-macos/ first." >&2
    exit 1
  fi

  PLUGIN_DEST="${PAYLOAD_DIR}/Library/Application Support/obs-studio/plugins/streamplugins.plugin"
  mkdir -p "$(dirname "${PLUGIN_DEST}")"
  cp -R "${SOURCE_DIR}" "${PLUGIN_DEST}"

  # postinstall reminder
  cat > "${SCRIPTS_DIR}/postinstall" <<'EOF'
#!/bin/bash
echo "StreamPlugins OBS plugin installed."
echo "Fully quit and restart OBS Studio, then open Docks > StreamPlugins: Settings."
exit 0
EOF
  chmod 755 "${SCRIPTS_DIR}/postinstall"

  IDENTIFIER="${IDENTIFIER_BASE}.obs-plugin"
  INSTALL_LOCATION="/"
  OUTPUT_NAME="streamplugins-${VERSION}-obs-plugin-macos-universal.pkg"
else
  SOURCE_DIR="${DIST_DIR}/tray-app-macos/StreamPlugins.app"
  if [[ ! -d "${SOURCE_DIR}" ]]; then
    echo "Error: missing source at ${SOURCE_DIR}" >&2
    echo "Build the tray app and stage it under dist/tray-app-macos/ first." >&2
    exit 1
  fi

  APP_DEST="${PAYLOAD_DIR}/Applications/StreamPlugins.app"
  mkdir -p "${PAYLOAD_DIR}/Applications"
  cp -R "${SOURCE_DIR}" "${APP_DEST}"

  # Optional LaunchAgent for auto-start
  LAUNCH_AGENTS_DIR="${PAYLOAD_DIR}/Library/LaunchAgents"
  mkdir -p "${LAUNCH_AGENTS_DIR}"
  cat > "${LAUNCH_AGENTS_DIR}/${IDENTIFIER_BASE}.tray.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${IDENTIFIER_BASE}.tray</string>
  <key>ProgramArguments</key>
  <array>
    <string>/Applications/StreamPlugins.app/Contents/MacOS/StreamPlugins</string>
  </array>
  <key>RunAtLoad</key>
  <false/>
  <key>KeepAlive</key>
  <false/>
</dict>
</plist>
EOF

  cat > "${SCRIPTS_DIR}/postinstall" <<'EOF'
#!/bin/bash
echo "StreamPlugins tray app installed to /Applications/StreamPlugins.app"
echo "Launch it, then add Browser Docks in OBS pointing to http://localhost:3847/plugins/..."
exit 0
EOF
  chmod 755 "${SCRIPTS_DIR}/postinstall"

  IDENTIFIER="${IDENTIFIER_BASE}.tray-app"
  INSTALL_LOCATION="/"
  OUTPUT_NAME="streamplugins-${VERSION}-tray-app-macos-universal.pkg"
fi

echo "[macOS pkg] Building component package (${VARIANT})..."
pkgbuild \
  --root "${PAYLOAD_DIR}" \
  --scripts "${SCRIPTS_DIR}" \
  --identifier "${IDENTIFIER}" \
  --version "${VERSION}" \
  --install-location "${INSTALL_LOCATION}" \
  "${COMPONENT_PKG}"

# Distribution XML for productbuild
DIST_XML="${STAGE_DIR}/distribution.xml"
cat > "${DIST_XML}" <<EOF
<?xml version="1.0" encoding="utf-8"?>
<installer-gui-script minSpecVersion="2">
  <title>StreamPlugins ${VERSION}</title>
  <organization>${IDENTIFIER_BASE}</organization>
  <domains enable_localSystem="true"/>
  <options customize="never" require-scripts="false" rootVolumeOnly="true"/>
  <welcome file="welcome.html" mime-type="text/html"/>
  <pkg-ref id="${IDENTIFIER}"/>
  <choices-outline>
    <line choice="default">
      <line choice="${IDENTIFIER}"/>
    </line>
  </choices-outline>
  <choice id="default"/>
  <choice id="${IDENTIFIER}" visible="false">
    <pkg-ref id="${IDENTIFIER}"/>
  </choice>
  <pkg-ref id="${IDENTIFIER}" version="${VERSION}" onConclusion="none">${COMPONENT_PKG##*/}</pkg-ref>
</installer-gui-script>
EOF

# Simple welcome HTML
RESOURCES_DIR="${STAGE_DIR}/resources"
mkdir -p "${RESOURCES_DIR}"
if [[ "${VARIANT}" == "obs-plugin" ]]; then
  cat > "${RESOURCES_DIR}/welcome.html" <<EOF
<html><body>
<h2>StreamPlugins OBS Plugin</h2>
<p>Installs into your OBS Studio plugins folder.</p>
<p>After installing, fully quit and restart OBS. Open <b>Docks &gt; StreamPlugins: Settings</b> to connect accounts.</p>
</body></html>
EOF
else
  cat > "${RESOURCES_DIR}/welcome.html" <<EOF
<html><body>
<h2>StreamPlugins Tray App</h2>
<p>Installs StreamPlugins.app to Applications.</p>
<p>Launch the app, then add OBS Browser Docks pointing to <code>http://localhost:3847/plugins/...</code></p>
</body></html>
EOF
fi

echo "[macOS pkg] Building product archive..."
# Copy component into stage so productbuild can find it by relative name
cp "${COMPONENT_PKG}" "${STAGE_DIR}/${COMPONENT_PKG##*/}"

productbuild \
  --distribution "${DIST_XML}" \
  --resources "${RESOURCES_DIR}" \
  --package-path "${STAGE_DIR}" \
  "${OUTPUT_DIR}/${OUTPUT_NAME}"

echo "[macOS pkg] Created ${OUTPUT_DIR}/${OUTPUT_NAME}"
