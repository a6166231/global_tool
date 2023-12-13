import path from "path";
import { TemplateModel, getCfgJson } from "../../main";
import { AssetItem, MVCModel, MVCModelName, ScriptLinkModel } from "./MVCModel";
import Utils from "./util";
import packageJSON from '../../../package.json';
import { CINoticeTable } from "./customInject/CINoticeTable";
import { CIBase } from "./customInject/CIBase";
import { CILayerTable } from "./customInject/CILayerTable";
import { CIWorldMediatorTable } from "./customInject/CIWorldMediatorTable";
import { CIWorldProxyTable } from "./customInject/CIWorldProxyTable";
import { CIProxyLink } from "./customInject/CIProxyLink";
import { CIProxyTable } from "./customInject/CIProxyTable";

export enum TemplateStr {
    Author = '<%Author%>',
    Time = '<%DateTime%>',
    URL = '<%URL%>',

    ClassName = '<%CamelCaseClassName%>',
    TypeClass = '<%TypeClassName%>',
    InterfaceClassName = '<%InterfaceClassName%>',

    AppendPath = '<%AppendPath%>',
    Constructor = '<%Constructor%>',

    ProxyReq = "<%ProxyReq%>",
    ProxyReqID = "<%ProxyReqID%>",

    ProxyRes = "<%ProxyRes%>",
    ProxyResID = "<%ProxyResID%>",

    IndexStr = "<%IndexStr%>",

    SelectDivStr = "<%SelectDivStr%>",

    PrefabTemplate = "PrefabTemplate",
}

export const TemplateScriptMap = {
    selectDiv: `<option value="${TemplateStr.SelectDivStr}">${TemplateStr.SelectDivStr}</option>`,
    mediatorConstructor:
        `${TemplateStr.Constructor};
        this._url = Global.MMO.PATH_PREFAB_GAME + "${TemplateStr.AppendPath}/${TemplateStr.InterfaceClassName}";
        this._scriptName = ${TemplateStr.InterfaceClassName};
        this._layerType = LayerType.Mult;
        this._type = Global.MMO.UI_NORMAL;`,
    mediatorConstructor2:
        `${TemplateStr.Constructor};
        // this._url = Global.MMO.PATH_PREFAB_GAME + "${TemplateStr.InterfaceClassName}";
        this._scriptName = ${TemplateStr.InterfaceClassName};
        this._layerType = LayerType.Mult;
        this._type = Global.MMO.UI_NORMAL;`,

    proxyConstructor:
        `${TemplateStr.Constructor};
        this.ModelType = ${TemplateStr.InterfaceClassName};`,
    proxyConstructor2:
        `${TemplateStr.Constructor};`,

    /** 请求 */
    proxyRequest: `
    public ${TemplateStr.ProxyReq}() {
        this.model.send${TemplateStr.IndexStr}();
    }`,
    /** 返回 */
    proxyResponse: `
    public on${TemplateStr.ProxyRes}(cmd: number, data: ${TemplateStr.ProxyRes}) {
        console.log('--------- ${TemplateStr.ProxyRes}', cmd, data);
    }`,

    noticeOpenStr: `Layer_${TemplateStr.InterfaceClassName}_Open`,
    noticeCloseStr: `Layer_${TemplateStr.InterfaceClassName}_Close`,

    noticeFuncStr: `
    public RegisterNotification(callMap: Map<NoticeTable, DisposeHandle>): void {
        callMap.set(Global.NTable.Layer_${TemplateStr.InterfaceClassName}_Open, this.OpenLayer);
        callMap.set(Global.NTable.Layer_${TemplateStr.InterfaceClassName}_Close, this.CloseLayer);
    }`
}

export type FormatParam = {
    path: string,
    scriptName: string,
    userInfo: Editor.User.UserData,
    model: TemplateModel,
    mvc: MVCModel
}

/** 模板注入数据结构 */
export interface TemplateCIDataModel<T = string> {
    /** 注入类型 */
    CIWay: (new () => CIBase) | Function,
    /** 字符buff 可以通过该值初始化出来一个sourceFile */
    buffer?: string,
    /** 当前文件source路径 */
    fpath?: string,
    /** 机场插入的字符集 */
    readyList?: Array<T>,
    /** 输出路径 */
    opath?: string,
    /** 行注释 */
    comment?: string,
    /** 相关文件路径 */
    lpath?: string,
}

export interface TemplateExportModel {
    /** 即将导出的文件内容 */
    str: string,
    /** 注入结构列表 */
    CIList?: Array<TemplateCIDataModel>
}

export class wtemplate {
    public static async format(str: string = "", param: FormatParam, bPreview: boolean): Promise<TemplateExportModel> {
        if (!str || str.length == 0) return { str };
        str = this.formatStrByTemplate(str, param.scriptName, TemplateStr.ClassName);
        str = this.formatStrByTemplate(str, (new Date()).toString(), TemplateStr.Time);
        str = this.formatStrByTemplate(str, param.path + '/' + param.scriptName + '.ts', TemplateStr.URL);
        str = this.formatStrByTemplate(str, param.userInfo.nickname, TemplateStr.Author);
        let exportModel = await this.formatClassInterface(str, param, bPreview)
        if (bPreview && exportModel) {
            for (let CIItem of (exportModel.CIList || [])) {
                await CIBase.create(CIItem)
            }
        }
        return exportModel;
    }

    public static async formatPrefab(fname: string) {
        let prefab = await Utils.readFile(path.join(Editor.Package.getPath(packageJSON.name) || '', 'src/prefab/PrefabTemplate.prefab'))
        prefab = this.formatStrByTemplate(prefab, TemplateStr.PrefabTemplate, fname)
        return prefab;
    }

    public static formatStrByTemplate(str: string, tar: string, type: string) {
        return str.replace(new RegExp(type, 'g'), tar);
    }

    /** 根据不同接口类型格式化导出数据结构 */
    public static async formatClassInterface(str: string, param: FormatParam, bPreview: boolean): Promise<TemplateExportModel> {
        let model = param.model
        if (!model.classPath) return { str };
        let extendsCls = path.basename(model.classPath).replace('.ts', '');
        let exportModel: TemplateExportModel = { str, CIList: [] }
        switch (model.name) {
            case MVCModelName.Mediator:
                exportModel = await this._formatMediator(str, param, param.mvc, extendsCls, bPreview)
                break;
            case MVCModelName.Proxy:
                exportModel = await this._formatProxy(str, param, param.mvc.proxy, extendsCls, bPreview)
                break;
            case MVCModelName.Layer:
                exportModel = await this._formatLayer(str, param, bPreview)
                break;
        }
        return exportModel;
    }

    private static async _formatMediator(str: string, param: FormatParam, mvc: MVCModel, extendsCls: string, bPreview: boolean) {
        let linkObj = mvc.mediator?.link || {} as ScriptLinkModel
        let linkLayerName = ''
        let exportModel: TemplateExportModel = {
            str,
            CIList: [],
        }

        if (linkObj && linkObj.item && !linkObj.item.dropLinkHiddent) {
            if (linkObj.status && linkObj.script) {
                linkLayerName = linkObj.script.trueName
                //mediator 绑定 目标layer
                let extendsStr = `extends ${extendsCls}`;
                str = str.replace(extendsStr, `${extendsStr}<${linkLayerName}>`)
                let constructorStr = `super(${param.scriptName}.NAME)`
                str = str.replace(constructorStr, TemplateScriptMap.mediatorConstructor2)
                str = this.formatStrByTemplate(str, constructorStr, TemplateStr.Constructor)
                str = this.formatStrByTemplate(str, linkLayerName, TemplateStr.InterfaceClassName)

                let index = str.indexOf('public RegisterNotification');
                if (index >= 0) {
                    str = str.slice(0, index) + this.formatNoticeListener(linkLayerName);
                    str += '\n}'
                }
            }
        } else {
            //extends
            if (mvc.layer && mvc.mediator?.link?.status) {
                linkLayerName = mvc.layer.name
                //mediator 绑定 layer
                let extendsStr = `extends ${extendsCls}`;
                str = str.replace(extendsStr, `${extendsStr}<${linkLayerName}>`)
                let constructorStr = `super(${param.scriptName}.NAME)`
                str = str.replace(constructorStr, mvc.layer.constAppend ? TemplateScriptMap.mediatorConstructor : TemplateScriptMap.mediatorConstructor2)
                str = this.formatStrByTemplate(str, constructorStr, TemplateStr.Constructor)
                str = this.formatStrByTemplate(str, linkLayerName, TemplateStr.InterfaceClassName)
                str = this.formatStrByTemplate(str, mvc.layer.appendPath || "", TemplateStr.AppendPath)

                let index = str.indexOf('public RegisterNotification');
                if (index >= 0) {
                    str = str.slice(0, index) + this.formatNoticeListener(linkLayerName);
                    str += '\n}'
                }
            }
        }

        if (!bPreview) {
            //此处不保存 且 要提前加载 所以直接create
            await CIBase.create({
                CIWay: CIBase,
                fpath: linkObj?.script?.path.replace(Editor.Project.path, ''),
                buffer: str,
                opath: path.join(Editor.Project.path, param.path, param.scriptName + '.ts').replace('db:', ''),
            })

            linkLayerName.length && exportModel.CIList!.push({
                CIWay: CINoticeTable,
                fpath: (await getCfgJson()).NoticeTable,
                readyList: [
                    this.formatStrByTemplate(TemplateScriptMap.noticeOpenStr, linkLayerName, TemplateStr.InterfaceClassName),
                    this.formatStrByTemplate(TemplateScriptMap.noticeCloseStr, linkLayerName, TemplateStr.InterfaceClassName),
                ],
                opath: (await getCfgJson()).NoticeTable,
            })

            exportModel.CIList!.push({
                CIWay: CIWorldMediatorTable,
                fpath: (await getCfgJson()).WorldMediatorTable,
                readyList: [
                    param.scriptName,
                ],
                opath: (await getCfgJson()).WorldMediatorTable,
                lpath: param.path,
            })
        }
        exportModel.str = str;
        return exportModel;
    }

    private static async _formatProxy(str: string, param: FormatParam, proxy: AssetItem | undefined, extendsCls: string, bPreview: boolean) {
        let constructorStr = `super(${param.scriptName}.NAME)`
        //proxy 绑定 model
        let linkObj = proxy?.link
        let exportModel: TemplateExportModel = {
            str,
            CIList: [],
        }
        if (linkObj && linkObj.status && linkObj.script) {
            let extendsStr = `extends ${extendsCls}`;
            str = str.replace(extendsStr, `${extendsStr}<${linkObj.script.trueName}>`)
            str = str.replace(constructorStr, TemplateScriptMap.proxyConstructor)
            str = this.formatStrByTemplate(str, constructorStr, TemplateStr.Constructor)
            str = this.formatStrByTemplate(str, linkObj.script.trueName, TemplateStr.InterfaceClassName)
        }
        //proxy这里要预览结果 所以要提前解析一次
        let ci = await CIBase.create({
            CIWay: CIProxyLink,
            fpath: linkObj?.script?.path.replace(Editor.Project.path, ''),
            buffer: str,
            opath: path.join(Editor.Project.path, param.path, param.scriptName + '.ts').replace('db:', ''),
        })
        str = ci.getFullText()
        if (!bPreview) {
            exportModel.CIList!.push({
                CIWay: CIWorldProxyTable,
                fpath: (await getCfgJson()).WorldProxyTable,
                readyList: [
                    param.scriptName,
                ],
                opath: (await getCfgJson()).WorldProxyTable,
                lpath: param.path,
            })
            exportModel.CIList!.push({
                CIWay: CIProxyTable,
                fpath: (await getCfgJson()).ProxyTable,
                readyList: [
                    param.scriptName,
                ],
                opath: (await getCfgJson()).ProxyTable,
            })
        }
        exportModel.str = str;
        return exportModel;
    }

    private static async _formatLayer(str: string, param: FormatParam, bPreview: boolean) {
        let exportModel: TemplateExportModel = {
            str,
            CIList: [],
        }
        if (!bPreview && param.mvc.layer?.name) {
            exportModel.CIList!.push({
                CIWay: CILayerTable,
                fpath: (await getCfgJson()).LayerTable,
                readyList: [
                    param.scriptName
                ],
            })
        }
        return exportModel
    }

    public static formatNoticeListener(name: string) {
        return this.formatStrByTemplate(TemplateScriptMap.noticeFuncStr, name, TemplateStr.InterfaceClassName)
    }

    /** 格式化驼峰命名 根据大写分割并转小写用 split填充间隔
     * @example TestClassName        NBClass
     * @returns test_class_name      NB_class
     */
    public static formatHumpName(str: string, split: string = '_'): string {
        if (!str || str.length == 0) return "";
        let bakS = str[0];
        str = bakS.toUpperCase() + str.slice(1)
        let result = "";
        let reg = new RegExp('[A-Z][^A-Z]*', 'g')
        let match = str.match(reg) || [];
        for (let i = 0; i < match.length; i++) {
            if (match[i].length == 0) continue;
            if (match[i].length == 1) {
                result += match[i]
            } else {
                result += match[i].toLowerCase();
            }
            if (match[i + 1] && match[i + 1].length > 1) {
                result += split;
            }
        }
        if ((new RegExp('[a-z]')).test(bakS))
            result = bakS + result.slice(1);
        return result
    }

}