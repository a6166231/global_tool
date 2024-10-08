"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.noticeExtendsMap = void 0;
const path_1 = __importDefault(require("path"));
const messageManager_1 = require("./messageManager");
const watcher_1 = require("./watcher");
const child_process_1 = require("child_process");
var ppath;
var getProjectPath = () => {
    if (!ppath) {
        //@ts-ignore
        ppath = path_1.default.join(Editor.Project.path, '/').replaceAll('\\', '/');
    }
    return ppath;
};
var openPrefab = async (req, res, next) => {
    let query = (req === null || req === void 0 ? void 0 : req.query) || '';
    if (query.length == 0)
        return;
    console.log('ready to open prefab: ', query.uuid);
    await Editor.Message.request('asset-db', 'open-asset', query.uuid);
    Editor.Message.send('notice_extends', 'focus-main-windows');
    res.send('success');
};
var openScript = async (req, res, next) => {
    let query = (req === null || req === void 0 ? void 0 : req.query) || '';
    if (query.length == 0)
        return;
    let ppath = 'db://' + path_1.default.relative(Editor.Project.path, query.path);
    console.log('ready to open script: ', ppath);
    await Editor.Message.request('asset-db', 'open-asset', ppath);
    res.send('success');
};
var refreshTsScript = async (req, res, next) => {
    let promiseList = [];
    let scriptBakMap = {
        [watcher_1.ResBroadcast.Add]: [],
        [watcher_1.ResBroadcast.Change]: [],
        [watcher_1.ResBroadcast.Delete]: [],
    };
    let addMap = messageManager_1.MessageManager.getInstance(messageManager_1.MessageManager).getChangeMapByType(watcher_1.ResBroadcast.Add);
    for (let [k, item] of addMap) {
        scriptBakMap[watcher_1.ResBroadcast.Add].push(item.path);
        promiseList.push(Editor.Message.request('asset-db', 'refresh-asset', item.path.replace(getProjectPath(), 'db://')));
    }
    let changeMap = messageManager_1.MessageManager.getInstance(messageManager_1.MessageManager).getChangeMapByType(watcher_1.ResBroadcast.Change);
    for (let [k, item] of changeMap) {
        scriptBakMap[watcher_1.ResBroadcast.Change].push(item.path);
        promiseList.push(Editor.Message.request('asset-db', 'refresh-asset', item.path.replace(getProjectPath(), 'db://')));
    }
    let delMap = messageManager_1.MessageManager.getInstance(messageManager_1.MessageManager).getChangeMapByType(watcher_1.ResBroadcast.Delete);
    for (let [k, item] of delMap) {
        scriptBakMap[watcher_1.ResBroadcast.Delete].push(item.path);
        promiseList.push(Editor.Message.request('asset-db', 'refresh-asset', item.path.replace(getProjectPath(), 'db://')));
    }
    await Promise.all(promiseList).catch(err => {
        console.log(err);
    });
    messageManager_1.MessageManager.getInstance(messageManager_1.MessageManager).clearChangeMap();
    res.writeHead(200);
    res.write(JSON.stringify(scriptBakMap));
    res.end();
};
function clearBakTsScript(req, res, next) {
    res.writeHead(200);
    res.end();
    messageManager_1.MessageManager.getInstance(messageManager_1.MessageManager).clearChangeMap();
}
function cmd(cmd, callback) {
    (0, child_process_1.exec)(cmd, callback);
}
exports.noticeExtendsMap = {
    map: [{
            url: '/notice_extends/open-prefab',
            handle: openPrefab,
        }, {
            url: '/notice_extends/open-script',
            handle: openScript,
        }, {
            url: '/notice_extends/refresh-scripts',
            handle: refreshTsScript,
        }, {
            url: '/notice_extends/clear-bak-scripts',
            handle: clearBakTsScript,
        }]
};
