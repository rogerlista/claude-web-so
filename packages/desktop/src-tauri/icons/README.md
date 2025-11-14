# Application Icons

This directory should contain the application icons in various formats and sizes.

## Required Icons

- `32x32.png` - 32x32 pixels PNG
- `128x128.png` - 128x128 pixels PNG
- `128x128@2x.png` - 256x256 pixels PNG (for retina displays)
- `icon.icns` - macOS icon file
- `icon.ico` - Windows icon file

## Generating Icons

You can use the following tools to generate icons from a source image:

1. **Tauri Icon CLI** (Recommended):
   ```bash
   npm install -g @tauri-apps/cli
   tauri icon path/to/source-icon.png
   ```

2. **ImageMagick**:
   ```bash
   convert source.png -resize 32x32 32x32.png
   convert source.png -resize 128x128 128x128.png
   convert source.png -resize 256x256 128x128@2x.png
   ```

3. **Online Tools**:
   - https://www.icoconverter.com/ (for .ico)
   - https://iconverticons.com/online/ (for .icns)

## Source Image Requirements

- Format: PNG
- Minimum size: 512x512 pixels (1024x1024 recommended)
- Background: Transparent or solid color
- Aspect ratio: 1:1 (square)

## Placeholder Icons

Until proper icons are created, Tauri will use default placeholder icons during development.
