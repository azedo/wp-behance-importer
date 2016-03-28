<?php

/**
 * The admin-specific functionality of the plugin.
 *
 * @link       http://example.com
 * @since      0.5.0
 *
 * @package    Wp_Behance_Importer
 * @subpackage Wp_Behance_Importer/admin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    Wp_Behance_Importer
 * @subpackage Wp_Behance_Importer/admin
 * @author     Your Name <email@example.com>
 */
class Wp_Behance_Importer_Admin {

	/**
	 * The ID of this plugin.
	 *
	 * @since    0.5.0
	 * @access   private
	 * @var      string    $wp_behance_importer    The ID of this plugin.
	 */
	private $wp_behance_importer;

	/**
	 * The version of this plugin.
	 *
	 * @since    0.5.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    0.5.0
	 * @param      string    $wp_behance_importer       The name of this plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $wp_behance_importer, $version ) {

		$this->plugin_name = $wp_behance_importer;
		$this->version = $version;

	}

	/**
	 * Register the stylesheets for the admin area.
	 *
	 * @since    0.5.0
	 */
	public function enqueue_styles($hook) {

		global $wpss_settings_page;

		if( $hook != $wpss_settings_page )
			return;

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Plugin_Name_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Plugin_Name_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		// Animate.css
		wp_enqueue_style( $this->plugin_name . '-animatecss', plugin_dir_url( __FILE__ ) . 'css/animate.min.css', array(), '3.3.0', 'all' );
		// Plugin Styles
		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/wp-behance-importer-admin.css', array(), $this->version, 'all' );
	}

	/**
	 * Register the JavaScript for the admin area.
	 *
	 * @since    0.5.0
	 */
	public function enqueue_scripts($hook) {

		global $wpbi_settings_page;

		if( $hook != $wpbi_settings_page )
			return;

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Plugin_Name_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Plugin_Name_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/wp-behance-importer-admin.js', array( 'jquery' ), $this->version, true );
		wp_enqueue_script( $this->plugin_name . '-momentjs', plugins_url( 'bower_components/momentjs/min/moment.min.js', dirname(__FILE__) ), array( 'jquery' ), $this->version, true );

		// Localize the script
		$translation_array = array(
			'wpbiAjax' => admin_url( 'admin-ajax.php' ),
			'string_0' => __( 'Wait...', 'wp-behance-importer' ),
			'string_1' => __( 'Choose the date', 'wp-behance-importer' ),
			'string_2' => __( 'File saved on cache', 'wp-behance-importer' ),
			'string_3' => __( 'Info about the file', 'wp-behance-importer' ),
			'string_4' => __( 'Date that was saved', 'wp-behance-importer' ),
			'string_5' => __( 'Size of file', 'wp-behance-importer' ),
			'string_6' => __( 'Title of the last project added to Behance', 'wp-behance-importer' ),
			'string_7' => __( 'Clear cache', 'wp-behance-importer' ),
			'string_8' => __( 'After the file is deletd, it will be necessary make another request to the server.', 'wp-behance-importer' ),
			'string_9' => __( 'No file saved on cache', 'wp-behance-importer' ),
			'string_10' => __( 'After the first request, a file with the projects information will be saved on the database.', 'wp-behance-importer' ),
			'string_11' => __( 'Published on', 'wp-behance-importer' ),
			'string_12' => __( 'see project', 'wp-behance-importer' ),
			'string_13' => __( 'Nothing found.', 'wp-behance-importer' ),
			'string_14' => __( 'Reset', 'wp-behance-importer' ),
			'string_15' => __( 'Import', 'wp-behance-importer' ),
			'string_16' => __( 'Total of projects', 'wp-behance-importer' ),
			'string_17' => __( 'Select all', 'wp-behance-importer' ),
			'string_18' => __( 'You need to put an API key!', 'wp-behance-importer' ),
			'string_19' => __( 'You need to put an username!', 'wp-behance-importer' ),
			'string_20' => __( 'Save', 'wp-behance-importer' ),
			'string_21' => __( 'Sending...', 'wp-behance-importer' ),
			'string_22' => __( 'Done!', 'wp-behance-importer' ),
			'string_23' => __( 'Clear', 'wp-behance-importer' )
		);
		wp_localize_script( $this->plugin_name, 'wpbi', $translation_array );
		// <script> alert( object_name.some_string ); </script>
	}

}
