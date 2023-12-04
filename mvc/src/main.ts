// @ts-ignore
import packageJSON from '../package.json';
import Path from 'path';
import Fs from 'fs';
import { MVCModelName } from './panels/default/MVCModel';
import Utils from './panels/default/util';
import { AssetInfo } from '../@types/packages/asset-db/@types/public';
const { promisify } = require('util');

export enum TemplateType {
    script,
    prefab,
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

let templateList: TemplateModel[] = [
    {
        name: MVCModelName.Mediator,
        classPath: 'db://assets/scripts/game/mediator/BaseUIMediator.ts',
        outPath: 'db://assets/scripts/game/mediator/',
        autoPath: true,
        link: MVCModelName.Layer,
        type: TemplateType.script,
    },
    {
        name: MVCModelName.Layer,
        classPath: 'db://assets/scripts/game/view/BaseUINode.ts',
        outPath: 'db://assets/scripts/game/view/layersui/',
        autoPath: true,
        appendPath: '_layer',
        type: TemplateType.script,
    },
    {
        name: MVCModelName.Proxy,
        classPath: 'db://assets/scripts/game/proxy/RemoteProxy.ts',
        outPath: 'db://assets/scripts/game/proxy/remote/',
        link: MVCModelName.Model,
        type: TemplateType.script,
    },
    {
        name: MVCModelName.Prefab,
        outPath: 'db://assets/resources/prefab/game/',
        appendPath: '_layer',
        autoPath: true,
        type: TemplateType.prefab,
    },
];

export function getTemplateList(): TemplateModel[] {
    return templateList;
}

/**
 * @en 
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    async openMVCPanel() {
        Editor.Panel.open(packageJSON.name);
    },
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
    let layer = templateList.find(item => { return item.name == MVCModelName.Layer });
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