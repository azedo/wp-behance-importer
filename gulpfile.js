// Include gulp
var gulp = require('gulp');

// Include other plugins
var stylus = require('gulp-stylus'); // Convert stylus to css
var concat = require('gulp-concat'); // Concatenate the js files
var uglify = require('gulp-uglify'); // Minify the js files
var rename = require('gulp-rename'); // Rename the files
var autoprefixer = require('gulp-autoprefixer'); // Autoprefix the css file
var jshint = require('gulp-jshint'); // Search the main js file for errors
var stylish = require('jshint-stylish'); // Display the errors in a better way

// Lint Task
gulp.task('lint', function() {
	return gulp.src('./admin/js/wp-behance-importer-admin.js')
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'));
});

// Stylus task
gulp.task('stylus', function() {
	return gulp.src('./admin/css/wp-behance-importer-admin.styl')
		.pipe(stylus({
			compress: true
		}))
		.pipe(autoprefixer())
		.pipe(rename('wp-behance-importer-admin.min.css'))
		.pipe(gulp.dest('./admin/css/min'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
	return gulp.src('./admin/js/*.js')
		.pipe(concat('wp-behance-importer-admin-concat.js'))
		.pipe(gulp.dest('./admin/js/min'))
		.pipe(rename('wp-behance-importer-admin.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('./admin/js/min'));
});

// Watch Files For Changes
gulp.task('watch', function() {
	gulp.watch('./admin/js/*.js', ['scripts']);
	gulp.watch('./admin/css/*.styl', ['stylus']);
});

// Default Task
gulp.task('default', ['stylus', 'lint', 'scripts', 'watch']);