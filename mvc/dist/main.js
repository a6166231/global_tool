"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectFilesfunc = exports.collectAllExtendsClass = exports.unload = exports.load = exports.methods = exports.getTemplateList = exports.TemplateType = void 0;
// @ts-ignore
const package_json_1 = __importDefault(require("../package.json"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const MVCModel_1 = require("./panels/default/MVCModel");
const util_1 = __importDefault(require("./panels/default/util"));
const { promisify } = require('util');
var TemplateType;
(function (TemplateType) {
    TemplateType[TemplateType["script"] = 0] = "script";
    TemplateType[TemplateType["prefab"] = 1] = "prefab";
})(TemplateType = exports.TemplateType || (exports.TemplateType = {}));
let templateList = [
    {
        name: MVCModel_1.MVCModelName.Mediator,
        classPath: 'db://assets/scripts/game/mediator/BaseUIMediator.ts',
        outPath: 'db://assets/scripts/game/mediator/',
        autoPath: true,
        link: MVCModel_1.MVCModelName.Layer,
        type: TemplateType.script,
    },
    {
        name: MVCModel_1.MVCModelName.Layer,
        classPath: 'db://assets/scripts/game/view/BaseUINode.ts',
        outPath: 'db://assets/scripts/game/view/layersui/',
        autoPath: true,
        appendPath: '_layer',
        type: TemplateType.script,
    },
    {
        name: MVCModel_1.MVCModelName.Proxy,
        classPath: 'db://assets/scripts/game/proxy/RemoteProxy.ts',
        outPath: 'db://assets/scripts/game/proxy/remote/',
        link: MVCModel_1.MVCModelName.Model,
        type: TemplateType.script,
    },
    {
        name: MVCModel_1.MVCModelName.Prefab,
        outPath: 'db://assets/resources/prefab/game/',
        appendPath: '_layer',
        autoPath: true,
        type: TemplateType.prefab,
    },
];
function getTemplateList() {
    return templateList;
}
exports.getTemplateList = getTemplateList;
/**
 * @en
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    async openMVCPanel() {
        Editor.Panel.open(package_json_1.default.name);
    },
};
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
async function load() {
}
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
function unload() {
}
exports.unload = unload;
let collectAllExtendsClass = async function (mapScript, layerScript = new Map) {
    let layer = templateList.find(item => { return item.name == MVCModel_1.MVCModelName.Layer; });
    if (!layer || !layer.classPath)
        return new Map;
    let name = path_1.default.basename(layer.classPath).replace('.ts', "");
    let layerList = await Editor.Message.request("scene", "query-classes", { extends: name });
    for (let item of layerList) {
        let uuid = mapScript.get(item.name.toLowerCase());
        if (uuid && name != item.name)
            layerScript.set(uuid, item.name);
    }
    return layerScript;
};
exports.collectAllExtendsClass = collectAllExtendsClass;
/**
 * 收集项目中的文件信息
 */
let collectFilesfunc = async function (mapScript = new Map, modelScript = new Map) {
    // 文件处理函数
    const handler = async (path) => {
        // 过滤
        if (filter(path)) {
            const name = path_1.default.basename(path).replace('.ts', '');
            let info = await Editor.Message.request('asset-db', 'query-asset-info', path);
            let uuid = info.uuid;
            mapScript.set(uuid, {
                trueName: name,
                name: name.toLowerCase(),
                path: path,
            });
            mapScript.set(name.toLowerCase(), uuid);
            if (util_1.default.checkModel(name))
                modelScript.set(uuid, name);
        }
    };
    // 遍历项目文件
    const assetsPath = path_1.default.join(Editor.Project.path, 'assets');
    await map(assetsPath, handler);
    return [mapScript, modelScript];
};
exports.collectFilesfunc = collectFilesfunc;
/**
 * 过滤文件
 * @param {string} path 路径
 * @returns {boolean}
 */
let filter = function (path) {
    const extname = path_1.default.extname(path);
    return extname === '.ts';
};
/**
 * 遍历文件/文件夹并执行函数
 * @param {Fs.PathLike} path 路径
 * @param {(filePath: Fs.PathLike, stat: Fs.Stats) => void | Promise<void>} handler 处理函数
 */
let map = async function (path, handler) {
    if (!fs_1.default.existsSync(path)) {
        return;
    }
    return new Promise((resolve, reject) => {
        fs_1.default.stat(path, async (err, stats) => {
            if (stats.isDirectory()) {
                const names = await promisify(fs_1.default.readdir)(path);
                for (const name of names) {
                    await map(path_1.default.join(path, name), handler);
                }
            }
            else {
                await handler(path, stats);
            }
            resolve(null);
        });
    });
};
