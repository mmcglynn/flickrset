const  {src, dest, watch } = require('gulp');
const minifyCSS =  require('gulp-clean-css');

const bundleCSS = () => {
    return src('./css/*.css')
        .pipe(minifyCSS())
        .pipe(dest('./dist/'));
};

const devWatch = () => {
    watch('./css/*.css', bundleCSS());
};


exports.default = bundleCSS;

//exports.devWatch = devWatch;

// Hello world essentially
// function defaultTask(cb) {
//     cb();
// }
// exports.default = defaultTask