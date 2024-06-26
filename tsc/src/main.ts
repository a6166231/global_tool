//@ts-ignore
import { exec } from 'child_process'
import fs from 'fs';
import path from 'path';

var bIsRunning: boolean = false;
var bakUpUrl: string[] = [];

var filterList: string[] = [
    'protocol',
    'extensions'
];

var tsCfg: string;

var updateTsConfig = async function (status: boolean) {
    return new Promise(async (resolve, reject) => {
        const cfgPath = path.join(Editor.Project.path, 'tsconfig.json');
        // console.log('cfgpath : ', cfgPath)
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

function removeTrailingCommas(jsonStr:string) {
    // 正则表达式匹配在对象或数组的最后一个元素后面的逗号
    const regex = /(?<=(?:\{|\[)(?:[^{}\[\]]|"[^"]*"?|'[^']*'?)*)(,)(?=\s*[}\]])/g;
    return jsonStr.replace(regex, '');
}

var spliceNote = function (str: string) {
    let split = str.split('\n')
    for (let i = 0; i < split.length; i++) {
        if (split[i].indexOf('//') >= 0 || split[i].indexOf('/*') >= 0 || split[i].indexOf('*/') >= 0) {
            split.splice(i, 1);
            i--;
        }
    }
    return removeTrailingCommas(split.join('\n'));
}

var writeTsConfig = async function (data: string) {
    return await fs.writeFileSync(path.join(Editor.Project.path, 'tsconfig.json'), data, 'utf-8');
}

var tsc_b = async function (bFilter: boolean = true) {
    if (bIsRunning) return;
    await updateTsConfig(true);
    bakUpUrl = [];
    bIsRunning = true;
    let cmd = 'tsc -p ' + Editor.Project.path
    console.log('- start -')
    exec(cmd, async (err, stdout, stderr) => {
        console.log('======================')
        let out = stdout.split('\n');

        if (bFilter) {
            for (let info of out) {
                if (checkFilter(info))
                    formatErrorInfo(info)
            }
        } else {
            for (let info of out) {
                formatErrorInfo(info)
            }
        }
        console.log('total :', bakUpUrl.length)
        await updateTsConfig(false);
        bIsRunning = false;
        console.log('- over -')

        // console.log('\x1B[32m%s\x1B[0m', 'success')
        // console.log('%c在这个符号后的信息是红色','color: red')
    })
}

var checkFilter = function (info: string) {
    for (let f of filterList) {
        if (info.indexOf(f) >= 0) return false;
    }
    return true;
}

/**
 * @en 
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    startBuildTs() {
        tsc_b();
    },
    startBuildNoFilter() {
        tsc_b(false);
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
    if (data.indexOf(PPATH) == 0 && data.indexOf('error') >= 0 && lineIndex >= 0 && path.indexOf(')')) {
        let p = path.slice(0, lineIndex)
        p = p.replace(PPATH, 'db:/')
        //@ts-ignore
        if (!bakUpUrl[p]) {
            //@ts-ignore
            bakUpUrl[p] = p;
            bakUpUrl.push(p);
        }

        let lineS = path.slice(lineIndex + 1, path.length - 1);
        path = path.slice(0, lineIndex) + ':' + lineS.split(',').join(':')
        path = path.replace(new RegExp('/','g'),'\\')
        path = `{link(${path})}`
    } else {
        return
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
