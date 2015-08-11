(function () {

    'use strict';

    var gulp = require('gulp');
    var uglify = require('gulp-uglify');
    var beautify = require('gulp-beautify');
    var concat = require('gulp-concat');
    var gulpif = require('gulp-if');
    var sass = require('gulp-sass');
    var del = require('del');
    var html2js = require('gulp-html2js');
    var runSequence = require('run-sequence');
    var minifyCss = require('gulp-minify-css');
    var jshint = require('gulp-jshint');
    var stylish = require('jshint-stylish');
    var jade = require('jade');
    var gulpJade = require('gulp-jade');
    var inject = require('gulp-inject');
    var webserver = require('gulp-webserver');
    var bowerFiles = require('main-bower-files');
    var es = require('event-stream');
    var ngAnnotate = require('gulp-ng-annotate');

    var paths = {
        jade: './app/jade/{,**/}*.jade',
        scripts: './app/scripts/{,**/}*.js',
        sass: './app/scss/{,**/}*.scss',
        images: './app/images/{,**/}*.*',
        bower: './app/bower_components/{,**/}*.*',
        dist: './dist',
        build: './build'
    };

    // Build tasks

    gulp.task('clean', function (done) {
        del([paths.dist, paths.build, './app/scripts/tpl']);
        done();
    });

    gulp.task('gulpJshint', function () {
        return gulp.src(['./gulpfile.js'])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'));
    });

    gulp.task('processScripts', function () {
        return gulp.src([paths.scripts])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'))
        .pipe(ngAnnotate({
            add: true,
            single_quotes: true
        }))
        .pipe(gulp.dest(paths.build + '/scripts'));
    });

    gulp.task('jade', function () {
        return gulp.src([paths.jade, '!{,**/}{includes,mixins,layout}/{,**/}*.jade'])
            .pipe(gulpJade({
                jade: jade,
                pretty: true
            }))
            .pipe(gulp.dest('build/views'));
    });

    gulp.task('jade-index', function () {
        return gulp.src('./app/index.jade')
            .pipe(gulpJade({
                jade: jade,
                pretty: true
            }))
            .pipe(gulp.dest(paths.build));
    });

    gulp.task('copy', function () {
        gulp.src(paths.images)
            .pipe(gulp.dest('build/images'));
        gulp.src(paths.bower)
            .pipe(gulp.dest('build/bower_components'));
    });

    gulp.task('copy-templates', function() {
        gulp.src('./app/templates/*.html')
        .pipe(html2js({
            outputModuleName: 'template-test',
            useStrict: true
        }))
        .pipe(concat('template.js'))
        .pipe(gulp.dest('./build/scripts/tpl'));
    });

    gulp.task('css', function () {
        gulp.src(paths.sass)
        .pipe(sass())
        .pipe(gulp.dest('build/styles'));
    });

    gulp.task('server', function () {
        gulp.src(paths.build)
        .pipe(webserver({
            host: '0.0.0.0',
            port: 8080,
            fallback: 'index.html',
            livereload: true
        }));
    });

    gulp.task('inject', function () {
        var sources = es.merge(gulp.src(['build/scripts/**/*.js', 'build/styles/**/*.css'], {
            read: false
        }));
        var bowerSources = gulp.src(bowerFiles({
            paths: {
                bowerDirectory: 'build/bower_components',
                bowerrc: './.bowerrc',
                bowerJson: './bower.json'
            }
        }), {
            read: false
        });

        gulp.src('build/index.html')
        .pipe(inject(sources, {
            addRootSlash: true,
            relative: true,
            starttag: '<!-- local_dependencies:{{ext}} -->',
            endtag: '<!-- local_dependencies -->',
        }))
        .pipe(inject(bowerSources, {
            name: 'bower',
            addRootSlash: true,
            relative: true,
            starttag: '<!-- bower_dependencies:{{ext}} -->',
            endtag: '<!-- bower_dependencies -->',
        }))
        .pipe(gulp.dest(paths.build));
    });

    gulp.task('watch', function () {
        gulp.watch(paths.scripts, ['processScripts']);
        gulp.watch(paths.jade, ['jade']);
        gulp.watch(paths.sass, ['css']);
    });

    // Dist tasks

    gulp.task('html2js', function () {
        gulp.src('./app/templates/*.html')
        .pipe(html2js({
            outputModuleName: 'template-test',
            useStrict: true
        }))
        .pipe(concat('template.js'))
        .pipe(gulp.dest('./app/scripts/tpl'));
    });

    gulp.task('process-scripts-dist', function () {
        return gulp.src(['./app/scripts/app.js', paths.scripts, './app/scripts/tpl/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'))
        .pipe(ngAnnotate({
            add: true,
            single_quotes: true
        }))
        .pipe(concat('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist + '/scripts'));
    });

    gulp.task('sass-dist', function () {
        gulp.src(paths.sass)
        .pipe(sass())
        .pipe(minifyCss({compability: 'ie8'}))
        .pipe(gulp.dest(paths.dist + '/styles'));
    });

    gulp.task('copy-dist', function () {
        gulp.src(paths.images)
            .pipe(gulp.dest('dist/images'));
        gulp.src(paths.bower)
            .pipe(gulp.dest('dist/bower_components'));
    });

    gulp.task('jade-dist', function () {
        return gulp.src([paths.jade, '!{,**/}{includes,mixins,layout}/{,**/}*.jade'])
            .pipe(gulpJade({
                jade: jade,
                pretty: false
            }))
            .pipe(gulp.dest('dist/views'));
    });

    gulp.task('jade-index-dist', function () {
        return gulp.src('./app/index.jade')
            .pipe(gulpJade({
                jade: jade,
                pretty: false
            }))
            .pipe(gulp.dest(paths.dist));
    });

    gulp.task('inject-dist', function () {
        var sources = es.merge(gulp.src(['dist/scripts/**/*.js', 'dist/styles/**/*.css'], {
            read: false
        }));
        var bowerSources = gulp.src(bowerFiles({
            paths: {
                bowerDirectory: 'dist/bower_components',
                bowerrc: './.bowerrc',
                bowerJson: './bower.json'
            }
        }), {
            read: false
        });

        gulp.src('dist/index.html')
        .pipe(inject(sources, {
            addRootSlash: true,
            relative: true,
            starttag: '<!-- local_dependencies:{{ext}} -->',
            endtag: '<!-- local_dependencies -->',
        }))
        .pipe(inject(bowerSources, {
            name: 'bower',
            addRootSlash: true,
            relative: true,
            starttag: '<!-- bower_dependencies:{{ext}} -->',
            endtag: '<!-- bower_dependencies -->',
        }))
        .pipe(gulp.dest(paths.dist));
    });

    // Main tasks dist

    gulp.task('build-dist', function (done) {
        runSequence(
            'clean',
            'gulpJshint',
            'html2js',
            'jade-dist',
            'jade-index-dist',
            'copy-dist',
            done
        );
    });

    gulp.task('scripts-dist', ['process-scripts-dist', 'sass-dist']);

    gulp.task('dist', ['inject-dist']);


    // Main tasks build

    gulp.task('build', function (done) {
        runSequence(
            'clean',
            'gulpJshint',
            'processScripts',
            'jade',
            'jade-index',
            'copy',
            'copy-templates',
            'css',
            done
        );
    });

    gulp.task('default', ['server', 'inject', 'watch']);

})();