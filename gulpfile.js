var gulp = require('gulp'),
gulpLoadPlugins = require('gulp-load-plugins'),
$ = gulpLoadPlugins()
let batchReplace = require('gulp-batch-replace');

const config = {
    //第三方代码
    vendor: [
        'vendor/jquery/jquery.js',
        'vendor/jquery/jquery.cookie.js',
        'vendor/jquery/jquery.validate.js',
        'vendor/swiper/swiper-2.7.6.js'
    ],
    vendor_css: [
        'vendor/swiper/swiper-2.7.6.css'
    ],

    //压缩配置
    uglify: {
        compress: {
            drop_console: true
        },
        ie8: true,
        output: {
            keep_quoted_props: true,
            quote_style: 3
        }
    }
}
// 合并第三方代码
gulp.task('vendorJs', () => {
    return gulp.src(config.vendor)
      .pipe($.concat('vendor.js')) //合并后的文件名
      .pipe($.plumber()) // 处理报错信息，不中断程序
      // .pipe($.babel())
      .pipe($.uglify(config.uglify))
      .pipe(gulp.dest('dist/vendor'))
    //   .pipe($.if(dev,gulp.dest('.tmp/scripts'),gulp.dest('dist/scripts')))
});
  
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
function notify(err) {
    // prevent gulp process exit
    this.emit('end');
}
gulp.task("sass",function(){
    gulp.src(config.vendor_css)
    .pipe($.concat('vendor.css'))
    .pipe(gulp.dest('dist/vendor')) //连接第三方css

    return gulp.src('scss/**/*.scss')
               .pipe($.sass())
               .on('error', notify)
               .pipe($.minifyCss())
               .pipe(gulp.dest('dist/css'))
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
gulp.task('images',function(){
    //return gulp.src('images/*.jpg').pipe(gulp.dest('dest/images')) // 匹配所有.jpg的图片
    return gulp.src('images/**/*')
               .pipe($.imagemin())
               .pipe(gulp.dest('dist/images')) // gulp.src('images/**/*') gulp.src('images/*/*'
})
gulp.task('watch',function(){
    gulp.watch('*.html',['prew']);
    gulp.watch('modules/*.html',['prew']);
    gulp.watch('scss/**/*.scss',['sass']);
    gulp.watch('js/**/*.js',['buildJs','vendorJs']);
    gulp.watch('images/*.{jpg,png}',['images']);
})
gulp.task('server',function(){
    $.connect.server({
        root: './dist',
        port: '8888',
        open: true,
        livereload: true //实时刷新开关
    })
})
gulp.task('default',['server','watch']) // ['server','watch']
gulp.task('build',['prew','sass','buildJs','images', 'vendorJs'],function(){
    console.log("打包完成！")
})
