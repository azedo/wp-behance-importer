<?php

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://github.com/azedo/wp-behance-importer
 * @since             0.5.0
 * @package           WP_Behance_Importer
 *
 * @wordpress-plugin
 * Plugin Name:       WP Behance Importer
 * Plugin URI:        https://github.com/azedo/wp-behance-importer
 * Description:       Just a easier way to import your existing projects on Behance to your wordpress portfolio.
 * Version:           0.5.0
 * Author:            Eduardo Grigolo
 * Author URI:        http://eduardogrigolo.com.br/
 * License:           MIT
 * License URI:       https://opensource.org/licenses/MIT
 * Text Domain:       wp-behance-importer
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-wp-behance-importer-activator.php
 */
function activate_wp_behance_importer() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-wp-behance-importer-activator.php';
	Wp_Behance_Importer_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-wp-behance-importer-deactivator.php
 */
function deactivate_wp_behance_importer() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-wp-behance-importer-deactivator.php';
	Wp_Behance_Importer_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_wp_behance_importer' );
register_deactivation_hook( __FILE__, 'deactivate_wp_behance_importer' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-wp-behance-importer.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_wp_behance_importer() {

	$plugin = new Wp_Behance_Importer();
	$plugin->run();

}
run_wp_behance_importer();

/**
 * Add the plugin to the menu
 */
add_action('admin_menu', 'wp_behance_importer_menu');
function wp_behance_importer_menu() {
	add_menu_page('WP Behance Importer', 'WP Behance Importer', 'administrator', 'wp-behance-importer', 'register_wp_behance_importer_admin', 'dashicons-download');

	add_action( 'admin_init', 'register_wp_behance_importer_settings' );
}

/**
 * Register the admin fields
 */
function register_wp_behance_importer_settings() {
	register_setting( 'wp-behance-importer-settings-group', 'behance_api_key' );
	register_setting( 'wp-behance-importer-settings-group', 'behance_start_page' );
	register_setting( 'wp-behance-importer-settings-group', 'behance_results_per_page' );
	register_setting( 'wp-behance-importer-settings-group', 'behance_user' );
	register_setting( 'wp-behance-importer-settings-group', 'behance_json' );
	// register_setting( 'wp-behance-importer-settings-group', 'behance_imported' );
}

function register_wp_behance_importer_admin() {
	require 'admin/partials/wp-behance-importer-admin-display.php';
}

add_action('wp_ajax_wp_behance_importer_ajax', 'wp_behance_importer_ajax');

function wp_behance_importer_ajax() {

	// if ( !wp_verify_nonce( $_POST['nonce'], "wp_behance_importer_nonce")) {
	// 	exit("No naughty business please");
	// }

	global $user_ID;

	$jdb = $_POST['jdb'];
	// $imported = $_POST['imported'];

	for ($i = 0; $i < count($jdb); $i++) { 
		// TODO: check if the id is not saved already in the database or check if the title already exists then kill the loop
		$new_post = array(
			'post_title' => $jdb[$i]['name'],
			'post_content' => '',
			'post_status' => 'draft',
			'post_date' => date('Y-m-d H:i:s'),
			'post_author' => $user_ID,
			'post_type' => 'tw_portfolio',
			'post_category' => array(0)
		);
		$post_id = wp_insert_post($new_post);

		// TODO: Create the ACF subfields for the flexible content

		$jsonurl = wp_remote_get("https://www.behance.net/v2/projects/" . $jdb[$i]['id'] . "?api_key=" . $_POST['api']);
		$json = wp_remote_retrieve_body($jsonurl);
		$jContents = json_decode($json, true);

		$field_key = "field_54484c2363681";
		$value = get_field($field_key);

		foreach ($jContents['project']['modules'] as $projectValue) {
			// Checl to see if it is a image module
			if ($projectValue['type'] === 'image') {
				$url = $projectValue['sizes']['original'];
				$tmp = download_url( $url );
				$file_array = array(
						'name' => basename( $url ),
						'tmp_name' => $tmp
				);

				// Check for download errors
				if ( is_wp_error( $tmp ) ) {
						@unlink( $file_array[ 'tmp_name' ] );
						return $tmp;
				}

				$imageId = media_handle_sideload( $file_array, $post_id );
				// Check for handle sideload errors.
				if ( is_wp_error( $imageId ) ) {
						@unlink( $file_array['tmp_name'] );
						return $imageId;
				}

				$attachment_url = wp_get_attachment_url( $imageId );
				// Do whatever you have to here

				$imageId = media_handle_upload( $projectValue['sizes']['original'], $post_id );
				// $imageSrc = wp_get_attachment_image_src( $imageId );

				$value[] = array("field_54484eaa63685" => $imageId, "acf_fc_layout" => "imagem");
			}
		}

		update_field( $field_key, $value, $post_id );
		// update_option( 'behance_imported', $imported );

		// print_r($imported);
	}

	wp_die();
}
