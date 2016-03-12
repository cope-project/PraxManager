/**
 * Build application assets
 */
var gulp = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');

// define vendor deps
var vendorjs = [
	'public/js/lib/jquery.js',
	'public/js/lib/bootstrap.js',
	'public/js/lib/angular.min.js',
	'public/js/lib/ui-bootstrap.min.js',
	'public/js/lib/moment-with-locales.js',
	'public/js/lib/angular-moment.min.js',
	'public/js/lib/fullcalendar.js',
	'public/js/lib/calendar.js',
	'public/js/lib/jquery.form.min.js',
	'public/js/lib/ng-tags-input/ng-tags-input.js'
];

var vendorcss = [
	'public/css/bootstrap.min.css',
	'public/css/sb-admin.css',
	'public/css/fullcalendar.css',
	'public/css/font-awesome-4.1.0/css/font-awesome.min.css',
	'public/js/lib/ng-tags-input/ng-tags-input.bootstrap.css'
];

gulp.task('concat-vendor-js', function() {
	return gulp.src(vendorjs)
		.pipe(concat('vendor.js'))
		.pipe(uglify())
		.pipe(gulp.dest('public/build'));
});


gulp.task('concat-vendor-css', function() {
	return gulp.src(vendorcss)
		.pipe(concat('vendor.css'))
		.pipe(cssmin())
		.pipe(gulp.dest('public/build'));
});
gulp.task('default', ['concat-vendor-js', 'concat-vendor-css']);