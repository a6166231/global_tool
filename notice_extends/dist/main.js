"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
const noticeExtendsMap_1 = require("./noticeExtendsMap");
const watcher_1 = require("./watcher");
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
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
var addListener = () => {
    console.log(new Date());
    watcher_1.Watcher.getInstance(watcher_1.Watcher).addListener();
};
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
function load() {
    Editor.Message.addBroadcastListener("asset-db:ready", addListener);
}
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
function unload() {
    Editor.Message.removeBroadcastListener("asset-db:ready", addListener);
    watcher_1.Watcher.getInstance(watcher_1.Watcher).removeListener();
}
exports.unload = unload;
exports.get = noticeExtendsMap_1.noticeExtendsMap.map;
