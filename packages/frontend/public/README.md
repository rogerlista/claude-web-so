# PWA Assets

This directory contains assets required for the Progressive Web App (PWA) functionality.

## Required Files

To complete the PWA setup, you need to generate the following icon files:

### Icons

- **favicon.ico** - Browser favicon (multiple sizes: 16x16, 32x32, 48x48)
- **apple-touch-icon.png** - Apple iOS home screen icon (180x180)
- **pwa-192x192.png** - Android home screen icon (192x192)
- **pwa-512x512.png** - Android splash screen icon (512x512)

## How to Generate Icons

### Option 1: Using RealFaviconGenerator (Recommended)

1. Visit https://realfavicongenerator.net/
2. Upload your logo/icon (preferably SVG or high-resolution PNG, minimum 512x512)
3. Customize the appearance for different platforms
4. Download the generated package
5. Extract the files to this `public/` directory

### Option 2: Using favicon.io

1. Visit https://favicon.io/
2. Choose one of the options:
   - **PNG to ICO**: Upload a 512x512 PNG image
   - **Text to ICO**: Generate from text
   - **Emoji to ICO**: Use an emoji as icon
3. Download the generated files
4. Extract to this `public/` directory

### Option 3: Manual Creation with ImageMagick

If you have ImageMagick installed, you can generate icons from a source image:

```bash
# From a 512x512 source image (logo.png)
# Generate apple-touch-icon
convert logo.png -resize 180x180 apple-touch-icon.png

# Generate PWA icons
convert logo.png -resize 192x192 pwa-192x192.png
convert logo.png -resize 512x512 pwa-512x512.png

# Generate favicon (multiple sizes)
convert logo.png -resize 16x16 favicon-16.png
convert logo.png -resize 32x32 favicon-32.png
convert logo.png -resize 48x48 favicon-48.png
convert favicon-16.png favicon-32.png favicon-48.png favicon.ico
```

### Option 4: Using Figma/Sketch/Design Tools

1. Create or import your logo in your design tool
2. Export at the following sizes:
   - 180x180 → `apple-touch-icon.png`
   - 192x192 → `pwa-192x192.png`
   - 512x512 → `pwa-512x512.png`
3. Use an online ICO converter for `favicon.ico`

## Icon Design Guidelines

### General
- Use simple, recognizable designs
- Ensure good contrast
- Test at small sizes (16x16)
- Use square aspect ratio
- PNG format with transparency (except favicon.ico)

### Colors
- Use brand colors
- Ensure visibility on both light and dark backgrounds
- Consider adding a subtle shadow or border for depth

### Best Practices
- **Simplicity**: Icon should be recognizable at small sizes
- **Consistency**: Use the same base design across all sizes
- **Padding**: Leave ~10% padding around the main icon
- **Testing**: Test icons on different devices and backgrounds

## Temporary Placeholder

A temporary SVG icon (`icon-placeholder.svg`) has been created for development purposes. Replace it with your actual brand icons before production deployment.

## Verification

After generating all icons, verify the PWA setup:

1. Build the app: `npm run build`
2. Serve the production build
3. Open Chrome DevTools
4. Go to the "Application" tab
5. Check "Manifest" section for icon display
6. Use Lighthouse to audit PWA score

## Expected Directory Structure

```
public/
├── README.md (this file)
├── robots.txt
├── favicon.ico
├── apple-touch-icon.png
├── pwa-192x192.png
├── pwa-512x512.png
└── icon-placeholder.svg (temporary)
```

## Resources

- [PWA Icons Guidelines](https://web.dev/add-manifest/)
- [Favicon Generator](https://realfavicongenerator.net/)
- [PWA Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [Google PWA Checklist](https://web.dev/pwa-checklist/)
