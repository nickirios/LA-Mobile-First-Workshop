var gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglifyjs'),
	rename = require('gulp-rename'),
	connect = require('gulp-connect'),
	clean = require('gulp-clean'),
	sequencer = require('run-sequence'),
	prefix = require('gulp-autoprefixer'),
	open = require('gulp-open'),
	sprity = require('sprity'),//.stream,
	gulpif = require('gulp-if'),
	replace = require('gulp-replace'),
	//minifyCSS = require('gulp-minify-css'),
	cssnano = require('gulp-cssnano'),
	cmq = require('gulp-combine-mq'),
	fileinclude = require('gulp-file-include');


//---------------------------------------------------------------------------------------------
//
// Local Server
//
//---------------------------------------------------------------------------------------------
//Connect local server with livereload
gulp.task('devServer', function(){
	return connect.server({
		root: 'app',
		port: 8870,
		livereload: true
	});
});

//Launch in browser once server is running
gulp.task('launchDev', ['devServer'], function(){
	gulp.src('app/Style-Guide.html')
		.pipe(open("", {url: "http://localhost:8870"}));
});

//Reload the page with changes on save
gulp.task('reload',function(){
	return gulp.src('')
		.pipe(connect.reload());
});


//---------------------------------------------------------------------------------------------
//
// Include Local Partials
//
//---------------------------------------------------------------------------------------------
gulp.task('fileinclude', function() {
	gulp.src(['./app/views/templates/*.html'])
		.pipe(fileinclude())
		.pipe(gulp.dest('./app'));
});


//---------------------------------------------------------------------------------------------
//
// Sprite Generation
//
//---------------------------------------------------------------------------------------------
gulp.task('sprites', function(){
	return sprity.src({
		processor: 'sass',
		name: 'sprite',
		src: './app/assets/img/sprite-src/*.png',
		style: './app/assets/scss/partials/global/_sprite.scss',
		'dimension': [{
			ratio: 1, dpi: 72
		}, {
			ratio: 2, dpi: 192
		}],
		margin: 2,
		orientation: 'binary-tree',
		'style-indent-char': 'tab',
		'style-indent-size': 1
	})
	.pipe(gulpif('*.png', gulp.dest('./app/assets/img'), gulp.dest('./app/assets/scss/partials/global')));
});


//---------------------------------------------------------------------------------------------
//
// Sass
//
//---------------------------------------------------------------------------------------------
gulp.task('compileSass', function() {
	return gulp.src('app/assets/scss/**/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'compressed',
			errLogToConsole: true
		}))
		.pipe(cmq())
		.pipe(prefix())
		.pipe(cssnano())//do we even need this if sass outputStyle is set to compressed?
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('app/assets/css'));
});


//---------------------------------------------------------------------------------------------
//
// Migrate Libs
//
//---------------------------------------------------------------------------------------------
gulp.task('jsLibs', function(){
	return gulp.src('./bower_components/**/*+(jquery.min|picturefill).js')
		.pipe(gulp.dest('app/assets/js/libs'));
});


//---------------------------------------------------------------------------------------------
//
// Build Task
//
//---------------------------------------------------------------------------------------------
// gulp.task('build',function(){ //same output as above, but without launching a server and watching for changes. useful to run before a commit, if you've made any tweaks while not "watching" the project.
// 	sequencer(['jsLibs','compileSass'],'dist');
// });


//---------------------------------------------------------------------------------------------
//
// Distribution Tasks (to cartridges)
//
//---------------------------------------------------------------------------------------------
// gulp.task('imgDist',function() {
// 	return gulp.src('./app/assets/img/*.png')
// 		.pipe(gulp.dest('./path/to/cartridge/images'));
// });

// gulp.task('cssDist',function(){
// 	return gulp.src('app/assets/css/*.css')
// 		//.pipe(minifyCSS({debug: true}))
// 		.pipe(gulp.dest('./path/to/cartridge/css'));
// });

// gulp.task('jsDist',['libsDist'],function(){
// 	return gulp.src('app/assets/js/master.js')
// 		//.pipe(uglify({
		// 	preserveComments: license,
		// 	compress: false
		// }))
// 		.pipe(gulp.dest('./path/to/cartridge/js'));
// });

// gulp.task('libsDist',function(){
// 	return gulp.src('app/assets/js/libs/**/*.js')
// 		.pipe(gulp.dest('./path/to/cartridge/js/libs'));
// });

// gulp.task('fontsDist',function(){
// 	return gulp.src('app/assets/fonts/**/*')
// 		.pipe(gulp.dest('./path/to/cartridge'));
// });

//gulp.task('dist', ['imgDist','cssDist','jsDist','libsDist','fontsDist']);


//---------------------------------------------------------------------------------------------
//
// Debugging
//
//---------------------------------------------------------------------------------------------
gulp.task('lint', function() {
	return gulp.src('./app/assets/js/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('lintGulpfile', function(){
	return gulp.src('./gulpfile.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});


//---------------------------------------------------------------------------------------------
//
// Default Task
//
//---------------------------------------------------------------------------------------------
gulp.task('default', function(){
	//sequencer('fileinclude', ['jsLibs','compileSass'],'dist','launchDev','watch');//will be like this when done creating all tasks
	sequencer('fileinclude', ['launchDev', 'watch']);
});


//---------------------------------------------------------------------------------------------
//
// Watch for Changes
//
//---------------------------------------------------------------------------------------------
gulp.task('watch', function() {
	gulp.watch('app/assets/scss/**/*.scss', ['compileSass']);
	gulp.watch('app/assets/img/sprite-src/**/*',['sprites','compileSass']);
	gulp.watch('app/assets/js/**/*.js', ['lint']);//add jsDist when have cartridges setup
	//gulp.watch('app/assets/js/libs/**/*.js', ['libsDist']);//uncomment when have cartridges setup
	//gulp.watch('app/assets/css/*.css',['stylesDist']);//uncomment when have catridges setup
	//gulp.watch('app/assets/fonts/**/*',['fontsDist']);//uncomment if use webfonts && when have cartridges setup
	gulp.watch(['app/views/**/*.html'], ['fileinclude']);
	gulp.watch(['app/*.html', 'app/assets/css/*.css','app/assets/js/*.js','app/assets/img/*.png'],['reload']);//when compiled files change, trigger reload to refresh in browser
	gulp.watch('gulpfile.js', ['lintGulpfile', 'reload']);//lints gulpfile & reloads browser in case any new files were created as a result of changes in this file
});
