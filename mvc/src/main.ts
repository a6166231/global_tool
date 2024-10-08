// @ts-ignore
import packageJSON from '../package.json';
import Path from 'path';
import Fs, { readFileSync } from 'fs';
import { MVCModelName } from './panels/default/MVCModel';
import Utils from './panels/default/util';
import { AssetInfo } from '../@types/packages/asset-db/@types/public';
import path from 'path';
const { promisify } = require('util');

export enum TemplateType {
    script = 'script',
    prefab = 'prefab',
    res = 'res'
}

export interface TemplateModel {
    name: MVCModelName,
    classPath?: string,
    /** 输出路径 */
    outPath: string,
    /** 是否需要自动生成文件路径 */
    autoPath?: boolean,
    /** 是否要链接其他类 */
    link?: MVCModelName,
    /** 路径拼接字段 */
    appendPath?: string,

    type: TemplateType,
}

export interface ScriptDataModel {
    trueName: string,
    name: string,
    path: string,
}

let cfgJson: {
    mvc: Array<TemplateModel>,
    NoticeTable: string,
    LayerTable: string,
    ProxyTable: string,
    JumpLayerProxy: string,
    WorldProxyTable: string,
    WorldMediatorTable: string,
    ProtocolPath: string,
};

async function getLocalCfgJson() {
    if (!cfgJson) {
        let json = await readFileSync(path.join(Editor.Package.getPath(packageJSON.name)!, 'src/cfg.json'))
        if (json) {
            cfgJson = JSON.parse(json.toString())
        } else {
            console.error("can't load cfg.json file!")
        }
    }
    return cfgJson;
}

export function getCfgJson() {
    return getLocalCfgJson()
}

export async function getTemplateList(): Promise<TemplateModel[]> {
    if (!cfgJson) {
        await getLocalCfgJson()
    }
    return cfgJson?.mvc || [];
}

/**
 * @en 
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    async openMVCPanel() {
        Editor.Panel.open(packageJSON.name);
    },

    focusMainWindows() {
        let ele = require('electron')
        let allwindows = ele.BrowserWindow?.getAllWindows() || []
        for (let win of allwindows) {
            win.focus()
            win.setAlwaysOnTop(true)
            win.setAlwaysOnTop(false)
        }
        ele.app.focus()
    }
};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export async function load() {
}

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export function unload() {
}

export let collectAllExtendsClass = async function (mapScript: Map<string, ScriptDataModel | string>, layerScript: Map<string, string> = new Map): Promise<Map<string, string>> {
    let layer = (await getTemplateList()).find(item => { return item.name == MVCModelName.Layer });
    if (!layer || !layer.classPath) return new Map;
    let name = Path.basename(layer.classPath).replace('.ts', "")
    let layerList = await Editor.Message.request("scene", "query-classes", { extends: name })
    for (let item of layerList) {
        let uuid = mapScript.get(item.name.toLowerCase())
        if (uuid && name != item.name)
            layerScript.set(uuid as string, item.name)
    }
    return layerScript;
}

/**
 * 收集项目中的文件信息
 */
export let collectFilesfunc = async function (mapScript: Map<string, ScriptDataModel | string> = new Map, modelScript: Map<string, string> = new Map): Promise<[Map<string, ScriptDataModel | string>, Map<string, string>]> {
    // 文件处理函数
    const handler = async (path: string) => {
        // 过滤
        if (filter(path)) {
            const name = Path.basename(path).replace('.ts', '')
            let info: AssetInfo = await Editor.Message.request('asset-db', 'query-asset-info', path)
            let uuid = info.uuid;
            mapScript.set(uuid, {
                trueName: name,
                name: name.toLowerCase(),
                path: path,
            })
            mapScript.set(name.toLowerCase(), uuid)

            if (Utils.checkModel(name))
                modelScript.set(uuid, name)
        }
    }
    // 遍历项目文件
    const assetsPath = Path.join(Editor.Project.path, 'assets');
    await map(assetsPath, handler);
    return [mapScript, modelScript]
}

/**
 * 过滤文件
 * @param {string} path 路径
 * @returns {boolean}
 */
let filter = function (path: string) {
    const extname = Path.extname(path);
    return extname === '.ts';
}

/**
 * 遍历文件/文件夹并执行函数
 * @param {Fs.PathLike} path 路径
 * @param {(filePath: Fs.PathLike, stat: Fs.Stats) => void | Promise<void>} handler 处理函数
 */
let map = async function (path: string, handler: Function) {
    if (!Fs.existsSync(path)) {
        return;
    }
    return new Promise((resolve, reject) => {
        Fs.stat(path, async (err, stats) => {
            if (stats.isDirectory()) {
                const names = await promisify(Fs.readdir)(path);
                for (const name of names) {
                    await map(Path.join(path, name), handler);
                }
            } else {
                await handler(path, stats);
            }
            resolve(null);
        });
    })
}

exports.get = [{
    url: '/mvc/open-prefab',
    async handle(req: any, res: any, next: any) {
        let query = req?.query || ''
        if (query.length == 0) return
        console.log('ready to open prefab: ', query.uuid)
        await Editor.Message.request('asset-db', 'open-asset', query.uuid);

        Editor.Message.send('mvc', 'focus-main-windows')

        res.send('success');
    },
}, {
    url: '/mvc/open-script',
    async handle(req: any, res: any, next: any) {
        let query = req?.query || ''
        if (query.length == 0) return
        let ppath = 'db://' + path.relative(Editor.Project.path, query.path)
        console.log('ready to open script: ', ppath)
        await Editor.Message.request('asset-db', 'open-asset', ppath)
        res.send('success');
    },
}];
