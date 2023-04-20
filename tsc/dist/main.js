"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
//@ts-ignore
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
var bIsRunning = false;
var bakUpUrl = [];
var filterList = [
    'protocol',
    'extensions'
];
var tsCfg;
var updateTsConfig = async function (status) {
    return new Promise(async (resolve, reject) => {
        const cfgPath = path_1.default.join(Editor.Project.path, 'tsconfig.json');
        console.log('cfgpath : ', cfgPath);
        if (status) {
            fs_1.default.readFile(cfgPath, 'utf-8', async (err, data) => {
                if (!err) {
                    tsCfg = data;
                    let obj = JSON.parse(spliceNote(data));
                    if (obj.compilerOptions) {
                        obj.compilerOptions.skipLibCheck = true;
                    }
                    else {
                        obj.compilerOptions = {
                            'skipLibCheck': true,
                        };
                    }
                    await writeTsConfig(JSON.stringify(obj));
                    resolve(null);
                }
                else {
                    reject(err);
                }
            });
        }
        else {
            await writeTsConfig(tsCfg);
            resolve(null);
        }
    });
};
var spliceNote = function (str) {
    let split = str.split('\n');
    for (let i = 0; i < split.length; i++) {
        if (split[i].indexOf('//') >= 0 || split[i].indexOf('/*') >= 0 || split[i].indexOf('*/') >= 0) {
            split.splice(i, 1);
            i--;
        }
    }
    return split.join('\n');
};
var writeTsConfig = async function (data) {
    return await fs_1.default.writeFileSync(path_1.default.join(Editor.Project.path, 'tsconfig.json'), data, 'utf-8');
};
var tsc_b = async function (bFilter = true) {
    if (bIsRunning)
        return;
    await updateTsConfig(true);
    bakUpUrl = [];
    bIsRunning = true;
    let cmd = 'tsc -p ' + Editor.Project.path;
    console.log('- start -');
    (0, child_process_1.exec)(cmd, async (err, stdout, stderr) => {
        console.log('======================');
        let out = stdout.split('\n');
        if (bFilter) {
            for (let info of out) {
                if (checkFilter(info))
                    formatErrorInfo(info);
            }
        }
        else {
            for (let info of out) {
                formatErrorInfo(info);
            }
        }
        console.log('total :', bakUpUrl.length);
        await updateTsConfig(false);
        bIsRunning = false;
        console.log('- over -');
        // console.log('\x1B[32m%s\x1B[0m', 'success')
        // console.log('%c在这个符号后的信息是红色','color: red')
    });
};
var checkFilter = function (info) {
    for (let f of filterList) {
        if (info.indexOf(f) >= 0)
            return false;
    }
    return true;
};
/**
 * @en
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    startBuildTs() {
        tsc_b();
    },
    startBuildNoFilter() {
        tsc_b(false);
    },
    async startBuildTsAndOpen() {
        if (bakUpUrl.length == 0) {
            await tsc_b();
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
    if (data.indexOf(PPATH) == 0 && data.indexOf('error') >= 0 && lineIndex >= 0 && path.indexOf(')')) {
        let p = path.slice(0, lineIndex);
        p = p.replace(PPATH, 'db:/');
        bakUpUrl.push(p);
        let lineS = path.slice(lineIndex + 1, path.length - 1);
        path = path.slice(0, lineIndex) + ':' + lineS.split(',').join(':');
        path = `(file:///${path})`;
    }
    else {
        return;
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
