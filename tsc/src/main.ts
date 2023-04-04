//@ts-ignore
import { exec } from 'child_process'

var bIsRunning: boolean = false;

var bakUpUrl: string[] = [];

var tsc_b = function () {
    if (bIsRunning) return;
    bakUpUrl = [];
    bIsRunning = true;
    let cmd = 'tsc -b ' + Editor.Project.path
    console.log('- start -')
    let cp = exec(cmd, (err, stdout, stderr) => {
        bIsRunning = false;
        console.log('total :', bakUpUrl.length)
        console.log('- over -')
        // console.log('\x1B[32m%s\x1B[0m', 'success')
        // console.log('%c在这个符号后的信息是红色','color: green')
    })
    cp.stdout?.on('data', formatErrorInfo);
    cp.stderr?.on('data', formatErrorInfo);
}

/**
 * @en 
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    startBuildTs() {
        tsc_b()
    },
    startBuildTsAndOpen() {
        if (bakUpUrl.length == 0) {
            tsc_b()
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
    if (lineIndex >= 0) {
        let lineS = path.slice(lineIndex + 1, path.length - 1);
        path = path.slice(0, lineIndex) + ':' + lineS.split(',').join(':')

        let p = path.slice(0, lineIndex)
        p = p.replace(PPATH, 'db:/')
        bakUpUrl.push(p);
    }
    data = data.replace(bakPath, `(file:///${path})`)
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
