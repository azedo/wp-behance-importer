//! WP Behance Importer JS File
(function( $ ) {
	'use strict';

	$(function() {
		// If it has something saved, show it's info
		storeInfo();

		// Buttons actions
		/// Navigation
		//// Tabs
		$('.nav-tab-wrapper').on('click', '.nav-tab', function(e) {
			e.preventDefault();

			// @todo Add a hash to the url for better UX

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

			$(this).attr('disabled', true).text(wpbi.string_0);

			localStorage.clear();

			window.location.href=window.location.href;
		});
		//// Display
		//// Show results [all, today, date]
		$('#config-controls button').on('click', function(e){
			e.preventDefault();

			var $this = $(this),
					btnId	=	$this.attr('id'),
					now;

			if (btnId === 'import-date') {
				$this.parent().next().fadeIn();

				/// Make the clicked button active
				$($this)
					.addClass('active')
					.html(wpbi.string_1)
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
				now	= new Date();
			} else if (btnId === 'import-all') {
				now	= new Date(0);
			}

			if (btnId === 'import-today' || btnId === 'import-all') {
				var startOfDay	= new Date(now.getFullYear(), now.getMonth(), now.getDate()),
						timestamp		= startOfDay / 1000;

				doAjaxRequest($this, btnId, timestamp);
			}
		});
		//// Close the date picker field
		$('#close-date').on('click', function(e) {
			e.preventDefault();

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

			// Push all the selected projects to an array
			$(selected).each(function () {
				if (this.checked) {
					var selectedItem = $(this).val();

					// Push result to array
					selectedArr.push(selectedItem);
				}
			});

			// Get the ID of the selected projects and save in another array
			for (var i = 0; i < jsonArr.length; i++) {
				for (var k = 0; k < selectedArr.length; k++) {
					if (jsonArr[i].id === Number(selectedArr[k])) {
						resultArr.push(jsonArr[i]); // Return as soon as the object is found
					}
				}
			}

			// Variables for the ajax request
			var jDB		=	resultArr,
					nonce	=	$('input[name="wpBehanceImporterNonce"]').val(),
					data = {
						'action': 'wp_behance_importer_ajax',
						'jdb': jDB,
						'api': apiKey,
						'myNonce': nonce
					};

			// The ajax request for importing the data
			$.ajax({
				type: 'POST',
				url: wpbi.wpbiAjax,
				data: data,
				beforeSend: function() { // Before importing do the following
					$this.text(wpbi.string_0).attr('disabled', true);
					$('#reset-results').attr('disabled', true);

					$('#import-info').slideDown('fast', function() {
						for (var i = 0; i < jDB.length; i++) {
							$(this).find('.import-names').append((i+1) + '. ' + jDB[i].name + "<br>");
						};

						$(this).find('h3').find('b:first-of-type').text(jDB.length);
						$(this).find('h3').find('b:last-of-type').text($('input[name="projectsTotal"]').val());
					});
				},
				success: function(data) { // After everything is imported, do the following
					$this.text('Importar').attr('disabled', false);
					$('#reset-results').attr('disabled', false);

					$('#import-info').slideUp('fast', function() {
						$(this).find('.import-names').html(' ');
					});

					console.log('Got this from the server: ' + data);
				},
				error: function (errorImport) {
					alert('Something went wrong, check the console.');
					console.log(errorImport);
				}
			});
		});
		//// Reset results
		$('#results').on('click', '#reset-results', function(e) {
			e.preventDefault();
			// @todo Find out why the reset is not working properly
			resetResults();
		});
		//// Check all checkbox (don't select the already imported - disabled - ones)
		$('#results').on('change', 'input[name="check-all"]', function() {
			$('#results input:checkbox').not(this).not('input:disabled').prop('checked', this.checked);

			clearBtn();
		});
		$('#results').on('change', '.add', function() {
			clearBtn();
		});
		//// Check the clicked project
		$('#results').on('click', '.add', function() {
			$("#check-all input[type='checkbox']").prop('checked', false);
			$('#uncheck-all').fadeIn('300');
		});
		//// Remove all the selections
		$('#results').on('click', '.remove-selections', function() {
			$('#results input:checkbox').not(this).not('input:disabled').prop('checked', false);
			$('#uncheck-all').fadeOut('300');

			return false;
		});
	});

	/**
	 * Functions
	 */

	// Show or hide clear button
	function clearBtn() {
		if ($("#results input:checkbox:checked").length > 0) {
			$('#uncheck-all').fadeIn('300');
			console.log('one or more selected');
		} else {
			$('#uncheck-all').fadeOut('300');
			console.log('none selected');
		}
	}

	// @todo Put this file in db for better multi-user support
	// Shows info if file is stored in cache
	function storeInfo() {
		if (localStorage.getItem('json')) {
			var fileSize		= ((localStorage['json'].length * 2)/1024).toFixed(2)+" kb",
					jsonFile		= JSON.parse(localStorage.getItem('json')),
					jsonDate		= localStorage.getItem('jsonDate');

			$('.nav-tab-wrapper .cache > span').html('<i class="dashicons dashicons-yes" style="padding-top: 2px;"></i>');
			
			$('#storage-info').html('<h3><i class="dashicons dashicons-yes"></i> ' + wpbi.string_2 + '</h3>' +
															'<h5>' + wpbi.string_3 + ':</h5>' +
															'<ul>' +
																'<li>' + wpbi.string_4 + ': <span>' + jsonDate + '</span></li>' +
																'<li>' + wpbi.string_5 + ': <span>' + fileSize + '</span></li>' +
																'<li>' + wpbi.string_6 + ': ' +
																'<span>' + jsonFile[0].name + '</span></li>' +
															'</ul>' +
															'<p>' +
																'<a href="#" id="clear-cache" class="button button-danger">' + wpbi.string_7 + '</a> - <em>' + wpbi.string_8 + '</em>' +
															'</p>');
			$('#storage-info').css('display', 'block');
		} else {
			$('.nav-tab-wrapper .cache > span').html('<i class="dashicons dashicons-no" style="padding-top: 2px;"></i>');

			$('#storage-info').html('<h3><i class="dashicons dashicons-no-alt"></i>' + wpbi.string_9 +
															'<em>' + wpbi.string_10 +'</em>');
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
		$(button).text(wpbi.string_22);

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
											"<label for='" + id + "_l'>" +
												"<img src='" + img + "'>" +
												"<div class='result-info'>" +
													"<h3>" + name + "</h3>" +
													"<span class='published_on'>" + wpbi.string_11 + ": " + day + "/" + month + "/" + year + " às " + hours + ":" + minutes + ":" + seconds + "</span>" +
													"<p style='margin-bottom: 0;'>" +
														"<a href='" + url + "' target='_blank'>" +
															"<span class='label label-primary'>" + wpbi.string_12 + " <i class='fa fa-external-link'></i></span>" +
														"</a>" +
													"</p>" +
												"</div>" +
												"<input type='checkbox' name='addProject' id='" + id + "_l' class='add' value='" + id + "' />" +
											"</label>" +
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
													"<span class='published_on'>" + wpbi.string_11 + ": " + day + "/" + month + "/" + year + " às " + hours + ":" + minutes + ":" + seconds + "</span>" +
													"<p style='margin-bottom: 0;'>" +
														"<a href='" + url + "' target='_blank'>" +
															"<span class='label label-primary'>" + wpbi.string_12 + " <i class='fa fa-external-link'></i></span>" +
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
				.append('<h3 class="text-center animated fadeIn">' + wpbi.string_13 + '</h3>')
				.append('<div class="animated fadeIn text-center" style="margin-top: 20px;">' +
									'<a href="#" id="reset-results" class="button">' + wpbi.string_14 + '</a>' +
								'</div>');
		} else {
			/// Show the controls to import or restart the query
			/// Then shows how many jobs and a select box
			$('#results')
				.prepend('<form id="results-form" method="post" action="save-results.php"><div class="animated fadeIn">' +
									'<div id="import-controls">' +
										'<a href="#" id="import-results" class="button-primary">' + wpbi.string_15 + '</a>' +
										'<a href="#" id="reset-results" class="button">' + wpbi.string_14 + '</a>' +
									'</div>' +
								'</div>' +
								'<div id="info" class="animated fadeIn group">' +
									'<div id="result-total">' +
										wpbi.string_16 + ': <b>' + hideCount + '</b>' +
									'</div>' +
									'<div id="check-all">' +
										'<label for="wpbi_selectAll">' + wpbi.string_17 + ' <input type="checkbox" name="check-all" id="wpbi_selectAll" />' +
									'</div>' +
									'<div id="uncheck-all">' +
										'<button class="remove-selections">' + wpbi.string_23 + ' <span class="dashicons dashicons-dismiss"></span></button>' +
									'</div>' +
								'</div>');
			$('#results')
				.append('</form><div id="info" class="animated fadeIn group">' +
									'<div id="result-total">' +
										wpbi.string_16 + ': <b>' + hideCount + '</b>' +
									'</div>' +
									'<div id="check-all">' +
										wpbi.string_17 + ': <input type="checkbox" name="check-all" />' +
									'</div>' +
								'</div>')
				.append('<div class="animated fadeIn" style="margin-top: 20px;">' +
									'<div id="import-controls">' +
										'<a href="#" id="import-results" class="button-primary">' + wpbi.string_15 + '</a>' +
										'<a href="#" id="reset-results" class="button">' + wpbi.string_14 + '</a>' +
									'</div>' +
								'</div>');

			$('input[name="projectsTotal"]').val(hideCount);
		}
	}

	// If it has more than one page, it should use this function to retrieve the others
	function retrievePages(apiKey, page, perPage, results, button, btnId, timestamp) {
		// Check if there's data in the localStorage
		if (localStorage.getItem('json')) {
			console.log("It's already saved on db.");
			
			var json = JSON.parse(localStorage.getItem('json'));
			/// Go to the showOnPage function to show the saved results
			showOnPage(json, button, btnId, timestamp);
		} else {
			console.log("It wasn't saved yet, it'll show after is all loaded.");
			var nextPage = page + 1;
			
			/// Do the first ajax request
			$.ajax({
			url: 'http://www.behance.net/v2/users/' + bhUser + '/projects?api_key=' + apiKey + '&per_page=' + perPage + '&page=' + nextPage,
			data:{
				'action':'do_ajax'
			},
			dataType: 'JSONP',
			success: function(newData) {
				var newResults = results.concat(newData.projects);
				
				if (newData.projects.length > 0) {
					retrievePages(apiKey, nextPage, perPage, newResults, button, btnId, timestamp);
				} else {
					console.log('Last page!');

					localStorage.setItem('json', JSON.stringify(newResults));

					// Save JSON to DB
					$('#behanceJson input[name="wpbi_json"]').val(JSON.stringify(newResults));

					var jsonResult = $('#behanceJson').serialize(),
							dataJ = {
								'action': 'wp_behance_save_json_ajax',
								'jsonToDb': jsonResult
							};

					$.ajax({
						type: 'POST',
						url: wpbi.wpbiAjax,
						data: dataJ,
						success: function(data) {
							console.log('Success saving the json!');
							console.log('');
							console.log('Got this from the server: ' + data);
						},
						error: function(errorJson) {
							alert('error');
							console.log('Couln\'t save the json on the db => '  + errorThrown);
						}
					});

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
				.html(wpbi.string_0)
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
				data: {
					'action':'do_ajax'
				},
				dataType: 'JSONP',
				beforeSend: function() {
					$(button)
						.addClass('active')
						.html(wpbi.string_0)
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
						$('#behanceJson input[name="wpbi_json"]').val(results);

						var jsonResult = $('#behanceJson').serialize();

						var jsonResult = $('#behanceJson').serialize(),
								dataJ = {
									'action': 'wp_behance_save_json_ajax',
									'jsonToDb': jsonResult
								};

						$.ajax({
							type: 'POST',
							url: wpbi.wpbiAjax,
							data: dataJ,
							success: function(data) {
								console.log('Success saving the json!');
								console.log('');
								console.log('Got this from the server: ' + data);
							},
							error: function(errorJson) {
								alert('error');
								console.log('Couln\'t save the json on the db => '  + errorThrown);
							}
						});
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

			if(!$('input[name="wpbi_api_key"]').val() && $('input[name="wpbi_user"]').val()) {
				$('input[name="wpbi_api_key"]').css('border', '1px solid red').next().text(wpbi.string_18);
				$('input[name="wpbi_user"]').css('border', '1px solid #ddd').next().text('');
			} else if (!$('input[name="wpbi_user"]').val() && $('input[name="wpbi_api_key"]').val()) {
				$('input[name="wpbi_user"]').css('border', '1px solid red').next().html(wpbi.string_19);
				$('input[name="wpbi_api_key"]').css('border', '1px solid #ddd').next().text('');
			} else if (!$('input[name="wpbi_user"]').val() || !$('input[name="wpbi_api_key"]').val()) {
				$('input[name="wpbi_user"]').css('border', '1px solid red').next().text(wpbi.string_19);
				$('input[name="wpbi_api_key"]').css('border', '1px solid red').next().text(wpbi.string_18);
			} else {
				console.log(wpbi.string_21);

				$('#settings-tab .submit').append('<span style="position: relative;"><img src="/wp-admin/images/spinner.gif" alt="" class="slider-spinner general-spinner" style="position: absolute; top: 4px; left: 5px;"></span>');
				$('#settings-tab .submit input').val(wpbi.string_21).addClass('active').attr('disabled', true);

				$('input[name="wpbi_api_key"], input[name="wpbi_user"]').attr('style', '').css({
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
						$('#settings-tab .submit input').val(wpbi.string_20).removeClass('active').attr('disabled', false);
						console.log('Enviado!!');
					});
			}

			return false;
		});
	}
	saveSettings();
})( jQuery );