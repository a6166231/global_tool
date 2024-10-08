import path from "path";
import { MessageManager } from "./messageManager";
import { ServerResponse } from "http";
import { ResBroadcast } from "./watcher";
import { exec, ExecException } from "child_process";


var ppath: string
var getProjectPath = () => {
    if (!ppath) {
        //@ts-ignore
        ppath = path.join(Editor.Project.path, '/').replaceAll('\\', '/')
    }
    return ppath
}

var openPrefab = async (req: any, res: any, next: any) => {
    let query = req?.query || ''
    if (query.length == 0) return
    console.log('ready to open prefab: ', query.uuid)
    await Editor.Message.request('asset-db', 'open-asset', query.uuid);

    Editor.Message.send('notice_extends', 'focus-main-windows')

    res.send('success');
}
var openScript = async (req: any, res: any, next: any) => {
    let query = req?.query || ''
    if (query.length == 0) return
    let ppath = 'db://' + path.relative(Editor.Project.path, query.path)
    console.log('ready to open script: ', ppath)
    await Editor.Message.request('asset-db', 'open-asset', ppath)
    res.send('success');
}

var refreshTsScript = async (req: any, res: ServerResponse, next: any) => {
    let promiseList: Promise<any>[] = []
    let scriptBakMap: Record<ResBroadcast, Array<string>> = {
        [ResBroadcast.Add]: [],
        [ResBroadcast.Change]: [],
        [ResBroadcast.Delete]: [],
    } as any

    let addMap = MessageManager.getInstance(MessageManager).getChangeMapByType(ResBroadcast.Add)

    for (let [k, item] of addMap) {
        scriptBakMap[ResBroadcast.Add].push(item.path)
        promiseList.push(Editor.Message.request('asset-db', 'refresh-asset', item.path.replace(getProjectPath(), 'db://')))
    }
    let changeMap = MessageManager.getInstance(MessageManager).getChangeMapByType(ResBroadcast.Change)
    for (let [k, item] of changeMap) {
        scriptBakMap[ResBroadcast.Change].push(item.path)
        promiseList.push(Editor.Message.request('asset-db', 'refresh-asset', item.path.replace(getProjectPath(), 'db://')))
    }
    let delMap = MessageManager.getInstance(MessageManager).getChangeMapByType(ResBroadcast.Delete)
    for (let [k, item] of delMap) {
        scriptBakMap[ResBroadcast.Delete].push(item.path)
        promiseList.push(Editor.Message.request('asset-db', 'refresh-asset', item.path.replace(getProjectPath(), 'db://')))
    }

    await Promise.all(promiseList).catch(err => {
        console.log(err)
    })
    MessageManager.getInstance(MessageManager).clearChangeMap()

    res.writeHead(200);
    res.write(JSON.stringify(scriptBakMap))
    res.end()
}

function clearBakTsScript(req: any, res: ServerResponse, next: any) {
    res.writeHead(200);
    res.end()
    MessageManager.getInstance(MessageManager).clearChangeMap()
}

function cmd(cmd: string, callback?: (error: ExecException | null, stdout: string, stderr: string) => void) {
    exec(cmd, callback)
}

export var noticeExtendsMap = {
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
}