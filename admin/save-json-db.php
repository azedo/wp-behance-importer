<?php

// echo "You shouldn't be here cowboy!";

$option_name = 'behance_json' ;
$new_value = $_POST['behance_json'] ;

// if ( get_option( $option_name ) !== false ) {

	// The option already exists, so we just update it.
	update_option( $option_name, $new_value );

// } else {

// 	$deprecated = null;
// 	$autoload = 'no';
// 	add_option( $option_name, $new_value, $deprecated, $autoload );
// }

?>