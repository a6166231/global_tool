import path from "path";
import { singleton } from "./singleton";
import chokidar, { FSWatcher } from 'chokidar';
import { MessageManager } from "./messageManager";

export enum ResBroadcast {
    Add = 'add',
    Change = 'change',
    Delete = 'unlink',
}

function tsLike(path: string) {
    return path.endsWith('.ts') && !path.endsWith('.d.ts')
}
export class Watcher extends singleton {
    private watcher: FSWatcher = null as any;
    addListener() {
        //@ts-ignore
        let ppath = path.join(Editor.Project.path, 'assets').replaceAll('\\', '/')
        this.watcher = chokidar.watch(ppath, {
            ignored: /(^|[\/\\])\../,
            persistent: true,
        });

        this.watcher
            .on('add', this.onFileAdd)
            .on('change', this.onFileChange)
            .on('unlink', this.onFileDelete);
    }

    onFileAdd(path: string) {
        if (!tsLike(path)) return
        MessageManager.getInstance(MessageManager).resAdd(path)
    }
    onFileChange(path: string) {
        if (!tsLike(path)) return
        MessageManager.getInstance(MessageManager).resChange(path)
    }
    onFileDelete(path: string) {
        if (!tsLike(path)) return
        MessageManager.getInstance(MessageManager).resDel(path)
    }

    removeListener() {
        this.watcher.off('add', this.onFileAdd)
        this.watcher.off('change', this.onFileAdd)
        this.watcher.off('unlink', this.onFileAdd)
        //@ts-ignore
        this.watcher.unwatch(path.join(Editor.Project.path, 'assets').replaceAll('\\', '/'))
    }
}