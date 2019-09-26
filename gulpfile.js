var gulp = require('gulp'),
gulpLoadPlugins = require('gulp-load-plugins'),
$ = gulpLoadPlugins()
let batchReplace = require('gulp-batch-replace');
let watch = require('gulp-watch');
const browserSync = require('browser-sync').create();
const runSequence = require('run-sequence');
const del = require('del');

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
    return gulp.src(['*.html', 'htmlBlocks/*.html', '!modules/*.html','!node_modules/**/*.html'])
               .pipe($.fileInclude({
                    prefix: '@@',
                    basepath: './htmlBlocks/'
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

// 清除dist文件夹
gulp.task("clean",()=>{
    del(["dist/"])
})
gulp.task('watch',function(){
    w('*.html',['prew']);
    w('htmlBlocks/*.html',['prew']);
    w('modules/*.html',['prew']);
    w('scss/**/*.scss',['sass']);
    w('js/**/*.js',['buildJs','vendorJs']);
    w('images/*.{jpg,png}',['images']);
    function w(path, task){
        $.watch(path, function () {
            gulp.start(task);
            browserSync.reload();
        });
    }
})
gulp.task('server',function(){
    $.connect.server({
        root: './dist',
        port: '8888',
        open: true,
        livereload: true //实时刷新开关
    })
})
// 本地启动服务 gulp
gulp.task('default',['server','watch']) // ['server','watch']

// 整体打包 gulp build
gulp.task('build-start',['clean','prew','sass','buildJs','images', 'vendorJs'],function(){
    console.log("打包完成！")
})
gulp.task('build', () => { // 先清除dist文件夹在整体打包
    return new Promise(resolve => {
        runSequence(['clean'], 'build-start', resolve);
    });
});
