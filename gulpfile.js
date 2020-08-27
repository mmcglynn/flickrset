const gulp = require('gulp');
const uglifyjs = require('gulp-uglify-js');

// gulp.task('compress', function () {
//     return pipeline(
//         gulp.src('./js/app.js'),
//         uglify(),
//         gulp.dest('./dist/')
//     );
// });

gulp.task('uglifyjs', done =>
    uglifyjs('./dist/'),
    done()
);


//gulp.task('run',['css']);

// gulp.task('watch', function(){
//     gulp.watch('./css/style.css',['css']);
// });

//gulp.task(default, ['run','watch']);