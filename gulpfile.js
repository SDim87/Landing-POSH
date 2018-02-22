var gulp         = require('gulp');// Gulp пакет
		sass         = require('gulp-sass'); // Sass пакет
		browserSync  = require('browser-sync').create();// Автоматический Injecting(ввод) в браузеры
		concat       = require('gulp-concat'); // Подключаем gulp-concat (для конкатенации файлов)
		uglify       = require('gulp-uglifyjs');//Подключаем gulp-uglifyjs (для сжатия JS)
		cssnano      = require('gulp-cssnano');// Подключаем пакет для минификации CSS
		rename       = require('gulp-rename');// Подключаем библиотеку для переименования файлов
		del          = require('del'); // Подключаем библиотеку для удаления файлов и папок
		imagemin     = require('gulp-imagemin');  // Подключаем библиотеку для работы с изображениями
		pngquant     = require('imagemin-pngquant'); // Подключаем библиотеку для работы с png
		cache        = require('gulp-cache'); // Подключаем библиотеку кеширования
		autoprefixer = require('gulp-autoprefixer'); // Подключаем библиотеку для автоматического добавления префиксов


gulp.task('sass', function(){ // Создаем таск "sass"
    return gulp.src('app/scss/**/*.scss') // Берем источник
    	.pipe(sass()) // Преобразуем SCSS в CSS посредством gulp-sass
    	.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))// Автопрефиксы
    	.pipe(gulp.dest('app/css')) // Выгружаем результаты в папку app/css
    	.pipe(browserSync.reload({stream: true}))// Injecting(ввод) в браузеры
});

gulp.task('scripts', function () { // Конкатинация и минификация js файлов
	return gulp.src([
			'app/libs/jquery/dist/jquery.min.js',//Берем jQuery
			'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js',// Берем Magnific Popup
	])
	.pipe(concat('libs.min.js'))// Собираем их в кучу в новом файле libs.min.js
	.pipe(uglify())// Сжимаем JS файл
	.pipe(gulp.dest('app/js'));// Выгружаем в папку app/js
});

gulp.task('css-libs', function () { //Минификация и переименование css файлов
	return gulp.src('app/css/*.css')// Выбираем файл для минификации
	.pipe(cssnano())  // Сжимаем
	.pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
	.pipe(gulp.dest('app/css')) // Выгружаем в папку app/css
});

gulp.task( 'browser-sync' , function () {  
	browserSync.init({ 
		server: { baseDir: "./app/" } }); 
	notify: false
});

gulp.task ('clean', function(){ // Удаляем папку dist перед сборкой
	return del.sync('dist/');
});

gulp.task ('img',function() { //Оптимизирует изображения и сохраняет в папку итогового проекта
	return gulp.src('app/img/**/*') // Берем все изображения из app
	.pipe(cache(imagemin({ // Сжимаем изображения с наилучшими настройками + кешируем
		interlaced: true,
		progressive: true,
		svgoPlagins: [{removeViewBox: false}],
		une: [pngquant()]
	})))
	.pipe(gulp.dest('dist/img'));  // Выгружаем на продакшен
});

gulp.task('watch', ['browser-sync', 'sass', 'scripts'], function () { // в [] прописываются таски, которые должны выполяться до watch
	gulp.watch('app/scss/**/*.scss', ['sass']);// Наблюдение за sass файлами в папке sass
	gulp.watch('app/*.html', browserSync.reload);// Наблюдение за HTML файлами в корне проекта
	gulp.watch('app/js/**/*.js', browserSync.reload); // Наблюдение за JS файлами в папке js
});

gulp.task('build',['clean', 'img', 'sass', 'scripts'], function () {
	var buildCss = gulp.src([  // Переносим CSS стили в продакшен
		'app/css/main.min.css',
		'app/css/libs.min.css',
	])
	.pipe(gulp.dest('dist/css'));

	var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
		.pipe(gulp.dest('dist/fonts'));

	var buildJs = gulp.src('app/js/**/*')  // Переносим скрипты в продакшен
		.pipe(gulp.dest('dist/js'));

	var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
		.pipe(gulp.dest('dist/'));
});

gulp.task ('clearCache', function(){ //Автономный таск для очистки кеша Gulp
	return cache.clearAll();
});

gulp.task('default', ['watch']);//Дефолтный таск. Теперь вместо "gulp watch" команда "gulp"