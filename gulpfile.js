let preprocessor = 'less';

const { src, dest, parallel, series, watch } = require('gulp');
const browserSync   = require('browser-sync').create();
const concat        = require('gulp-concat');
const uglify        = require('gulp-uglify-es').default;
const sass          = require('gulp-sass');
const less          = require('gulp-less');
const posthtml       = require("gulp-posthtml");
const autoprefixer  = require('gulp-autoprefixer');
const cleancss      = require('gulp-clean-css');
const imagemin      = require('gulp-imagemin');
const newer         = require('gulp-newer');
const del           = require('del');
const svgstore      = require('gulp-svgstore');
const webp          = require('gulp-webp');
const rename        = require('gulp-rename');
const include        = require("posthtml-include");

function browsersync() {
  browserSync.init({
    server: { baseDir: 'build/' },
    notify: false,
    online: true
  })
}

function scripts() {
  return src('source/js/**/*.js')
  .pipe(concat('app.min.js'))
  .pipe(uglify())
  .pipe(dest('build/js/'))
  .pipe(browserSync.stream())
}

function styles() {
  return src('source/' + preprocessor + '/style.' + preprocessor + '')
  .pipe(eval(preprocessor)())
  .pipe(concat('style.min.css'))
  .pipe(autoprefixer({ overrideBrowserslist: ['last 2 versions'], grid: true }))
  .pipe(cleancss(( { level: { 1: { specialComments: 0 } } } )))
  .pipe(dest('build/css/'))
  .pipe(browserSync.stream())
}

function bootstrap() {
  return src('source/bootstrap/custom.scss')
  .pipe(eval('sass')())
  .pipe(concat('bootstrap.min.css'))
  .pipe(autoprefixer({ overrideBrowserslist: ['last 2 versions'], grid: true }))
  .pipe(cleancss(( { level: { 1: { specialComments: 0 } } } )))
  .pipe(dest('build/css/'))
  .pipe(browserSync.stream())
}

function html() {
  return src('source/*html')
    .pipe(posthtml([
        include()
      ]))
    .pipe(dest("build"))
    .pipe(browserSync.stream())
}

function images() {
  return src('source/images/**/*.{png,jpg,svg}')
  .pipe(newer('build/images'))
  .pipe(imagemin({
      progressive: true
    }))
  .pipe(dest('build/images'))
  .pipe(webp({quality: 90}))
  .pipe(dest('build/images'))
}

function sprite() {
  return src('source/images/**/*.svg')
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename('sprite.svg'))
  .pipe(dest('build/images'))
}

function fonts() {
  return src('source/fonts/**/*.{woff,woff2}')
  .pipe(dest('build/fonts/'))
}

function cleanimg() {
  return del('build/images/**/*', { force: true })
}

function cleanbuild() {
  return del('build/**/*', { force: true })
}

//function buildcopy() {
//  return src([
//    'app/css/**/*.min.css',
//    'app/js/**/*.min.js',
//    'app/images/dest/**/*',
//    'app/**/*.html',
//  ], { base: 'source' })
//  .pipe(dest('dist'));
//}

function startwatch() {
  watch('source/bootstrap/**/*', bootstrap);
  watch('source/**' + preprocessor + '/**/*', styles);
  watch(['source/**/*.js', '!app/**/*.min.js'], scripts);
  watch('source/**/*.html', html);
  watch('source/images/src/**/*', images);
}

exports.browsersync  = browsersync;
exports.scripts      = scripts;
exports.styles       = styles;
exports.html         = html;
exports.images       = images;
exports.cleanimg     = cleanimg;
exports.sprite       = sprite;
exports.bootstrap    = bootstrap;
exports.build        = series(cleanbuild, bootstrap, sprite, fonts, styles, scripts, html, images);

exports.default      = parallel(sprite, bootstrap, fonts, images, styles, html, scripts, browsersync, startwatch);




















