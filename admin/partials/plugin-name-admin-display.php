<?php

/**
 * Provide a admin area view for the plugin
 *
 * This file is used to markup the admin-facing aspects of the plugin.
 *
 * @link       http://example.com
 * @since      1.0.0
 *
 * @package    Plugin_Name
 * @subpackage Plugin_Name/admin/partials
 */
?>

<!-- Save the config info in a variable fo js use -->
<script type="text/javascript">
	var apiKey		= "<?php echo esc_attr( get_option('behance_api_key') ); ?>",
			page			=	<?php echo esc_attr( get_option('behance_start_page') ); ?>,
			perPage		=	<?php echo esc_attr( get_option('behance_results_per_page') ); ?>,
			bhUser		=	"<?php echo esc_attr( get_option('behance_user') ); ?>",
			jsonDB		=	localStorage.getItem('json'),
			pluginUrl	=	"<?php echo plugins_url(); ?>/wp-behance-importer/",
			importedP	=	<?php echo json_encode(get_option('behance_imported')); ?>;
</script>

<!-- This file should primarily consist of HTML with a little bit of PHP. -->
<div class="wrap wpbi">
	<h2>WP Behance Importer</h2>
	<h2 class="nav-tab-wrapper">
		<a href="#" class="nav-tab import nav-tab-active" data-div-name="import-tab">Importar</a>
		<a href="#" class="nav-tab settings" data-div-name="settings-tab">Configuração</a>
		<a href="#" class="nav-tab cache" data-div-name="cache-tab"><span></span> Cache</a>
		<a href="#" class="nav-tab help" data-div-name="help-tab">Ajuda</a>
	</h2>

	<!-- Configuration warning -->
	<?php if (get_option('behance_api_key') === '' || get_option('behance_user') === '') { ?>
		<div id="message" class="error " style="margin-top: 15px;">
			<p>Você precisa configurar o plugin. Vá em <a href="#" class="error-settings" data-div-name="settings-tab">configurações</a> e preencha os campos necessários.</p>
		</div>
	<?php } ?>

	<form id="behanceJson" action="#" method="post" style="display: none;">
		<?php settings_fields( 'wp-behance-importer-settings-group' ); ?>
		<?php do_settings_sections( 'wp-behance-importer-settings-group' ); ?>
		<input type="hidden" name="behance_json" value='<?php echo esc_attr( get_option('behance_json') ); ?>'>
	</form>

	<div id="import-tab" class="content-tab">
		<div id="config-controls">
			<h3>Quais trabalhos você gostaria de importar?</h3>
			<p>
				<button class="button-primary" id="import-all" data-name="Todos">Todos</button>
				<span> - Desde do primeiro trabalho inserido.</span>
			</p>
			<p>
				<button class="button-primary" id="import-today" data-name="À partir de hoje">À partir de hoje</button>
				<span> - Todos que foram inseridos à partir da data de hoje.</span>
			</p>
			<p>
				<button class="button-primary" id="import-date" data-name="À partir de uma data específica">À partir de uma data específica</button>
				<span> - Todos que foram inseridos à partir de uma data específica.</span>
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
						API key:
						<small>If you don't have one, please go to <a href="http://behance.net/dev" target="_blank">behance.net/dev</a> and register a new app in order to get a key.</small>
					</th>
					<td>
						<input type="text" name="behance_api_key" value="<?php echo esc_attr( get_option('behance_api_key') ); ?>" style="width: 50%;" />
						<p class="form-warning" style="color: red;"></p>
					</td>
				</tr>

				<tr valign="top">
					<th scope="row">
						Start page:
						<small>The start page of the query, default to 1. Unless you know what you are doing, keep this number at 1.</small>
					</th>
					<td>
						<input type="text" name="behance_start_page" min="1" value="<?php echo esc_attr( get_option('behance_start_page') ); ?>" style="width: 10%;" />
					</td>
				</tr>

				<tr valign="top">
					<th scope="row">
						Results per page:
						<small>The number of results per page, default to 25 (max). The smaller the number, the more API requests you are making, so it's recommended to keep this number at 25.</small>
					</th>
					<td>
						<input type="number" name="behance_results_per_page" min="1" max="25" value="<?php echo esc_attr( get_option('behance_results_per_page') ); ?>" style="width: 10%;" />
					</td>
				</tr>

				<tr valign="top">
					<th scope="row">
						Behance user:
						<small>The Behance user name that you want to get your projects from.</small>
					</th>
					<td>
						<input type="text" name="behance_user" value="<?php echo esc_attr( get_option('behance_user') ); ?>" style="width: 50%;" />
						<p class="form-warning" style="color: red;"></p>
					</td>
				</tr>
			</table>

			<?php submit_button(); ?>
		</form>
	</div><!-- /#settings -->

	<div id="cache-tab" class="content-tab" style="display: none;">
		<div id="storage-info" style="display: none;"></div><!-- /#storage-info -->
	</div><!-- /#cache -->

	<div id="help-tab" class="content-tab" style="display: none;">
		<h3>Help</h3>
	</div><!-- /#help -->
</div>