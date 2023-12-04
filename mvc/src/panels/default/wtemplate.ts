import path from "path";
import { TemplateModel } from "../../main";
import { AssetItem, MVCModel, MVCModelName, ScriptLinkModel } from "./MVCModel";
import Utils from "./util";
import packageJSON from '../../../package.json';

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

    noticeStr: `
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

export class wtemplate {

    public static async format(str: string = "", param: FormatParam): Promise<String> {
        if (!str || str.length == 0) return str;
        str = this.formatStrByTemplate(str, param.scriptName, TemplateStr.ClassName);
        str = this.formatStrByTemplate(str, (new Date()).toString(), TemplateStr.Time);
        str = this.formatStrByTemplate(str, param.path + '/' + param.scriptName + '.ts', TemplateStr.URL);
        str = this.formatStrByTemplate(str, param.userInfo.nickname, TemplateStr.Author);
        str = await this.formatClassInterface(str, param)
        return str;
    }

    public static async formatPrefab(fname: string) {
        let prefab = await Utils.readFile(path.join(Editor.Package.getPath(packageJSON.name) || '', 'src/prefab/PrefabTemplate.prefab'))
        prefab = this.formatStrByTemplate(prefab, TemplateStr.PrefabTemplate, fname)
        return prefab;
    }

    public static formatStrByTemplate(str: string, tar: string, type: string) {
        return str.replace(new RegExp(type, 'g'), tar);
    }

    public static async formatClassInterface(str: string, param: FormatParam) {
        let model = param.model
        if (!model.classPath) return str;
        let extendsCls = path.basename(model.classPath).replace('.ts', '');
        switch (model.name) {
            case MVCModelName.Mediator:
                str = this._formatMediator(str, param, param.mvc, extendsCls)
                break;
            case MVCModelName.Proxy:
                str = await this._formatProxy(str, param, param.mvc.proxy, extendsCls)
                break;
            case MVCModelName.Layer:
                break;
        }
        return str;
    }

    private static _formatMediator(str: string, param: FormatParam, mvc: MVCModel, extendsCls: string) {

        let linkObj = mvc.mediator?.link || {} as ScriptLinkModel
        if (linkObj && linkObj.item && !linkObj.item.dropLinkHiddent) {
            if (linkObj.status && linkObj.script) {
                //mediator 绑定 目标layer
                let extendsStr = `extends ${extendsCls}`;
                str = str.replace(extendsStr, `${extendsStr}<${linkObj.script.trueName}>`)
                let constructorStr = `super(${param.scriptName}.NAME)`
                str = str.replace(constructorStr, TemplateScriptMap.mediatorConstructor2)
                str = this.formatStrByTemplate(str, constructorStr, TemplateStr.Constructor)
                str = this.formatStrByTemplate(str, linkObj.script.trueName, TemplateStr.InterfaceClassName)

                let index = str.indexOf('public RegisterNotification');
                if (index >= 0) {
                    str = str.slice(0, index) + this.formatNoticeListener(linkObj.script.trueName);
                    str += '\n}'
                }
            }
        } else {
            //extends
            if (mvc.layer && mvc.mediator?.link?.status) {
                //mediator 绑定 layer
                let extendsStr = `extends ${extendsCls}`;
                str = str.replace(extendsStr, `${extendsStr}<${mvc.layer.name}>`)
                let constructorStr = `super(${param.scriptName}.NAME)`
                str = str.replace(constructorStr, mvc.layer.constAppend ? TemplateScriptMap.mediatorConstructor : TemplateScriptMap.mediatorConstructor2)
                str = this.formatStrByTemplate(str, constructorStr, TemplateStr.Constructor)
                str = this.formatStrByTemplate(str, mvc.layer.name, TemplateStr.InterfaceClassName)
                str = this.formatStrByTemplate(str, mvc.layer.appendPath || "", TemplateStr.AppendPath)

                let index = str.indexOf('public RegisterNotification');
                if (index >= 0) {
                    str = str.slice(0, index) + this.formatNoticeListener(mvc.layer.name);
                    str += '\n}'
                }
            }
        }

        return str;
    }

    private static async _formatProxy(str: string, param: FormatParam, proxy: AssetItem | undefined, extendsCls: string) {
        let constructorStr = `super(${param.scriptName}.NAME)`
        //proxy 绑定 model
        let linkObj = proxy?.link
        if (linkObj && linkObj.status && linkObj.script) {
            let extendsStr = `extends ${extendsCls}`;
            str = str.replace(extendsStr, `${extendsStr}<${linkObj.script.trueName}>`)
            str = str.replace(constructorStr, TemplateScriptMap.proxyConstructor)
            str = this.formatStrByTemplate(str, constructorStr, TemplateStr.Constructor)
            str = this.formatStrByTemplate(str, linkObj.script.trueName, TemplateStr.InterfaceClassName)

            let lastRightBrace = str.lastIndexOf('}');
            str = str.slice(0, lastRightBrace) + await this.formatModelRequest(linkObj);
            str += '}';
        }
        return str;
    }

    public static formatNoticeListener(name: string) {
        return this.formatStrByTemplate(TemplateScriptMap.noticeStr, name, TemplateStr.InterfaceClassName)
    }

    /** 格式化model的request方法 */
    public static async formatModelRequest(linkItem?: ScriptLinkModel) {
        if (!linkItem) return ''

        let script = await Utils.readFile(linkItem.script.path)
        if (!script) return ''
        let cmd = `enum ${linkItem.script.trueName}CMD`
        let index = script.indexOf(cmd)
        if (index < 0) return ''
        let enumEndIndex = script.indexOf('}', index)
        if (enumEndIndex < 0) return ''

        let sEnum = script.slice(index + cmd.length, enumEndIndex + 1);
        let str = '';
        sEnum = sEnum.replace(new RegExp('=', 'g'), ':');

        let messageMap: Record<string, number> = {};
        eval(`messageMap=${sEnum}`)

        let reqS = ''
        let resS = ''

        for (let k in messageMap) {
            //res 返回
            if (k[2] == 's') {
                resS += this.formatStrByTemplate(TemplateScriptMap.proxyResponse, `${k}`, TemplateStr.ProxyRes) + '\n';
            } else {//res请求 
                let req = this.formatStrByTemplate(TemplateScriptMap.proxyRequest, `${k}`, TemplateStr.ProxyReq);
                req = this.formatStrByTemplate(req, `${messageMap[k] % 1000}`, TemplateStr.IndexStr) + '\n';
                reqS += req
            }
        }

        if (reqS.length > 0) {
            str += '\n\t/** ----------------------request------------------------ */'
            str += reqS;
        }
        if (resS.length > 0) {
            str += '\n\t/** ----------------------response---------------------- */'
            str += resS;
        }

        return str;
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