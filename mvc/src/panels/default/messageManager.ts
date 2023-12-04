import { IAssetMeta } from "../../../@types/packages/asset-db/@types/public";
import { IAssetInfo } from "../../../@types/packages/package-asset/@types/public";
import { ScriptDataModel } from "../../main";
import { mvc } from "./mvc";
import { singleton } from "./singleton";

export enum ResBroadcast {
    Add = 'asset-db:asset-add',
    Change = 'asset-db:asset-change',
    Delete = 'asset-db:asset-delete',
}

export class MessageManager extends singleton {
    //@ts-ignore
    private _call: (type: ResBroadcast) => any = null;

    private messageMap: Record<string, Function> = {};

    addListener() {
        this.messageMap[ResBroadcast.Add] = (p1: any, p2: IAssetInfo, p3: IAssetMeta) => {
            this.resAdd(p1, p2, p3)
        }
        this.messageMap[ResBroadcast.Change] = (p1: any, p2: IAssetInfo, p3: IAssetMeta) => {
            this.resChange(p1, p2, p3)
        }
        this.messageMap[ResBroadcast.Delete] = (p1: any, p2: IAssetInfo, p3: IAssetMeta) => {
            this.resDel(p1, p2, p3)
        }

        Editor.Message.addBroadcastListener(ResBroadcast.Add, this.messageMap[ResBroadcast.Add])
        Editor.Message.addBroadcastListener(ResBroadcast.Change, this.messageMap[ResBroadcast.Change])
        Editor.Message.addBroadcastListener(ResBroadcast.Delete, this.messageMap[ResBroadcast.Delete])
    }

    removeListener() {
        Editor.Message.removeBroadcastListener(ResBroadcast.Add, this.messageMap[ResBroadcast.Add])
        Editor.Message.removeBroadcastListener(ResBroadcast.Change, this.messageMap[ResBroadcast.Change])
        Editor.Message.removeBroadcastListener(ResBroadcast.Delete, this.messageMap[ResBroadcast.Delete])
    }

    triggerListener(type: ResBroadcast) {
        this._call && this._call(type);
    }

    setResChangeCall(call: (type: ResBroadcast) => any) {
        //@ts-ignore
        this._call = call;
    }

    /** p1暂时不知道是作什么用的 */
    private resAdd(p1: any, p2: IAssetInfo, p3: IAssetMeta) {
        //是ts类型的
        if (p2.importer == 'typescript') {
            this.setMapScriptItem(p2.uuid, p2.name, p2.path)
            this.triggerListener(ResBroadcast.Add);
        }
    }
    /** p1暂时不知道是作什么用的 
     * 文件修改名字或者内容更新都会走change消息
    */
    private resChange(p1: any, p2: IAssetInfo, p3: IAssetMeta) {
        //是ts类型的
        if (p2.importer == 'typescript') {
            let has = mvc.scriptMgr().getScript(p2.uuid) as ScriptDataModel;
            if (!has) {
                this.setMapScriptItem(p2.uuid, p2.name, p2.file)
            } else {
                if (has.name != p2.name) {//文件名改了 先把旧名字的删掉
                    this.delMapScriptItem(p2.uuid, has.name)
                    this.setMapScriptItem(p2.uuid, p2.name, p2.path)
                }
            }
            this.triggerListener(ResBroadcast.Change);
        };
    }
    /** p1暂时不知道是作什么用的 */
    private resDel(p1: any, p2: IAssetInfo, p3: IAssetMeta) {
        //是ts类型的
        if (p2.importer == 'typescript') {
            this.delMapScriptItem(p2.uuid, p2.name)
            this.triggerListener(ResBroadcast.Delete);
        };
    }

    private setMapScriptItem(uuid: string, name: string, path: string) {
        mvc.scriptMgr().setScript(uuid, name.replace('.ts', ''), path)
    }
    private delMapScriptItem(uuid: string, name: string) {
        mvc.scriptMgr().delScript(uuid, name.replace('.ts', ''))
    }
}