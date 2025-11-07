# WP SVG Viewer

A WordPress plugin that provides an interactive SVG viewer with zoom, pan, and centering controls.

## Installation

1. **Unzip the plugin archive:**
   - Download the `wp-svg-viewer.zip` file.
   - Unzip it locally; you will get a folder named `wp-svg-viewer`.

2. **Install the plugin files:**
   - Upload or move the entire `wp-svg-viewer` folder into your WordPress installation at `/wp-content/plugins/`.

3. **Activate the plugin:**
   - Go to WordPress Admin → Plugins
   - Find "SVG Viewer" and click "Activate"

## Usage

### Basic Usage

Add this shortcode to any page or post:

```text
[svg_viewer src="/path/to/your/file.svg"]
```

### Advanced Usage

You can customize the viewer with additional parameters:

```text
[svg_viewer src="/path/to/file.svg" height="800px" class="custom-class" zoom="150" max_zoom="1200" zoom_step="25" center_x="2750" center_y="35500" show_coords="true"]
```

### Parameters

- **src** (required): Path to your SVG file
  - Absolute URL: `https://example.com/files/chart.svg`
  - Absolute path: `/uploads/2024/chart.svg`
  - Relative to uploads: `2024/chart.svg`

- **height** (optional): Height of the viewer container
  - Default: `600px`
  - Examples: `height="800px"`, `height="100vh"`

- **class** (optional): Additional CSS class for custom styling
  - Example: `class="my-custom-class"`

- **zoom** (optional): Initial zoom level (percentage)
  - Default: `100`
  - Example: `zoom="200"` starts the viewer at 200%

- **min_zoom** (optional): Minimum allowed zoom level (percentage)
  - Default: `25`
  - Example: `min_zoom="10"`

- **max_zoom** (optional): Maximum allowed zoom level (percentage)
  - Default: `800`
  - Example: `max_zoom="1600"`

- **zoom_step** (optional): Increment used when zooming (percentage)
  - Default: `10`
  - Example: `zoom_step="25"`

- **center_x** / **center_y** (optional): Override the point treated as the viewer's "center"
  - Units: SVG user units (usually pixels as defined by the SVG viewBox)
  - Example: `center_x="2750" center_y="35500"`
  - When omitted, the plugin uses the geometric center of the SVG's viewBox

- **show_coords** (optional): Display a helper button that copies the current viewport center coordinates
  - Default: `false`
  - Example: `show_coords="true"`

### Examples

#### Example 1: Basic SVG in uploads folder

```text
[svg_viewer src="2024/system-settings.svg"]
```

#### Example 2: Custom height

```text
[svg_viewer src="/wp-content/uploads/diagrams/chart.svg" height="1000px"]
```

#### Example 3: Full viewport height

```text
[svg_viewer src="my-diagram.svg" height="100vh"]
```

#### Example 4: Deep zoom and custom start

```text
[svg_viewer src="blueprint.svg" height="700px" zoom="250" max_zoom="2000" zoom_step="5"]
```

#### Example 5: Manual center with coordinate helper

```text
[svg_viewer src="mind-map.svg" height="750px" zoom="150" max_zoom="1600" center_x="2750" center_y="35500" show_coords="true"]
```

This loads the SVG zoomed to 150%, centers on the specified node, and adds a "Copy Center" button.

## Features

### Zoom Controls

- Zoom In/Out buttons
- Reset Zoom button
- Keyboard shortcuts (Ctrl/Cmd + Plus/Minus/0)
- Mouse wheel zooming (Ctrl/Cmd + scroll)

### Pan Controls

- Scrollable container
- Click and drag to pan (when zoomed)

### Center View

- "Center View" button recenters the SVG without altering the zoom
- Automatically recenters on initial load
- Optional "Copy Center" helper can expose live focus coordinates for authoring presets

### Display

- Shows current zoom percentage (reflects initial zoom setting)
- Responsive design
- Mobile-friendly controls

## Keyboard Shortcuts

- **Ctrl/Cmd + Plus (+)** - Zoom in
- **Ctrl/Cmd + Minus (-)** - Zoom out
- **Ctrl/Cmd + 0** - Reset zoom and center view
- **Mouse Wheel** - Scroll with Ctrl/Cmd held to zoom

## SVG File Preparation

For best results with your SVG:

1. **Remove fixed dimensions** (optional, plugin handles this)
2. **Ensure viewBox is accurate** - The viewBox determines the aspect ratio and scaling
3. **Test in browser** - Check that the SVG displays correctly before adding to WordPress

## Troubleshooting

### SVG Not Loading

1. **Check file path** - Ensure the path is correct and the file exists
2. **CORS issues** - If loading from another domain, ensure CORS headers are set
3. **Browser console** - Check browser console (F12) for error messages

### Zoom Not Working

1. Ensure JavaScript is enabled
2. Check that no other scripts are conflicting
3. Try a different browser

### Plugin Not Appearing in Admin

1. Ensure all files are in the correct directory structure
2. Check that `svg-viewer-plugin.php` is in the plugin root folder
3. Clear WordPress cache if using a cache plugin

## CSS Customization

You can override default styles by adding CSS to your theme's `style.css`:

```css
/* Customize button colors */
.svg-viewer-btn {
    background-color: #your-color;
}

/* Customize container */
.svg-viewer-wrapper {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Customize controls bar */
.svg-controls {
    background-color: #your-color;
}
```

## Support for Multiple Viewers

You can add multiple SVG viewers on the same page:

```text
[svg_viewer src="file1.svg" height="600px"]

Some text here...

[svg_viewer src="file2.svg" height="600px"]
```

Each viewer works independently with its own zoom and pan state.

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE11: ⚠️ Limited support (no fetch API)

## License

GPL2 - Same as WordPress

## Credits

Created for WordPress SVG embedding and interactive viewing.

## Coordinate Helper

Enable the helper by passing `show_coords="true"` to the shortcode. The control bar will display a 📍 **Copy Center** button and a temporary readout.

1. Pan/zoom until the portion of the SVG you want centered is in view.
2. Click **Copy Center**. The plugin copies the current viewport center as `x, y` (in SVG units) to your clipboard and shows the values for a few seconds.
3. Use those numbers in the shortcode: `center_x="…" center_y="…"`.

If clipboard access is blocked, a browser prompt appears so you can copy the values manually.
You can also grab them from the console with `window.svgViewerInstances['your-viewer-id'].getVisibleCenterPoint()` and copy the returned `x` and `y` values into the shortcode attributes to lock the viewer on that focus point.
When you are satisfied with the result, update the shortcode attributes and remove `show_coords="true"` from published content.
