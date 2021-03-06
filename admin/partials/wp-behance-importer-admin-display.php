<?php

/**
 * Provide a admin area view for the plugin
 *
 * This file is used to markup the admin-facing aspects of the plugin.
 *
 * @link       https://github.com/azedo/wp-behance-importer
 * @since      0.5.0
 *
 * @package    Wp_Behance_Importer
 * @subpackage Wp_Behance_Importer/admin/partials
 */
?>

<!-- Save the config info in a variable for js use -->
<script type="text/javascript">
	var apiKey		= "<?php echo esc_attr( get_option('wpbi_api_key') ); ?>",
			page			= <?php echo esc_attr( get_option('wpbi_start_page') ); ?>,
			perPage		= <?php echo esc_attr( get_option('wpbi_results_per_page') ); ?>,
			bhUser		= "<?php echo esc_attr( get_option('wpbi_user') ); ?>",
			jsonIsDBt	= "<?php if (get_option('wpbi_json')) { echo "true"; } else { echo "false"; } ?>",
			jsonIsLSt	= (localStorage.getItem('wpbi_json')) ? true : false,
			jsonDBt		= "<?php if (get_option('wpbi_json')) { echo get_option('wpbi_json'); } else { echo "false"; } ?>",
			jsonDB		= (jsonDBt !== "false") ? jsonDBt : localStorage.getItem('wpbi_json'),
			jsonDatet	= "<?php if (get_option('wpbi_jsonDate')) { echo get_option('wpbi_jsonDate'); } else { echo "false"; } ?>",
			jsonDate	= (jsonDatet !== "false") ? jsonDatet : (new Date()),
			pluginUrl	= "<?php echo plugins_url(); ?>/wp-behance-importer/",
			importedP	= <?php echo json_encode(get_option('wpbi_imported_projects')); ?>;
</script>

<!-- This file should primarily consist of HTML with a little bit of PHP. -->
<div class="wrap wpbi">
	<h2>WP Behance Importer</h2>
	<h2 class="nav-tab-wrapper">
		<a href="#" class="nav-tab import nav-tab-active" data-div-name="import-tab"><?php _e('Import', 'wp-behance-importer'); ?></a>
		<a href="#" class="nav-tab settings" data-div-name="settings-tab"><?php _e('Settings', 'wp-behance-importer'); ?></a>
		<a href="#" class="nav-tab cache" data-div-name="cache-tab"><span></span> <?php _e('Cache', 'wp-behance-importer'); ?></a>
		<a href="#" class="nav-tab help" data-div-name="help-tab"><?php _e('Help', 'wp-behance-importer'); ?></a>
	</h2>

	<!-- Configuration warning -->
	<?php
		$notSetYet = false;
		if (get_option('wpbi_api_key') === '' || empty(get_option('wpbi_api_key')) || get_option('wpbi_user') === '' || empty(get_option('wpbi_user'))) { $notSetYet = true; ?>
		<div id="message" style="margin-top: 15px;">
			<p><?php _e('You need to configure the plugin. Go to <a href="#" class="error-settings" data-div-name="settings-tab">settings</a> and fill the necessary fields.', 'wp-behance-importer'); ?></p>
		</div>
	<?php } ?>

	<form id="behanceJson" action="#" method="post" style="display: none;">
		<?php settings_fields( 'wp-behance-importer-settings-group' ); ?>
		<?php do_settings_sections( 'wp-behance-importer-settings-group' ); ?>
		<div id="wpbi_json_fields">
			<input type="hidden" name="wpbi_json" value="<?php if (get_option('wpbi_json')) { echo get_option('wpbi_json'); } ?>">
			<input type="hidden" name="wpbi_jsonDate" value="<?php if (get_option('wpbi_jsonDate')) { echo get_option('wpbi_jsonDate'); } ?>">
		</div>
	</form>

	<div id="import-tab" class="content-tab">
		<div id="config-controls">
			<h3><?php _e('Which projects would you like to import?', 'wp-behance-importer'); ?></h3>
			<p>
				<button class="button-primary" id="import-all" data-name="<?php _e('All', 'wp-behance-importer'); ?>" <?php if ($notSetYet === true) { echo 'disabled'; } ?>><?php _e('All', 'wp-behance-importer'); ?></button>
				<span> - <?php _e('Since the first job inserted on behance.', 'wp-behance-importer'); ?></span>
			</p>
			<p>
				<button class="button-primary" id="import-today" data-name="<?php _e('Starting today', 'wp-behance-importer'); ?>" <?php if ($notSetYet === true) { echo 'disabled'; } ?>><?php _e('Starting today', 'wp-behance-importer'); ?></button>
				<span> - <?php _e('All that were added today.', 'wp-behance-importer'); ?></span>
			</p>
			<p>
				<button class="button-primary" id="import-date" data-name="<?php _e('From a specific date', 'wp-behance-importer'); ?>" <?php if ($notSetYet === true) { echo 'disabled'; } ?>><?php _e('From a specific date', 'wp-behance-importer'); ?></button>
				<span> - <?php _e('All that were added from a specific date.', 'wp-behance-importer'); ?></span>
			</p>
			<div style="display: none;">
				<input type="date" class="form-control" id="date-input">
				<a href="#" id="results-date" class="button">OK</a>
				<a href="#" id="close-date">
					<i class="dashicons dashicons-no" style="margin-top: 5px;"></i>
				</a>
			</div>
		</div><!-- /#config-controls -->

		<!-- Show the name of the imported projects -->
		<div id="import-info" style="display: none; padding: 10px; background-color: #EAEAEA; border-radius: 4px; -webkit-box-shadow: inset 0 1px 2px rgba(0,0,0,.1); box-shadow: inset 0 1px 2px rgba(0,0,0,.1); margin-bottom: 20px;">
			<h3 style="margin-top: 0;">
				<img src="/wp-admin/images/spinner.gif" alt="" class="slider-spinner general-spinner" style="margin-right: 5px;" />
				Importando <b></b> de <b></b>
			</h3>
			<div class="import-names"></div>
		</div>

		<!-- Show the results -->
		<form id="results-form" method="post" action="">
			<?php $nonce = wp_create_nonce("wp_behance_importer_nonce"); ?>
			<input type="hidden" value="" name="jsonQueryDB" />
			<input type="hidden" value="<?php echo $nonce; ?>" name="wpBehanceImporterNonce">
			<input type="hidden" value="" name="projectsTotal">
			<div id="results"></div><!-- /#results -->
		</form>
	</div><!-- /#import -->

	<!-- <img src="/wp-admin/images/spinner.gif" alt="" class="slider-spinner general-spinner"> -->

	<div id="settings-tab" class="content-tab" style="display: none;">
		<form id="settings-form" method="post" action="options.php">

			<?php settings_fields( 'wp-behance-importer-settings-group' ); ?>
			<?php do_settings_sections( 'wp-behance-importer-settings-group' ); ?>

			<table class="form-table">
				<tr valign="top">
					<th scope="row">
						<?php _e('API key', 'wp-behance-importer'); ?>: <span class="required-field">*</span>
						<small>
							<?php
								printf( __( "If you don't have one, please go to <a href='%s' target='_blank'>behance.net/dev</a> and register a new app in order to get a key.", 'wp-behance-importer' ),
									'http://behance.net/dev'
							); ?>
						</small>
					</th>
					<td>
						<input type="text" name="wpbi_api_key" value="<?php echo esc_attr( get_option('wpbi_api_key') ); ?>" style="width: 50%;" <?php if ($notSetYet === true) { echo 'class="input-error"'; } ?> />
						<p class="required-field"><?php if ($notSetYet === true) { echo 'This is a required field!'; } ?></p>
					</td>
				</tr>

				<tr valign="top">
					<th scope="row">
						<?php _e('Start page', 'wp-behance-importer'); ?>:
						<small>The start page of the query, default to 1. Unless you know what you are doing, keep this number at 1.</small>
					</th>
					<td>
						<input type="number" name="wpbi_start_page" min="1" value="<?php echo esc_attr( get_option('wpbi_start_page', '1') ); ?>" style="width: 10%;" />
					</td>
				</tr>

				<tr valign="top">
					<th scope="row">
						<?php _e('Results per page', 'wp-behance-importer'); ?>:
						<small><?php _e("The number of results per page, default to 25 (max). The smaller the number, the more API requests you are making, so it's recommended to keep this number at 25.", 'wp-behance-importer'); ?></small>
					</th>
					<td>
						<input type="number" name="wpbi_results_per_page" min="1" max="25" value="<?php echo esc_attr( get_option('wpbi_results_per_page', '25') ); ?>" style="width: 10%;" />
					</td>
				</tr>

				<tr valign="top">
					<th scope="row">
						<?php _e('Behance user', 'wp-behance-importer'); ?>: <span class="required-field">*</span>
						<small><?php _e("The Behance user name that you want to get your projects from (make sure that you are importing your own work or someone else's with their permission!!).", 'wp-behance-importer'); ?></small>
					</th>
					<td>
						<input type="text" name="wpbi_user" value="<?php echo esc_attr( get_option('wpbi_user') ); ?>" style="width: 50%;" <?php if ($notSetYet === true) { echo 'class="input-error"'; } ?> />
						<p class="required-field"><?php if ($notSetYet === true) { echo 'This is a required field!'; } ?></p>
					</td>
				</tr>

				<tr valign="top">
					<th scope="row">
						<?php _e('Post type', 'wp-behance-importer'); ?>: <span class="required-field">*</span>
						<small><?php _e("The post type that you wish to import the projects to (default is post, but you may have something different, like portfolio or jobs).", 'wp-behance-importer'); ?></small>
					</th>
					<td>
						<select name="wpbi_post_type">
							<?php
								$wpbi_current_post_type = get_option('wpbi_post_type');

								foreach ( get_post_types( '', 'names' ) as $post_type ) {
									$obj = get_post_type_object( $post_type );

									if ($wpbi_current_post_type == $post_type) {
										echo '<option value="' . $post_type . '" selected>' . $obj->labels->singular_name . '</option>';
									} else {
										echo '<option value="' . $post_type . '">' . $obj->labels->singular_name . '</option>';
									}
								}
							?>
						</select>
					</td>
				</tr>
			</table>

			<?php submit_button(); ?>

			<?php
				$post_types = get_post_types();

				// print_r($post_types);
				// echo $wpbi_current_post_type;
				// echo "<br />";
				// echo get_option('wpbi_json');
			?>
		</form>
	</div><!-- /#settings -->

	<div id="cache-tab" class="content-tab" style="display: none;">
		<div id="storage-info" style="display: none;"></div><!-- /#storage-info -->
	</div><!-- /#cache -->

	<div id="help-tab" class="content-tab" style="display: none;">
		<h3>Help</h3>
	</div><!-- /#help -->
</div>