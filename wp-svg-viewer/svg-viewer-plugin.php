<?php
/**
 * Plugin Name: WP SVG Viewer
 * Plugin URI: https://brettterpstra.com
 * Description: Embed interactive SVG files with zoom and pan controls
 * Version: 1.0.0
 * Author: Brett Terpstra
 * Author URI: https://brettterpstra.com
 * License: GPL2
 * Text Domain: svg-viewer
 * Domain Path: /languages
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class SVG_Viewer
{
    private static $instance = null;

    public static function get_instance()
    {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct()
    {
        add_shortcode('svg_viewer', array($this, 'render_shortcode'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_assets'));
        add_filter('upload_mimes', array($this, 'svg_use_mimetypes'));
    }

    /**
     * Allow SVG file uploads
     */
    public function svg_use_mimetypes($mimes)
    {
        $mimes['svg'] = 'image/svg+xml';
        return $mimes;
    }

    /**
     * Enqueue CSS and JS
     */
    public function enqueue_assets()
    {
        wp_enqueue_style(
            'svg-viewer-style',
            plugins_url('css/svg-viewer.css', __FILE__),
            array(),
            '1.0.0'
        );

        wp_enqueue_script(
            'svg-viewer-script',
            plugins_url('js/svg-viewer.js', __FILE__),
            array(),
            '1.0.0',
            true
        );

        // Pass plugin URL to JavaScript
        wp_localize_script('svg-viewer-script', 'svgViewerConfig', array(
            'pluginUrl' => plugins_url('', __FILE__),
        ));
    }

    /**
     * Render the shortcode
     *
     * Usage: [svg_viewer src="/path/to/file.svg" height="600px"]
     */
    public function render_shortcode($atts)
    {
        $atts = shortcode_atts(array(
            'src' => '',
            'height' => '600px',
            'class' => '',
            'zoom' => '100',  // percentage
            'min_zoom' => '25',   // percentage
            'max_zoom' => '800',  // percentage
            'zoom_step' => '10',   // percentage
            'center_x' => '',
            'center_y' => '',
            'show_coords' => 'false',
        ), $atts, 'svg_viewer');

        // Validate src
        if (empty($atts['src'])) {
            return '<div style="color: red; padding: 10px; border: 1px solid red;">Error: SVG source not specified. Use [svg_viewer src="path/to/file.svg"]</div>';
        }

        // Convert relative paths to absolute URLs
        $svg_url = $this->get_svg_url($atts['src']);

        if (!$svg_url) {
            return '<div style="color: red; padding: 10px; border: 1px solid red;">Error: Invalid SVG path.</div>';
        }

        // Normalize zoom settings
        $initial_zoom = max(1, floatval($atts['zoom'])) / 100;
        $min_zoom = max(1, floatval($atts['min_zoom'])) / 100;
        $max_zoom = max($initial_zoom, floatval($atts['max_zoom'])) / 100;
        $zoom_step = max(0.1, floatval($atts['zoom_step'])) / 100;

        $center_x = strlen(trim($atts['center_x'])) ? floatval($atts['center_x']) : null;
        $center_y = strlen(trim($atts['center_y'])) ? floatval($atts['center_y']) : null;
        $show_coords = filter_var($atts['show_coords'], FILTER_VALIDATE_BOOLEAN);

        // Ensure consistency
        if ($min_zoom > $max_zoom) {
            $min_zoom = $max_zoom;
        }
        $initial_zoom = max($min_zoom, min($max_zoom, $initial_zoom));

        // Generate unique ID
        $viewer_id = 'svg-viewer-' . uniqid();
        $custom_class = sanitize_html_class($atts['class']);

        ob_start();
        ?>
        <div class="svg-viewer-wrapper <?php echo $custom_class; ?>" id="<?php echo $viewer_id; ?>">
            <div class="svg-controls">
                <button class="svg-viewer-btn zoom-in-btn" data-viewer="<?php echo $viewer_id; ?>" title="Zoom In (Ctrl +)">
                    <span>🔍+</span> Zoom In
                </button>
                <button class="svg-viewer-btn zoom-out-btn" data-viewer="<?php echo $viewer_id; ?>" title="Zoom Out (Ctrl -)">
                    <span>🔍−</span> Zoom Out
                </button>
                <button class="svg-viewer-btn reset-zoom-btn" data-viewer="<?php echo $viewer_id; ?>" title="Reset Zoom">
                    ↺ Reset Zoom
                </button>
                <div class="divider"></div>
                <button class="svg-viewer-btn center-view-btn" data-viewer="<?php echo $viewer_id; ?>" title="Center View">
                    ⊙ Center View
                </button>
                <?php if ($show_coords) : ?>
                <button class="svg-viewer-btn coord-copy-btn" data-viewer="<?php echo $viewer_id; ?>" title="Copy current center coordinates">
                    📍 Copy Center
                </button>
                <span class="coord-output" data-viewer="<?php echo $viewer_id; ?>" aria-live="polite"></span>
                <?php endif; ?>
                <div class="divider"></div>
                <span class="zoom-display">
                    <span class="zoom-percentage"
                        data-viewer="<?php echo $viewer_id; ?>"><?php echo round($initial_zoom * 100); ?></span>%
                </span>
            </div>
            <div class="svg-container" style="height: <?php echo esc_attr($atts['height']); ?>"
                data-viewer="<?php echo $viewer_id; ?>">
                <div class="svg-viewport" data-viewer="<?php echo $viewer_id; ?>">
                    <!-- SVG will be loaded here -->
                </div>
            </div>
        </div>
        <script>
            (function () {
                if (typeof window.svgViewerInstances === 'undefined') {
                    window.svgViewerInstances = {};
                }

                // Initialize viewer when ready
                function initViewer() {
                    if (typeof SVGViewer !== 'undefined') {
                        window.svgViewerInstances['<?php echo $viewer_id; ?>'] = new SVGViewer({
                            viewerId: '<?php echo $viewer_id; ?>',
                            svgUrl: '<?php echo esc_url($svg_url); ?>',
                            initialZoom: <?php echo json_encode($initial_zoom); ?>,
                            minZoom: <?php echo json_encode($min_zoom); ?>,
                            maxZoom: <?php echo json_encode($max_zoom); ?>,
                            zoomStep: <?php echo json_encode($zoom_step); ?>,
                            centerX: <?php echo $center_x === null ? 'null' : json_encode($center_x); ?>,
                            centerY: <?php echo $center_y === null ? 'null' : json_encode($center_y); ?>,
                            showCoordinates: <?php echo $show_coords ? 'true' : 'false'; ?>
                        });
                    } else {
                        setTimeout(initViewer, 100);
                    }
                }

                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', initViewer);
                } else {
                    initViewer();
                }
            })();
        </script>
        <?php
        return ob_get_clean();
    }

    /**
     * Convert SVG path to URL
     */
    private function get_svg_url($path)
    {
        // If it's already a full URL, validate it
        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        // If it starts with /, make it relative to home URL
        if ($path[0] === '/') {
            return home_url() . $path;
        }

        // Otherwise, assume it's relative to uploads
        $uploads = wp_get_upload_dir();
        return $uploads['baseurl'] . '/' . $path;
    }
}

// Initialize plugin
SVG_Viewer::get_instance();
