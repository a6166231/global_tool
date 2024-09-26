"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectFilesfunc = exports.collectAllExtendsClass = exports.unload = exports.load = exports.methods = exports.getTemplateList = exports.getCfgJson = exports.TemplateType = void 0;
// @ts-ignore
const package_json_1 = __importDefault(require("../package.json"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importStar(require("fs"));
const MVCModel_1 = require("./panels/default/MVCModel");
const util_1 = __importDefault(require("./panels/default/util"));
const path_2 = __importDefault(require("path"));
const { promisify } = require('util');
var TemplateType;
(function (TemplateType) {
    TemplateType["script"] = "script";
    TemplateType["prefab"] = "prefab";
    TemplateType["res"] = "res";
})(TemplateType = exports.TemplateType || (exports.TemplateType = {}));
let cfgJson;
async function getLocalCfgJson() {
    if (!cfgJson) {
        let json = await (0, fs_1.readFileSync)(path_2.default.join(Editor.Package.getPath(package_json_1.default.name), 'src/cfg.json'));
        if (json) {
            cfgJson = JSON.parse(json.toString());
        }
        else {
            console.error("can't load cfg.json file!");
        }
    }
    return cfgJson;
}
function getCfgJson() {
    return getLocalCfgJson();
}
exports.getCfgJson = getCfgJson;
async function getTemplateList() {
    if (!cfgJson) {
        await getLocalCfgJson();
    }
    return (cfgJson === null || cfgJson === void 0 ? void 0 : cfgJson.mvc) || [];
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
    focusMainWindows() {
        var _a;
        let ele = require('electron');
        let allwindows = ((_a = ele.BrowserWindow) === null || _a === void 0 ? void 0 : _a.getAllWindows()) || [];
        for (let win of allwindows) {
            win.focus();
            win.setAlwaysOnTop(true);
            win.setAlwaysOnTop(false);
        }
        ele.app.focus();
    }
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
    let layer = (await getTemplateList()).find(item => { return item.name == MVCModel_1.MVCModelName.Layer; });
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
exports.get = [{
        url: '/mvc/open-prefab',
        async handle(req, res, next) {
            let query = (req === null || req === void 0 ? void 0 : req.query) || '';
            if (query.length == 0)
                return;
            console.log('ready to open prefab: ', query.uuid);
            await Editor.Message.request('asset-db', 'open-asset', query.uuid);
            Editor.Message.send('mvc', 'focus-main-windows');
            res.send('success');
        },
    }, {
        url: '/mvc/open-script',
        async handle(req, res, next) {
            let query = (req === null || req === void 0 ? void 0 : req.query) || '';
            if (query.length == 0)
                return;
            let ppath = 'db://' + path_2.default.relative(Editor.Project.path, query.path);
            console.log('ready to open script: ', ppath);
            await Editor.Message.request('asset-db', 'open-asset', ppath);
            res.send('success');
        },
    }];
