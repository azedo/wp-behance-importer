<?php

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              http://example.com
 * @since             1.0.0
 * @package           Plugin_Name
 *
 * @wordpress-plugin
 * Plugin Name:       WordPress Plugin Boilerplate
 * Plugin URI:        http://example.com/plugin-name-uri/
 * Description:       This is a short description of what the plugin does. It's displayed in the WordPress admin area.
 * Version:           1.0.0
 * Author:            Your Name or Your Company
 * Author URI:        http://example.com/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       plugin-name
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-plugin-name-activator.php
 */
function activate_plugin_name() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-plugin-name-activator.php';
	Plugin_Name_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-plugin-name-deactivator.php
 */
function deactivate_plugin_name() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-plugin-name-deactivator.php';
	Plugin_Name_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_plugin_name' );
register_deactivation_hook( __FILE__, 'deactivate_plugin_name' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-plugin-name.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_plugin_name() {

	$plugin = new Plugin_Name();
	$plugin->run();

}
run_plugin_name();

/**
 * Add the plugin to the menu
 */
add_action('admin_menu', 'behance_importer_plugin_menu');
function behance_importer_plugin_menu() {
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
	require 'admin/partials/plugin-name-admin-display.php';
}

add_action("wp_ajax_wp_behance_importer_ajax", "wp_behance_importer_ajax");

function wp_behance_importer_ajax() {

	// if ( !wp_verify_nonce( $_POST['nonce'], "wp_behance_importer_nonce")) {
	// 	exit("No naughty business please");
	// }

	global $user_ID;

	$jdb			= $_POST['jdb'];
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
