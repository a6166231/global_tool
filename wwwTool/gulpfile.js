const gulp = require("gulp");
const del = require('del');
const Path = require('path');
var ppath = "";
var pkgpath = "";

gulp.task("clean", function (cb) {
    return del([pkgpath + "/temp"])
})

gulp.task("cpjss", function (cb) {
    return gulp.src(ppath + "/**/*.js")
        .pipe(gulp.dest(pkgpath + "/tempJs"));
})

gulp.task("build", gulp.series(getPath, "clean", "cpjss"))

function getPath(cb) {
    ppath = process.argv[4];
    pkgpath = Path.join(ppath, "packages");
    cb();
}