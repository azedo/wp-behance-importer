// Include gulp
var gulp = require('gulp');

// Include other plugins
var stylus = require('gulp-stylus');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

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