import { MessageManager } from "./messageManager";
import { noticeExtendsMap } from "./noticeExtendsMap";
import { Watcher } from "./watcher";

/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
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

var addListener = () => {
    console.log(new Date())
    Watcher.getInstance(Watcher).addListener()
}

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export function load() {
    Editor.Message.addBroadcastListener("asset-db:ready", addListener)
}

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export function unload() {
    Editor.Message.removeBroadcastListener("asset-db:ready", addListener)
    Watcher.getInstance(Watcher).removeListener()
}

exports.get = noticeExtendsMap.map