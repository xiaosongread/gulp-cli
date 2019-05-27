var gulp = require('gulp'),
gulpLoadPlugins = require('gulp-load-plugins'),
$ = gulpLoadPlugins()
let batchReplace = require('gulp-batch-replace');

gulp.task('prew', function () {
    return gulp.src(['*.html', '!modules/*.html','!node_modules/**/*.html'])
               .pipe($.fileInclude({
                    prefix: '@@',
                    basepath: '@file'
                }))
                // .pipe(batchReplace([{
                //     "http://www.songyanbin.com":"localhost"
                // }]))
                .pipe(gulp.dest('dist'))
                .pipe($.connect.reload());
})
// scss
gulp.task("sass",function(){
    return gulp.src('scss/**/*.scss')
               .pipe($.sass())
               .pipe($.minifyCss())
               .pipe(gulp.dest('dist/css'))
               .pipe($.connect.reload());
})

gulp.task("buildJs",function(){
    return gulp.src("js/**/*.js")
                .pipe($.babel({
                    presets: ['es2015']
                }))
                .pipe($.uglify())
                .pipe(gulp.dest('dist/js'))
                .pipe($.connect.reload());
})
gulp.task('copyimg',function(){
    //return gulp.src('images/*.jpg').pipe(gulp.dest('dest/images')) // 匹配所有.jpg的图片
    return gulp.src('images/*.{jpg,png}')
               .pipe($.imagemin())
               .pipe(gulp.dest('dist/images')) // gulp.src('images/**/*') gulp.src('images/*/*'
})
gulp.task('watch',function(){
    gulp.watch('*.html',['prew']);
    gulp.watch('modules/*.html',['prew']);
    gulp.watch('scss/**/*.scss',['sass']);
    gulp.watch('js/**/*.js',['buildJs']);
    gulp.watch('images/*.{jpg,png}',['copyimg']);
})
gulp.task('server',function(){
    $.connect.server({
        root: 'dist',
        port: '8888',
        livereload: true //实时刷新开关
    })
})
gulp.task('default',['server','watch']) // ['server','watch']
gulp.task('build',['prew','sass','buildJs','copyimg'],function(){
    console.log("打包完成！")
})
