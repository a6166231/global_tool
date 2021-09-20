'use strict';
let childprocess = require("child_process");

function openToolDir() {
    let cmd = (process.platform == 'darwin' ? "open" : "start");
    childprocess.exec(`${cmd} ${__dirname}`);
}

function execTask(task, cb) {
    let ppath = Editor.Project.path;
    let time = new Date().getTime();
    childprocess.exec("gulp " + task + " --option " + ppath, {
        cwd: __dirname
    }, (err, stdstr) => {
        if (err) {
            Editor.error("build error: ", err)
            return;
        }
        cb && cb();
        Editor.success("success!!   Cost Time: ", (new Date().getTime() - time) / 1000 + "s")
    })
}

function buildTask() {
    execTask("build")
}

module.exports = {
    load() {

    },
    unload() {

    },
    ///注册消息
    messages: {
        'openToolDir'() {
            openToolDir();
        },
        'setting'() {
            Editor.Panel.open('wwwtool');
        },
        'buildTest'() {
            buildTask();
        }
    },
}