var gulp = require("gulp");
var babel = require("gulp-babel");
var sass = require("gulp-sass");

gulp.task("js", function() {
	return gulp.src("private/js/index.js").pipe(babel()).pipe(gulp.dest("public/js/"));
});

gulp.task("css", function() {
	return gulp.src("private/css/index.scss").pipe(sass().on("error", sass.logError)).pipe(gulp.dest("public/css"));
});

gulp.task("default", ["js", "css"],  function () {

});
