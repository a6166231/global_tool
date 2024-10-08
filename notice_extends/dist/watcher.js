"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Watcher = exports.ResBroadcast = void 0;
const path_1 = __importDefault(require("path"));
const singleton_1 = require("./singleton");
const chokidar_1 = __importDefault(require("chokidar"));
const messageManager_1 = require("./messageManager");
var ResBroadcast;
(function (ResBroadcast) {
    ResBroadcast["Add"] = "add";
    ResBroadcast["Change"] = "change";
    ResBroadcast["Delete"] = "unlink";
})(ResBroadcast = exports.ResBroadcast || (exports.ResBroadcast = {}));
function tsLike(path) {
    return path.endsWith('.ts') && !path.endsWith('.d.ts');
}
class Watcher extends singleton_1.singleton {
    constructor() {
        super(...arguments);
        this.watcher = null;
    }
    addListener() {
        //@ts-ignore
        let ppath = path_1.default.join(Editor.Project.path, 'assets').replaceAll('\\', '/');
        this.watcher = chokidar_1.default.watch(ppath, {
            ignored: /(^|[\/\\])\../,
            persistent: true,
        });
        this.watcher
            .on('add', this.onFileAdd)
            .on('change', this.onFileChange)
            .on('unlink', this.onFileDelete);
    }
    onFileAdd(path) {
        if (!tsLike(path))
            return;
        messageManager_1.MessageManager.getInstance(messageManager_1.MessageManager).resAdd(path);
    }
    onFileChange(path) {
        if (!tsLike(path))
            return;
        messageManager_1.MessageManager.getInstance(messageManager_1.MessageManager).resChange(path);
    }
    onFileDelete(path) {
        if (!tsLike(path))
            return;
        messageManager_1.MessageManager.getInstance(messageManager_1.MessageManager).resDel(path);
    }
    removeListener() {
        this.watcher.off('add', this.onFileAdd);
        this.watcher.off('change', this.onFileAdd);
        this.watcher.off('unlink', this.onFileAdd);
        //@ts-ignore
        this.watcher.unwatch(path_1.default.join(Editor.Project.path, 'assets').replaceAll('\\', '/'));
    }
}
exports.Watcher = Watcher;
