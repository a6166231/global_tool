"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
//@ts-ignore
const child_process_1 = require("child_process");
var bIsRunning = false;
var bakUpUrl = [];
var tsc_b = function () {
    if (bIsRunning)
        return;
    bakUpUrl = [];
    bIsRunning = true;
    let cmd = 'tsc -b ' + Editor.Project.path;
    console.log('- start -');
    let cp = (0, child_process_1.exec)(cmd, (err, stdout, stderr) => {
        let out = stdout.split('\n');
        for (let info of out) {
            formatErrorInfo(info);
        }
        bIsRunning = false;
        console.log('total :', bakUpUrl.length);
        console.log('- over -');
        // console.log('\x1B[32m%s\x1B[0m', 'success')
        // console.log('%c在这个符号后的信息是红色','color: green')
    });
};
/**
 * @en
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    startBuildTs() {
        tsc_b();
    },
    startBuildTsAndOpen() {
        if (bakUpUrl.length == 0) {
            tsc_b();
        }
        for (let path of bakUpUrl) {
            Editor.Message.request('asset-db', 'query-uuid', path).then((uuid) => {
                if (uuid)
                    Editor.Message.send('asset-db', 'open-asset', uuid);
            }).catch(err => {
                console.error(err);
            });
        }
    },
};
var formatErrorInfo = async function (data) {
    let indexOf = data.indexOf(': ');
    let bakPath, path;
    bakPath = path = data.slice(0, indexOf);
    let lineIndex = path.indexOf('(');
    if (data.indexOf('error') >= 0 && lineIndex >= 0 && path.indexOf(')')) {
        let p = path.slice(0, lineIndex);
        p = p.replace(PPATH, 'db:/');
        bakUpUrl.push(p);
        let lineS = path.slice(lineIndex + 1, path.length - 1);
        path = path.slice(0, lineIndex) + ':' + lineS.split(',').join(':');
        path = `(file:///${path})`;
    }
    else {
        path = '&emsp;-' + path;
    }
    data = data.replace(bakPath, path);
    console.log(`${data}`);
};
var PPATH;
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
function load() {
    PPATH = Editor.Project.path.split('\\').join('/');
}
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
function unload() { }
exports.unload = unload;
