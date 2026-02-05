#!/bin/bash

# Script to package extension files for Firefox Add-ons Store upload
# Creates a zip file with only the required files

set -e

ZIP_NAME="github-pr-link-copier-firefox.zip"
TEMP_DIR=$(mktemp -d)

echo "Packaging extension for Firefox Add-ons Store..."

# Copy required files
cp manifest.json "$TEMP_DIR/"
cp content.js "$TEMP_DIR/"

# Copy icons directory
mkdir -p "$TEMP_DIR/icons"
cp icons/*.png "$TEMP_DIR/icons/"

# Copy LICENSE if it exists
if [ -f LICENSE ]; then
  cp LICENSE "$TEMP_DIR/"
fi

# Create zip file
cd "$TEMP_DIR"
zip -r "$OLDPWD/$ZIP_NAME" . > /dev/null
cd "$OLDPWD"

# Cleanup
rm -rf "$TEMP_DIR"

echo "✓ Package created: $ZIP_NAME"
echo ""
echo "Files included:"
echo "  - manifest.json"
echo "  - content.js"
echo "  - icons/ (icon16.png, icon48.png, icon128.png)"
if [ -f LICENSE ]; then
  echo "  - LICENSE"
fi
echo ""
echo "Ready for Firefox Add-ons Store upload!"
