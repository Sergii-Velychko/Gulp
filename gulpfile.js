var gulp = require('gulp'); // Галп
var minifyHTML = require('gulp-minify-html'); // сжатие HTML
var minifyCss = require('gulp-minify-css'); // сжатие CSS
var autoprefixer = require('gulp-autoprefixer'); // префиксы в CSS
var shorthand = require('gulp-shorthand'); // объединение похожих свойств
var jshint = require('gulp-jshint'); // проверка js на ошибки
var concat = require('gulp-concat'); // объединение JS
var uglify = require('gulp-uglify'); // сжатие JS
var rigger = require('gulp-rigger');
var plumber = require('gulp-plumber'); // обнаружение ошибок без закрытия watch
var imagemin = require('gulp-imagemin'); // сжатие изображений
var spritesmith = require('gulp.spritesmith'); //Сборка спрайтов
var pngquant = require('imagemin-pngquant'); // плагин для сжатия
var browserSync = require('browser-sync').create(); // создаем наш сервер
var watch = require('gulp-watch'); //Сбои при слежке уберает
var reload      = browserSync.reload; // перезагрузка
var pngquant    = require('imagemin-pngquant'); // Подключаем библиотеку для работы с p
var cache       = require('gulp-cache'); // Подключаем библиотеку кеширования
var sass = require('gulp-sass'); //Подключаем Sass пакет



// Наш HTML файл
//
gulp.task('html:build', function() {
  var opts = { // настройки сжатия файла
    // conditionals: true,
    // spare:true,
    // empty: true,
    // comments: true
    // loose: true
  };
 
  return gulp.src('./src/*.html')
    .pipe(minifyHTML(opts)) // вкл/выкл для сжатия
    .pipe(rigger()) //Прогоним через rigger
    .pipe(gulp.dest('./build/'))
    .pipe(reload({stream: true}))
});


//  Наш CSS файл
//
gulp.task('css:build', function() {
  return gulp.src('./src/**/*.css')
    .pipe(plumber())
    .pipe(autoprefixer({ 
        browsers: ['last 10 versions'],
        cascade: false
        // add: false
    }))
    .pipe(shorthand()) 
    .pipe(concat('all.css'))    
    .pipe(minifyCss())   
    .pipe(gulp.dest('./build/css'))
    .pipe(reload({stream: true}))
});

//  Наш SASS файл

gulp.task('sass:build', function() { // Создаем таск "sass"
	return gulp.src(['./src/sass/**/*.sass', './src/sass/**/*.scss']) // Берем источник
		.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError)) // Преобразуем Sass в CSS посредством gulp-sass
		.pipe(concat('all.css'))    
    .pipe(minifyCss())   
    .pipe(gulp.dest('./build/css'))
    .pipe(reload({stream: true})) // Выгружаем результата в папку css
});

    // gulp.task('sass:build', function(){ // Создаем таск Sass
    //     return gulp.src('src/sass/**/*.sass') // Берем источник
    //         .pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
    //         .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
    //         .pipe(gulp.dest('src/css')) // Выгружаем результата в папку app/css
    //         .pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
    // });


// проверка js на ошибки и вывод их в консоль
// 
gulp.task('scripts:build', function() {
    return gulp.src('./src/js/scripts.js') //выберем файлы по нужному пути
        .pipe(jshint()) //прогоним через jshint
        .pipe(jshint.reporter('jshint-stylish')); //стилизуем вывод ошибок в консоль
});

// Наш JavaScript 
//
gulp.task('scripts:build', function() {
  return gulp.src('./src/js/scripts.js')
    .pipe(plumber())
    .pipe(rigger())
    // .pipe(concat('main.js', {newLine: ';'})) // указываем имя получаемого файла
    .pipe(uglify())
    .pipe(gulp.dest('./build/js/'))
    .pipe(reload({stream: true}))
});


// Наши изображения
//
gulp.task('image:build', function() {
        return gulp.src('./src/img/**/*.*') // Берем все изображения из app
        .pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('./build/img/')); // Выгружаем на продакшен
});



// Спрайты сборка
// 
gulp.task('sprite:build', function () {
  var spriteData = gulp.src('./src/sprites/*.png') // путь, откуда берем картинки для спрайта
  .pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.css',
    imgPath: '../img/sprite.png',
    algorithm: 'top-down',
    padding: 20,
    cssVarMap: function(sprite) {
                    sprite.name = 's-' + sprite.name //имя каждого спрайта будет состоять из имени файла и конструкции 's-' в начале имени
                }
  }));
  spriteData.img.pipe(gulp.dest('./build/img/')); // путь, куда сохраняем картинку
  spriteData.css.pipe(gulp.dest('./src/css/')); // путь, куда сохраняем стили
});

// билдим шрифты
// 
gulp.task('fonts:build', function() {
    gulp.src('./src/fonts/*.otf')
        .pipe(gulp.dest('./build/fonts/')) //выгружаем в build
});

// билдим все
// 
gulp.task('build', [
    'html:build',      
    'css:build',
    'sass:build',
    'sprite:build',
    'scripts:build',
    'image:build',    
    'fonts:build',    
]);

// Наблюдаем
//
// gulp.task('watch', function() {
//  gulp.watch('./src/*.html', ['html']);
//  gulp.watch('./src/css/**/*.css', ['css']);
//   gulp.watch('./src/js/**/*.js', ['scripts']);
//  gulp.watch('./src/img/**/*.*', ['image']);
// });

gulp.task('watch', function(){
    watch(['./src/*.html'], function(event, cb) {
        gulp.start('html:build');
    });
    watch(['./src/css/**/*.css'], function(event, cb) {
        gulp.start('css:build');
    });
    // watch('src/sass/**/*.sass', ['sass']); // Наблюдение за sass файлами в папке
    watch(['./src/sass/**/*.sass', './src/sass/**/*.scss'], function(event, cb) {
        gulp.start('sass:build');
    }); // Наблюдение за sass файлами в папке sass
    //билдим спрайты в случае изменения
    watch(['./src/sprites/'], function(event, cb) {
        gulp.start('sprite:build');
    });
   
    watch(['./src/js/**/*.js'], function(event, cb) {
        gulp.start('scripts:build');
    });
    watch(['./src/img/**/*.*'], function(event, cb) {
        gulp.start('image:build');
    });
    //билдим шрифты в случае изменения
    watch(['./src/fonts/*.otf'], function(event, cb) {
        gulp.start('fonts:build');
    });
});

// Наш сервер
//
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./build/"
        }
    });
});


// По умолчанию
//
gulp.task('default', ['build', 'watch', 'browser-sync']);



