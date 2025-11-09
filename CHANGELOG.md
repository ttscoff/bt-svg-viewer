### 1.1.0

2025-11-09 14:10

#### NEW

- Pan and zoom interaction modes configurable via shortcode/preset, with automatic gesture captions.
- Smooth, cursor-focused zoom animations for wheel, slider, and modifier-click gestures.
- Defaults tab option to enable asset cache busting for debugging (auto-enabled on `dev.*` / `wptest.*` domains).

#### IMPROVED

- Drag panning now tracks 1:1 with the pointer and ignores stray wheel input.
- Zooming keeps the focus point locked under the cursor while preventing unintended panning.

### 1.0.6

2025-11-08 10:35

#### FIXED

- CSS caching not keeping up with versions

### 1.0.5

2025-11-08 10:13

#### FIXED

- Bad permissions in zip distro

### 1.0.4

2025-11-08 08:54

#### FIXED

- Fixing deploy process

### 1.0.3

2025-11-08 08:47

### FIXED

- Changelog duplication

### 1.0.2

2025-11-08 08:39

#### NEW

- DE, ES, FR, IT localizations
- Help and Changelog tabs in admin panel

#### IMPROVED

- Major README overhaul

### 1.0.1

2025-11-08 06:40

#### NEW

- Admin panel where you can create custom SVG posts with all configuration options stored
- Buttons can be configured to left, right, top, bottom
- Buttons can be configured to icon, text, or both
- Buttons can be configured with custom settings to display only certain buttons, define left/right alignment, and more
- Preview in admin panel shows how buttons will appear
- Preview in admin panel can be panned/zoomed and then its current state can be saved as the initial state for the front-end display

## wp-svg-viewer 1.0.0

2025-11-07 08:00

#### NEW

- Initial release
- Shortcode for creating an SVG viewer with zoom and pan
