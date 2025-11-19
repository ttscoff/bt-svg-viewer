<?php
/**
 * PHPUnit bootstrap file.
 *
 * @package Wp_Svg_Viewer
 */

if (!defined('ABSPATH') && PHP_SAPI !== 'cli' && PHP_SAPI !== 'phpdbg') {
	exit;
}

if (file_exists(__DIR__ . '/wp-tests-env.php')) {
	require_once __DIR__ . '/wp-tests-env.php';
}

$_tests_dir = getenv('WP_TESTS_DIR');

if (!$_tests_dir && getenv('WP_CORE_DIR')) {
	$_tests_dir = rtrim(getenv('WP_CORE_DIR'), '/\\') . '/tests/phpunit';
}

if (!$_tests_dir) {
	$_tests_dir = rtrim(sys_get_temp_dir(), '/\\') . '/wordpress-tests-lib';
}

// Forward custom PHPUnit Polyfills configuration to PHPUnit bootstrap file.
$_phpunit_polyfills_path = getenv('WP_TESTS_PHPUNIT_POLYFILLS_PATH');
if (false !== $_phpunit_polyfills_path) {
	define('WP_TESTS_PHPUNIT_POLYFILLS_PATH', $_phpunit_polyfills_path);
} elseif (!defined('WP_TESTS_PHPUNIT_POLYFILLS_PATH')) {
	$maybe_polyfills = dirname(dirname(__FILE__)) . '/../vendor/yoast/phpunit-polyfills';

	if (file_exists($maybe_polyfills . '/phpunitpolyfills-autoload.php')) {
		define('WP_TESTS_PHPUNIT_POLYFILLS_PATH', $maybe_polyfills);
	}
}

if (!file_exists("{$_tests_dir}/includes/functions.php")) {
	echo "Could not find {$_tests_dir}/includes/functions.php, have you run bin/install-wp-tests.sh ?" . PHP_EOL; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	exit(1);
}

// Give access to tests_add_filter() function.
require_once "{$_tests_dir}/includes/functions.php";

/**
 * Manually load the plugin being tested.
 */
function _manually_load_plugin()
{
	require dirname(dirname(__FILE__)) . '/bt-svg-viewer/bt-svg-viewer-plugin.php';
}

tests_add_filter('muplugins_loaded', '_manually_load_plugin');

// Start up the WP testing environment.
require "{$_tests_dir}/includes/bootstrap.php";

if (!function_exists('sanitize_hex_color') && defined('ABSPATH') && defined('WPINC')) {
	$formatting_path = rtrim(ABSPATH, '/\\') . '/' . WPINC . '/formatting.php';
	if (file_exists($formatting_path)) {
		require_once $formatting_path;
	}
}

