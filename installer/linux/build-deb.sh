#!/usr/bin/env bash
# StreamPlugins -- Debian .deb builder
#
# Usage:
#   ./installer/linux/build-deb.sh --variant=obs-plugin --version=0.1.0
#   ./installer/linux/build-deb.sh --variant=tray-app --version=0.1.0
#
# Prerequisites:
#   - Built artifacts in dist/obs-plugin-linux or dist/tray-app-linux
#   - dpkg-deb available

set -euo pipefail

VARIANT="obs-plugin"
VERSION="0.1.0"
ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
INSTALLER_DIR="${ROOT_DIR}/installer/linux"
DIST_DIR="${ROOT_DIR}/dist"
OUTPUT_DIR="${DIST_DIR}/installers"

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

if ! command -v dpkg-deb >/dev/null 2>&1; then
  echo "Error: dpkg-deb is required" >&2
  exit 1
fi

mkdir -p "${OUTPUT_DIR}"
STAGE_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "${STAGE_DIR}"
}
trap cleanup EXIT

DEBIAN_DIR="${STAGE_DIR}/DEBIAN"
mkdir -p "${DEBIAN_DIR}"

render_control() {
  local package_name="$1"
  local depends="$2"
  local description="$3"
  sed \
    -e "s/__PACKAGE_NAME__/${package_name}/g" \
    -e "s/__VERSION__/${VERSION}/g" \
    -e "s/__DEPENDS__/${depends}/g" \
    -e "s/__DESCRIPTION__/${description}/g" \
    "${INSTALLER_DIR}/control.template" > "${DEBIAN_DIR}/control"
}

if [[ "${VARIANT}" == "obs-plugin" ]]; then
  SOURCE_DIR="${DIST_DIR}/obs-plugin-linux/streamplugins"
  if [[ ! -d "${SOURCE_DIR}" ]]; then
    echo "Error: missing source at ${SOURCE_DIR}" >&2
    echo "Stage the OBS plugin under dist/obs-plugin-linux/streamplugins/ first." >&2
    exit 1
  fi

  # System OBS plugin location (apt installs of OBS)
  LIB_DIR="${STAGE_DIR}/usr/lib/x86_64-linux-gnu/obs-plugins"
  DATA_DIR="${STAGE_DIR}/usr/share/obs/obs-plugins/streamplugins"
  mkdir -p "${LIB_DIR}" "${DATA_DIR}"

  if [[ -f "${SOURCE_DIR}/bin/64bit/streamplugins.so" ]]; then
    cp "${SOURCE_DIR}/bin/64bit/streamplugins.so" "${LIB_DIR}/"
  elif [[ -f "${SOURCE_DIR}/streamplugins.so" ]]; then
    cp "${SOURCE_DIR}/streamplugins.so" "${LIB_DIR}/"
  else
    echo "Error: streamplugins.so not found under ${SOURCE_DIR}" >&2
    exit 1
  fi

  if [[ -d "${SOURCE_DIR}/data" ]]; then
    cp -R "${SOURCE_DIR}/data/." "${DATA_DIR}/"
  else
    echo "Error: missing data/ under ${SOURCE_DIR}" >&2
    exit 1
  fi

  # Also stage a user-level copy path helper for Flatpak users via README in package
  DOCS_DIR="${STAGE_DIR}/usr/share/doc/streamplugins-obs-plugin"
  mkdir -p "${DOCS_DIR}"
  cat > "${DOCS_DIR}/README.Debian" <<'EOF'
StreamPlugins OBS Plugin (Debian package)

Default install path (system OBS):
  /usr/lib/x86_64-linux-gnu/obs-plugins/streamplugins.so
  /usr/share/obs/obs-plugins/streamplugins/

Flatpak OBS users should copy the plugin into:
  ~/.var/app/com.obsproject.Studio/config/obs-studio/plugins/streamplugins/

Then fully restart OBS Studio.
EOF

  cat > "${DEBIAN_DIR}/postinst" <<'EOF'
#!/bin/bash
set -e
echo "StreamPlugins OBS plugin installed."
echo "Fully quit and restart OBS Studio."
echo "Open Docks > StreamPlugins: Settings to connect accounts."
EOF
  chmod 755 "${DEBIAN_DIR}/postinst"

  render_control \
    "streamplugins-obs-plugin" \
    "obs-studio | obs-studio-portable" \
    "StreamPlugins native OBS Studio plugin"

  OUTPUT_NAME="streamplugins-${VERSION}-obs-plugin-linux-x86_64.deb"
else
  SOURCE_DIR="${DIST_DIR}/tray-app-linux"
  if [[ ! -d "${SOURCE_DIR}" ]]; then
    echo "Error: missing source at ${SOURCE_DIR}" >&2
    echo "Stage the tray app under dist/tray-app-linux/ first." >&2
    exit 1
  fi

  BIN_DIR="${STAGE_DIR}/usr/local/bin"
  SHARE_DIR="${STAGE_DIR}/usr/local/share/streamplugins"
  DESKTOP_DIR="${STAGE_DIR}/usr/share/applications"
  SYSTEMD_DIR="${STAGE_DIR}/usr/lib/systemd/user"
  mkdir -p "${BIN_DIR}" "${SHARE_DIR}" "${DESKTOP_DIR}" "${SYSTEMD_DIR}"

  if [[ -f "${SOURCE_DIR}/streamplugins-tray" ]]; then
    cp "${SOURCE_DIR}/streamplugins-tray" "${BIN_DIR}/"
    chmod 755 "${BIN_DIR}/streamplugins-tray"
  else
    echo "Error: streamplugins-tray binary not found in ${SOURCE_DIR}" >&2
    exit 1
  fi

  if [[ -f "${SOURCE_DIR}/streamplugins-server" ]]; then
    cp "${SOURCE_DIR}/streamplugins-server" "${BIN_DIR}/"
    chmod 755 "${BIN_DIR}/streamplugins-server"
  else
    echo "Error: streamplugins-server binary not found in ${SOURCE_DIR}" >&2
    exit 1
  fi

  if [[ -d "${SOURCE_DIR}/plugins" ]]; then
    cp -R "${SOURCE_DIR}/plugins" "${SHARE_DIR}/"
  fi

  cp "${INSTALLER_DIR}/streamplugins.desktop" "${DESKTOP_DIR}/"
  # systemd user unit expects server at ~/.local/bin; also install a system copy
  # and a convenience unit that points at /usr/local/bin
  sed 's|%h/.local/bin/streamplugins-server|/usr/local/bin/streamplugins-server|' \
    "${INSTALLER_DIR}/streamplugins.service" > "${SYSTEMD_DIR}/streamplugins.service"

  cat > "${DEBIAN_DIR}/postinst" <<'EOF'
#!/bin/bash
set -e
if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database -q /usr/share/applications || true
fi
echo "StreamPlugins tray app installed."
echo "Launch 'streamplugins-tray' (or from your app menu)."
echo "Optional: systemctl --user enable --now streamplugins.service"
echo "Then add OBS Browser Docks pointing to http://localhost:3847/plugins/..."
EOF
  chmod 755 "${DEBIAN_DIR}/postinst"

  render_control \
    "streamplugins-tray" \
    "libc6" \
    "StreamPlugins standalone tray application"

  OUTPUT_NAME="streamplugins-${VERSION}-tray-app-linux-x86_64.deb"
fi

# Debian packages require root-owned files with correct permissions
chmod 755 "${DEBIAN_DIR}"
find "${STAGE_DIR}" -type d -exec chmod 755 {} \;

echo "[Linux deb] Building ${OUTPUT_NAME}..."
dpkg-deb --build --root-owner-group "${STAGE_DIR}" "${OUTPUT_DIR}/${OUTPUT_NAME}"
echo "[Linux deb] Created ${OUTPUT_DIR}/${OUTPUT_NAME}"
