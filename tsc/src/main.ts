//@ts-ignore
import { exec } from 'child_process'
import fs from 'fs';
import path from 'path';

var bIsRunning: boolean = false;
var bakUpUrl: string[] = [];

var tsCfg: string;

var updateTsConfig = async function (status: boolean) {
    return new Promise(async (resolve, reject) => {
        const cfgPath = path.join(Editor.Project.path, 'tsconfig.json');
        console.log('cfgpath : ', cfgPath)
        if (status) {
            fs.readFile(cfgPath, 'utf-8', async (err, data) => {
                if (!err) {
                    tsCfg = data;
                    let obj = JSON.parse(spliceNote(data));
                    if (obj.compilerOptions) {
                        obj.compilerOptions.skipLibCheck = true;
                    } else {
                        obj.compilerOptions = {
                            'skipLibCheck': true,
                        }
                    }
                    await writeTsConfig(JSON.stringify(obj));
                    resolve(null);
                } else {
                    reject(err);
                }
            });
        } else {
            await writeTsConfig(tsCfg);
            resolve(null);
        }
    })
}

var spliceNote = function (str: string) {
    let split = str.split('\n')
    for (let i = 0; i < split.length; i++) {
        if (split[i].indexOf('//') >= 0 || split[i].indexOf('/*') >= 0 || split[i].indexOf('*/') >= 0) {
            split.splice(i, 1);
            i--;
        }
    }
    return split.join('\n');
}

var writeTsConfig = async function (data: string) {
    return await fs.writeFileSync(path.join(Editor.Project.path, 'tsconfig.json'), data, 'utf-8');
}

var tsc_b = async function () {
    if (bIsRunning) return;
    await updateTsConfig(true);
    bakUpUrl = [];
    bIsRunning = true;
    let cmd = 'tsc -b ' + Editor.Project.path
    console.log('- start -')
    exec(cmd, async (err, stdout, stderr) => {
        let out = stdout.split('\n');
        for (let info of out) {
            formatErrorInfo(info)
        }
        bIsRunning = false;
        console.log('total :', bakUpUrl.length)
        await updateTsConfig(false);
        console.log('- over -')

        // console.log('\x1B[32m%s\x1B[0m', 'success')
        // console.log('%c在这个符号后的信息是红色','color: green')
    })
}

/**
 * @en 
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    startBuildTs() {
        tsc_b()
    },
    async startBuildTsAndOpen() {
        if (bakUpUrl.length == 0) {
            await tsc_b()
        }
        for (let path of bakUpUrl) {
            Editor.Message.request('asset-db', 'query-uuid', path).then((uuid) => {
                if (uuid)
                    Editor.Message.send('asset-db', 'open-asset', uuid);
            }).catch(err => {
                console.error(err)
            });
        }
    },
};

var formatErrorInfo = async function (data: string) {
    let indexOf = data.indexOf(': ');
    let bakPath, path
    bakPath = path = data.slice(0, indexOf);

    let lineIndex = path.indexOf('(');
    if (data.indexOf('error') >= 0 && lineIndex >= 0 && path.indexOf(')')) {
        let p = path.slice(0, lineIndex)
        p = p.replace(PPATH, 'db:/')
        bakUpUrl.push(p);

        let lineS = path.slice(lineIndex + 1, path.length - 1);
        path = path.slice(0, lineIndex) + ':' + lineS.split(',').join(':')

        path = `(file:///${path})`
    } else {
        path = '&emsp;-' + path;
    }
    data = data.replace(bakPath, path)
    console.log(`${data}`)
}

var PPATH: string;

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export function load() {
    PPATH = Editor.Project.path.split('\\').join('/')
}

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export function unload() { }
