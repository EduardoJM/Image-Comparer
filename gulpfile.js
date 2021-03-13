const gulp = require('gulp');
const rename = require('gulp-rename');
const pump = require('pump');
const lec = require('gulp-line-ending-corrector');
const header = require('gulp-header');
const version = require('./package.json').version;
// sass
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

const concatJS = require('gulp-concat');
const babel = require('gulp-babel');

/**
 * PATHS
 */
// CSS
const mainCss = './src/css/image-comparer.css';
const cssInput = './src/css/**/*.css';
const cssOutput = './dist/css';
// JavaScript
const jsInput = ['./src/js/**/*.js', '!./src/js/**/_*.js'];
const jsOutput = './dist/js/';
// docs
const docsOutput = './docs';
/**
 * LICENSE
 */
const licenseHeader = [
    '/**',
    ' * Image Comparer - A little plugin that implements a image comparer.',
    ' * @version v' + version + '',
    ' * @author Eduardo Oliveira (EduardoJM) <eduardo_y05@outlook.com>.',
    ' * @link https://github.com/EduardoJM/Image-Comparer',
    ' * ',
    ' * Licensed under the MIT License (https://github.com/EduardoJM/Image-Comparer/blob/master/LICENSE).',
    ' */',
    '\n'
].join('\n'); 

function onError(err) {
    console.log(err);
    this.emit('end');
}

gulp.task('css', function (callback) {
    pump([
        gulp.src(mainCss),
        lec(),
        sourcemaps.init(),
        autoprefixer(),
        header(licenseHeader),
        rename("image-comparer.css"),
        gulp.dest(cssOutput),
        gulp.dest(`${docsOutput}/css`),
        sourcemaps.write(),
        cleanCss(),
        rename("image-comparer.min.css"),
        header(licenseHeader),
        gulp.dest(cssOutput),
        gulp.dest(`${docsOutput}/css`),
    ], callback);
});

gulp.task('js', function (callback) {
    pump([
        gulp.src(jsInput),
        concatJS('image-comparer.js'),
        babel({
            presets: ['@babel/env'],
            plugins: ['@babel/plugin-proposal-class-properties']
        }),
        header(licenseHeader),
        gulp.dest(jsOutput),
        gulp.dest(`${docsOutput}/js`),
        uglify().on('error', onError),
        rename("image-comparer.min.js"),
        header(licenseHeader),
        gulp.dest(jsOutput),
        gulp.dest(`${docsOutput}/js`),
    ], callback);
});

gulp.task('watchJS', function () {
    return gulp.watch(jsInput, gulp.series(['js']));
});

gulp.task('watchCSS', function() {
    return gulp.watch(cssInput, gulp.series(['css']));
});