(function( $ ) {
	'use strict';

	/**
	 * All of the code for your admin-specific JavaScript source
	 * should reside in this file.
	 *
	 * Note that this assume you're going to use jQuery, so it prepares
	 * the $ function reference to be used within the scope of this
	 * function.
	 *
	 * From here, you're able to define handlers for when the DOM is
	 * ready:
	 *
	 * $(function() {
	 *
	 * });
	 *
	 * Or when the window is loaded:
	 *
	 * $( window ).load(function() {
	 *
	 * });
	 *
	 * ...and so on.
	 *
	 * Remember that ideally, we should not attach any more than a single DOM-ready or window-load handler
	 * for any particular page. Though other scripts in WordPress core, other plugins, and other themes may
	 * be doing this, we should try to minimize doing that in our own work.
	 */
	
	$(function() {
		// If it has something saved, show it's info
		storeInfo();

		// Buttons actions
		/// Navigation
		//// Tabs
		//// TODO: Add the hash to the url for better UX
		$('.nav-tab-wrapper').on('click', '.nav-tab', function(e) {
			e.preventDefault();

			var $this				= $(this),
					divName			=	$this.data('div-name'),
					contentTab	=	$('.content-tab');

			// Remove the active class from the active tab and give to the selected tab
			$('.nav-tab').not($this).removeClass('nav-tab-active');
			$this.addClass('nav-tab-active');

			// Hide the active content div and show the selected one
			contentTab.not('#'+divName).css('display', 'none');
			$('#'+divName).css('display', 'block');
		});
		//// Close error message
		$('.error-settings').on('click', function(e) {
			e.preventDefault();

			var $this				= $(this),
					divName			=	$this.data('div-name'),
					contentTab	=	$('.content-tab');

			// Remove the active class from the active tab and give to the selected tab
			$('.nav-tab').not('.nav-tab-wrapper > .settings').removeClass('nav-tab-active');
			$('.nav-tab-wrapper > .settings').addClass('nav-tab-active');

			// Hide the active content div and show the selected one
			contentTab.not('#'+divName).css('display', 'none');
			$('#'+divName).css('display', 'block');
		});
		//// Config
		//// Clear cache
		$('#storage-info').on('click', '#clear-cache', function(e) {
			e.preventDefault();

			$(this).attr('disabled', true).text('Aguarde...');
			
			localStorage.clear();
			
			window.location.href=window.location.href;
		});
		//// Display
		//// Show results [all, today, date]
		$('#config-controls button').on('click', function(e){
			e.preventDefault();
			
			var $this = $(this),
					btnId	=	$this.attr('id');
			
			if (btnId === 'import-date') {
				$this.parent().next().fadeIn();
				
				/// Make the clicked button active
				$($this)
					.addClass('active')
					.html('Escolha a data!')
					.next()
					.css('font-weight', 'bold')
				/// Disable the other buttons
				$('#config-controls')
					.find('button')
					.attr('disabled', true);
				
				$('#config-controls').on('click', '#results-date', function(e) {
					e.preventDefault();
					
					var now					= new Date($('#date-input').val()),
							startOfDay	= new Date(now.getFullYear(), now.getMonth(), now.getDate()),
							timestamp		= startOfDay / 1000;
					
					doAjaxRequest($this, btnId, timestamp);
				});
			} else if (btnId === 'import-today') {
				var now					= new Date(),
						startOfDay	= new Date(now.getFullYear(), now.getMonth(), now.getDate()),
						timestamp		= startOfDay / 1000;
				
				doAjaxRequest($this, btnId, timestamp);
			} if (btnId === 'import-all') {
				var now					= new Date(0),
						startOfDay	= new Date(now.getFullYear(), now.getMonth(), now.getDate()),
						timestamp		= startOfDay / 1000;
				
				doAjaxRequest($this, btnId, timestamp);
			}
		});
		//// Close the date picker field
		$('#close-date').on('click', function(e) {e.preventDefault();
			
			resetResults();
			
			var $this = $(this);
			
			$this.parent().fadeOut(function() {
				/// Make the clicked button active
				$('#config-controls')
					.find('#import-date')
					.removeClass('active')
					.text($('#import-date').data('name'))
					.next()
					.css('font-weight', 'normal');
				/// Disable the other buttons
				$('#config-controls')
					.find('button')
					.attr('disabled', false);
			});
		});
		//// Import results
		$('#results').on('click', '#import-results', function(e) {
			e.preventDefault();

			var selected		= $('#results .add'),
					selectedArr	=	[],
					resultArr		=	[],
					jsonArr			= JSON.parse(jsonDB),
					$this				= $(this);

			$(selected).each(function () {
				if (this.checked) {
					var selectedItem = $(this).val();

					// Push result to array
					selectedArr.push(selectedItem);
				}
			});

			for (var i = 0; i < jsonArr.length; i++) {
				for (var k = 0; k < selectedArr.length; k++) {
					if (jsonArr[i].id === Number(selectedArr[k])) {
						resultArr.push(jsonArr[i]); // Return as soon as the object is found
					}
				}
			}

			var jDB		=	resultArr,
					nonce	=	$('input[name="wpBehanceImporterNonce"]').val(),
					data = {
						'action': 'wp_behance_importer_ajax',
						'jdb': jDB,
						'api': apiKey,
						'myNonce': nonce
					};

			$.ajax({
				xhr: function()
				{
					var xhr = new window.XMLHttpRequest();
					//Upload progress
					xhr.upload.addEventListener("progress", function(evt){
						if (evt.lengthComputable) {
							var percentComplete = evt.loaded / evt.total;
							//Do something with upload progress
							console.log(percentComplete);
						}
					}, false);
					//Download progress
					xhr.addEventListener("progress", function(evt){
						if (evt.lengthComputable) {
							var percentComplete = evt.loaded / evt.total;
							//Do something with download progress
							console.log(percentComplete);
						}
					}, false);
					return xhr;
				},
				type: 'POST',
				url: myAjax.ajaxurl,
				data: data,
				beforeSend: function() {
					$this.text('Aguarde').attr('disabled', true);
					$('#reset-results').attr('disabled', true);

					$('#import-info').slideDown('fast', function() {
						for (var i = 0; i < jDB.length; i++) {
							$(this).find('.import-names').append((i+1) + '. ' + jDB[i].name + "<br>");
						};

						$(this).find('h3').find('b:first-of-type').text(jDB.length);
						$(this).find('h3').find('b:last-of-type').text($('input[name="projectsTotal"]').val());
					});
				},
				success: function(data){
					$this.text('Importar').attr('disabled', false);
					$('#reset-results').attr('disabled', false);

					$('#import-info').slideUp('fast', function() {
						$(this).find('.import-names').html(' ');
					});
				}
			});
			
			// Use for debug
			// $.post(myAjax.ajaxurl, data, function(response) {
			// 	console.log('Got this from the server: ' + response);
			// });
		});
		//// Reset results
		$('#results').on('click', '#reset-results', function(e) {
			e.preventDefault();
			//// Fade the results out
			resetResults();
		});

		$('#results').on('change', 'input[name="check-all"]', function() {
			$('#results input:checkbox').not(this).not('input:disabled').prop('checked', this.checked);
		});

		$('#results').on('click', '.add', function() {
			$("#check-all input[type='checkbox']").prop('checked', false);
			console.log('mudou');
		});
	});

	/**
	 * Functions
	 */

	// Shows info if file is stored in cache
	// TODO: Put this file in db for better multi-user support
	function storeInfo() {
		if (localStorage.getItem('json')) {
			var fileSize		= ((localStorage['json'].length * 2)/1024).toFixed(2)+" kb",
					jsonFile		= JSON.parse(localStorage.getItem('json')),
					jsonDate		= localStorage.getItem('jsonDate');

			$('.nav-tab-wrapper .cache > span').html('<i class="dashicons dashicons-yes" style="padding-top: 2px;"></i>');
			
			$('#storage-info').html('<h3><i class="dashicons dashicons-yes"></i> Arquivo salvo em cache</h3>' +
															'<h5>Informações sobre o arquivo:</h5>' +
															'<ul>' +
																'<li>Data em que foi salvo: <span>' + jsonDate + '</span></li>' +
																'<li>Tamanho do arquivo: <span>' + fileSize + '</span></li>' +
																'<li>Título do último trabalho inserido no behance: ' +
																'<span>' + jsonFile[0].name + '</span></li>' +
															'</ul>' +
															'<p>' +
																'<a href="#" id="clear-cache" class="button button-danger">Apagar cache</a> - <em>Após apagado, será necessário fazer um novo pedido para o servidor.</em>' +
															'</p>');
			$('#storage-info').css('display', 'block');
		} else {
			$('.nav-tab-wrapper .cache > span').html('<i class="dashicons dashicons-no" style="padding-top: 2px;"></i>');

			$('#storage-info').html('<h3><i class="dashicons dashicons-no-alt"></i> Nenhum arquivo salvo em cache.</h3>'+
															'<em>Após o primeiro pedido, um arquivo contendo a informação do servidor será salvo no banco de dados.</em>');
			$('#storage-info').css('display', 'block');
		}
	}

	// Reset results div
	function resetResults() {
		$('#results').addClass('animated fadeOut');
		//// After the animation is complete, do the following
		$('#results').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
			///// Remove the classes from the result div
			$(this).attr('class', '').html('');
			///// Remove the class active from the active button,
			///// remove the disabled attribute from the other buttons,
			///// put the name of the button back
			///// and reset the description font-weight.
			$('#config-controls button').each(function() {
				$(this)
					.removeClass('active')
					.attr('disabled', false)
					.text($(this).data('name'))
					.next()
					.css('font-weight', 'normal');
			});
			
			$('#results-date').parent().fadeOut();
		});
	}

	// Show results on page
	function showOnPage(dataArray, button, btnId, timestamp) {
		// Change the text in the button
		$(button).text('Pronto!');
		
		var hideCount	=	0;
		
		if (localStorage.getItem('json')) {
			// Add the storage info in the cache tab
			/// Show the info
			storeInfo();

			/// Clean the results div before appending the new results
			$('#results').html('');

			for (var i = 0; i < dataArray.length; i++) {
				var id						= dataArray[i].id,
						name					= dataArray[i].name,
						url						= dataArray[i].url,
						published_on	= dataArray[i].published_on,
						published_onM	= moment.unix(published_on),
						day						= published_onM.format('DD'),
						month					= published_onM.format('MM'),
						year					= published_onM.format('YYYY'),
						hours					= published_onM.format('HH'),
						minutes				= published_onM.format('mm'),
						seconds				= published_onM.format('ss'),
						fields				=	dataArray[i].fields,
						img_size			=	115, // 115, 202, 230, 404
						img						= dataArray[i].covers[img_size],
						animation			=	'fadeIn';

				if (published_on >= timestamp) {
					hideCount += 1;

					console.log(typeof id);

					$('#results')
						.append("<div id='" + id + "' class='animated " + animation + " result group'>" +
											"<img src='" + img + "'>" +
											"<div class='result-info'>" +
												"<h3>" + name + "</h3>" +
												"<span class='published_on'>Publicado em: " + day + "/" + month + "/" + year + " às " + hours + ":" + minutes + ":" + seconds + "</span>" +
												"<p style='margin-bottom: 0;'>" +
													"<a href='" + url + "' target='_blank'>" +
														"<span class='label label-primary'>ver projeto <i class='fa fa-external-link'></i></span>" +
													"</a>" +
												"</p>" +
											"</div>" +
											"<input type='checkbox' name='addProject' class='add' value='" + id + "' />" +
										"</div>");
				}
			}
		} else {
			// Add the storage info in the cache tab
			/// Show the info
			storeInfo();

			// Clean de div
			$('#results-loader').removeClass('fadeInUp').addClass('fadeOutDown');

			$('#results-loader').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
				/// Clean the results div before appending the new results
				$('#results').html('');

				for (var i = 0; i < dataArray.length; i++) {
					var id						= dataArray[i].id,
							name					= dataArray[i].name,
							url						= dataArray[i].url,
							published_on	= moment.unix(dataArray[i].published_on),
							day						= published_on.format('DD'),
							month					= published_on.format('MM'),
							year					= published_on.format('YYYY'),
							hours					= published_on.format('HH'),
							minutes				= published_on.format('mm'),
							seconds				= published_on.format('ss'),
							fields				=	dataArray[i].fields,
							img_size			=	115, // 115, 202, 230, 404
							img						= dataArray[i].covers[img_size],
							animation			=	'fadeIn';

					if (published_on >= timestamp) {
						hideCount += 1;

						$('#results')
							.append("<div id='" + id + "' class='animated " + animation + " result group'>" +
												"<img src='" + img + "'>" +
												"<div class='result-info'>" +
													"<h3>" + name + "</h3>" +
													"<span class='published_on'>Publicado em: " + day + "/" + month + "/" + year + " às " + hours + ":" + minutes + ":" + seconds + "</span>" +
													"<p style='margin-bottom: 0;'>" +
														"<a href='" + url + "' target='_blank'>" +
															"<span class='label label-primary'>ver projeto <i class='fa fa-external-link'></i></span>" +
														"</a>" +
													"</p>" +
												"</div>" +
												"<input type='checkbox' class='add' />" +
											"</div>");
					}
				}
			});
		}
		
		if (hideCount === 0) {
			$('#results')
				.append('<h3 class="text-center animated fadeIn">Nenhum resultado encontrado.</h3>')
				.append('<div class="animated fadeIn text-center" style="margin-top: 20px;">' +
									'<a href="#" id="reset-results" class="button">Resetar</a>' +
								'</div>');
		} else {
			/// Show the controls to import or restart the query
			/// Then shows how many jobs and a select box
			$('#results')
				.prepend('<form id="results-form" method="post" action="save-results.php"><div class="animated fadeIn">' +
									'<div id="import-controls">' +
										'<a href="#" id="import-results" class="button-primary">Importar</a>' +
										'<a href="#" id="reset-results" class="button">Resetar</a>' +
									'</div>' +
								'</div>' +
								'<div id="info" class="animated fadeIn group">' +
									'<div id="result-total">' +
										'Total de trabalhos: <b>' + hideCount + '</b>' +
									'</div>' +
									'<div id="check-all">' +
									'Selecionar todos: <input type="checkbox" name="check-all" />' +
									'</div>' +
								'</div>');
			$('#results')
				.append('</form><div id="info" class="animated fadeIn group">' +
									'<div id="result-total">' +
										'Total de trabalhos: <b>' + hideCount + '</b>' +
									'</div>' +
									'<div id="check-all">' +
										'Selecionar todos: <input type="checkbox" name="check-all" />' +
									'</div>' +
								'</div>')
				.append('<div class="animated fadeIn" style="margin-top: 20px;">' +
									'<div id="import-controls">' +
										'<a href="#" id="import-results" class="button-primary">Importar</a>' +
										'<a href="#" id="reset-results" class="button">Resetar</a>' +
									'</div>' +
								'</div>');

			$('input[name="projectsTotal"]').val(hideCount);
		}
	}

	// If it has more than one page, it should use this function to retrieve the others
	function retrievePages(apiKey, page, perPage, results, button, btnId, timestamp) {
		// Check if there's data in the localStorage
		if (localStorage.getItem('json')) {
			console.log('Já estava salvo! Nois!');
			
			var json = JSON.parse(localStorage.getItem('json'));
			/// Go to the showOnPage function to show the saved results
			showOnPage(json, button, btnId, timestamp);
		} else {
			console.log('Ainda não tava salvo! Vou salvar depois de mostrar tudo! NOVAX!');
			var nextPage = page + 1;
			
			/// Do the first ajax request
			$.ajax({
			url: 'http://www.behance.net/v2/users/blclv/projects?api_key=' + apiKey + '&per_page=' + perPage + '&page=' + nextPage,
			data:{
				'action':'do_ajax'
			},
			dataType: 'JSONP',
			success: function(newData) {
				var newResults = results.concat(newData.projects);
				
				if (newData.projects.length > 0) {
					retrievePages(apiKey, nextPage, perPage, newResults, button, btnId, timestamp);
				} else {
					console.log('Última página!');

					localStorage.setItem('json', JSON.stringify(newResults));

					// Save JSON to DB
					// $('#behanceJson input[name="behance_json"]').val(JSON.stringify(newResults));

					// var jsonResult = $('#behanceJson').serialize();

					// $.post( pluginUrl + 'admin/save-json-db.php', jsonResult ).error(
					// 	function(errorThrown) {
					// 		alert('error');
					// 		console.log(errorThrown);
					// 	}).success( function() {
					// 		console.log('Enviado!!');
					// 	});

					showOnPage(newResults, button, btnId, timestamp);
				}
			},
			error: function(errorThrown2) {
				alert('error');
				console.log(errorThrown2);
			}
		});
		}
	}

	// The AJAX request to retrieve the JSON file
	// TODO: Put the variables inside the db as well
	function doAjaxRequest(button, btnId, timestamp) {
		var url	= 'http://www.behance.net/v2/users/' + bhUser + '/projects?api_key=' + apiKey + '&per_page=' + perPage + '&page=' + page;
		
		// Check if there's data in the localStorage
		if (localStorage.getItem('json')) {
			var json = JSON.parse(localStorage.getItem('json'));
			/// Make the clicked button active
			$(button)
				.addClass('active')
				.html('Aguarde!')
				.next()
				.css('font-weight', 'bold');
			/// Disable the other buttons
			$('#config-controls')
				.find('button')
				.attr('disabled', true);
			
			/// Go to the showOnPage function to show the saved results
			showOnPage(json, button, btnId, timestamp);
			
			/// Tests
			console.log('Já estava salvo! Nois!');
			//console.log(json);
		} else {
			console.log('Ainda não tava salvo! Vou salvar depois de mostrar tudo! NOVAX!');

			/// Saves the date that the file was saved
			var jsonDate = new Date();
			localStorage.setItem('jsonDate', jsonDate);

			/// Do the first ajax request
			$.ajax({
				url: url,
				data:{
					'action':'do_ajax'
				},
				dataType: 'JSONP',
				beforeSend: function() {
					$(button)
						.addClass('active')
						.html('Aguarde!')
						.next()
						.css('font-weight', 'bold');

					$('#config-controls')
						.find('button')
						.not(button)
						.attr('disabled', true);

					$('#results').append('<div id="results-loader" class="text-center animated fadeInUp"><img class="text-center" src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/3472/loader.gif" /></div>');
				},
				success: function(data) {
					var results = data.projects;

					if (results.length > 0) {
						retrievePages(apiKey, page, perPage, results, button, btnId, timestamp);
					} else {
						console.log('Última página!');
						localStorage.setItem('json', JSON.stringify(results));

						// Save JSON to DB
						// $('#behanceJson input[name="behance_json"]').val(results);

						// var jsonResult = $('#behanceJson').serialize();

						// $.post( 'save-json-db.php', jsonResult ).error(
						// 	function(errorThrown) {
						// 		alert('error');
						// 		console.log(errorThrown);
						// 	}).success( function() {
						// 		console.log('Enviado!!');
						// 	});
					}
				},
				error: function(errorThrown) {
					alert('error');
					console.log(errorThrown);
				}
			});
		}
	}

	// Save options function
	function saveSettings() {
		$('#settings-form').submit( function () {
			console.log('Antes de enviar!');

			if(!$('input[name="behance_api_key"]').val() && $('input[name="behance_user"]').val()) {
				$('input[name="behance_api_key"]').css('border', '1px solid red').next().text('Você precisa colocar uma chave API!');
				$('input[name="behance_user"]').css('border', '1px solid #ddd').next().text('');
			} else if (!$('input[name="behance_user"]').val() && $('input[name="behance_api_key"]').val()) {
				$('input[name="behance_user"]').css('border', '1px solid red').next().html('Você precisa colocar um nome de usuário!');
				$('input[name="behance_api_key"]').css('border', '1px solid #ddd').next().text('');
			} else if (!$('input[name="behance_user"]').val() || !$('input[name="behance_api_key"]').val()) {
				$('input[name="behance_user"]').css('border', '1px solid red').next().text('Você precisa colocar um nome de usuário!');
				$('input[name="behance_api_key"]').css('border', '1px solid red').next().text('Você precisa colocar uma chave API!');
			} else {
				console.log('Enviando...');

				$('#settings-tab .submit').append('<span style="position: relative;"><img src="/wp-admin/images/spinner.gif" alt="" class="slider-spinner general-spinner" style="position: absolute; top: 4px; left: 5px;"></span>');
				$('#settings-tab .submit input').val('Enviando...').addClass('active').attr('disabled', true);

				$('input[name="behance_api_key"], input[name="behance_user"]').attr('style', '').css({
					border: 'border: 1px solid #ddd',
					width: '50%'
				});
				$('.form-warning').text('');

				var b = $(this).serialize();

				$.post( 'options.php', b ).error(
					function(errorThrown) {
						alert('error');
						console.log(errorThrown);
					}).success( function() {
						$('#settings-tab .submit').find('span').detach();
						$('#settings-tab .submit input').val('Salvar Alterações').removeClass('active').attr('disabled', false);
						console.log('Enviado!!');
					});
			}

			return false;
		});
	}
	saveSettings();
})( jQuery );
