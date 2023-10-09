"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wtemplate = exports.TemplateScriptMap = exports.TemplateStr = void 0;
const path_1 = __importDefault(require("path"));
const MVCModel_1 = require("./MVCModel");
const util_1 = __importDefault(require("./util"));
var TemplateStr;
(function (TemplateStr) {
    TemplateStr["Author"] = "<%Author%>";
    TemplateStr["Time"] = "<%DateTime%>";
    TemplateStr["URL"] = "<%URL%>";
    TemplateStr["ClassName"] = "<%CamelCaseClassName%>";
    TemplateStr["TypeClass"] = "<%TypeClassName%>";
    TemplateStr["InterfaceClassName"] = "<%InterfaceClassName%>";
    TemplateStr["AppendPath"] = "<%AppendPath%>";
    TemplateStr["Constructor"] = "<%Constructor%>";
    TemplateStr["ProxyReq"] = "<%ProxyReq%>";
    TemplateStr["ProxyReqID"] = "<%ProxyReqID%>";
    TemplateStr["ProxyRes"] = "<%ProxyRes%>";
    TemplateStr["ProxyResID"] = "<%ProxyResID%>";
    TemplateStr["IndexStr"] = "<%IndexStr%>";
    TemplateStr["SelectDivStr"] = "<%SelectDivStr%>";
})(TemplateStr = exports.TemplateStr || (exports.TemplateStr = {}));
exports.TemplateScriptMap = {
    selectDiv: `<option value="${TemplateStr.SelectDivStr}">${TemplateStr.SelectDivStr}</option>`,
    mediatorConstructor: `${TemplateStr.Constructor};
        this._url = Global.MMO.PATH_PREFAB_GAME + "${TemplateStr.AppendPath}/${TemplateStr.InterfaceClassName}";
        this._scriptName = ${TemplateStr.InterfaceClassName};
        this._layerType = LayerType.Mult;
        this._type = Global.MMO.UI_NORMAL;`,
    mediatorConstructor2: `${TemplateStr.Constructor};
        // this._url = Global.MMO.PATH_PREFAB_GAME + "${TemplateStr.InterfaceClassName}";
        this._scriptName = ${TemplateStr.InterfaceClassName};
        this._layerType = LayerType.Mult;
        this._type = Global.MMO.UI_NORMAL;`,
    proxyConstructor: `${TemplateStr.Constructor};
        this.ModelType = ${TemplateStr.InterfaceClassName};`,
    proxyConstructor2: `${TemplateStr.Constructor};`,
    /** 请求 */
    proxyRequest: `
    public ${TemplateStr.ProxyReq}(...p: any) {
        this.model.send${TemplateStr.IndexStr}.bind(this.model, ...p)();
    }`,
    /** 返回 */
    proxyResponse: `
    public on${TemplateStr.ProxyRes}(cmd: number, data: ${TemplateStr.ProxyRes}) {
        console.log('--------- ${TemplateStr.ProxyRes}', cmd);
    }`,
    noticeStr: `
    public RegisterNotification(callMap: Map<string, DisposeHandle>): void {
        callMap.set(Global.NTable.Layer_${TemplateStr.InterfaceClassName}_Open, this.OpenLayer);
        callMap.set(Global.NTable.Layer_${TemplateStr.InterfaceClassName}_Close, this.CloseLayer);
    }
    `
};
class wtemplate {
    static async format(str = "", param) {
        if (!str || str.length == 0)
            return str;
        str = this.formatStrByTemplate(str, param.scriptName, TemplateStr.ClassName);
        str = this.formatStrByTemplate(str, (new Date()).toString(), TemplateStr.Time);
        str = this.formatStrByTemplate(str, param.path + '/' + param.scriptName + '.ts', TemplateStr.URL);
        str = this.formatStrByTemplate(str, param.userInfo.nickname, TemplateStr.Author);
        str = await this.formatClassInterface(str, param);
        return str;
    }
    static formatStrByTemplate(str, tar, type) {
        return str.replace(new RegExp(type, 'g'), tar);
    }
    static async formatClassInterface(str, param) {
        let model = param.model;
        let extendsCls = path_1.default.basename(model.classPath).replace('.ts', '');
        switch (model.name) {
            case MVCModel_1.MVCModelName.Mediator:
                str = this._formatMediator(str, param, param.mvc, extendsCls);
                break;
            case MVCModel_1.MVCModelName.Proxy:
                str = await this._formatProxy(str, param, param.mvc.proxy, extendsCls);
                break;
            case MVCModel_1.MVCModelName.Layer:
                break;
        }
        return str;
    }
    static _formatMediator(str, param, mvc, extendsCls) {
        var _a, _b, _c;
        let linkObj = ((_a = mvc.mediator) === null || _a === void 0 ? void 0 : _a.link) || {};
        if (linkObj && linkObj.item && !linkObj.item.dropLinkHiddent) {
            if (linkObj.status && linkObj.script) {
                //mediator 绑定 目标layer
                let extendsStr = `extends ${extendsCls}`;
                str = str.replace(extendsStr, `${extendsStr}<${linkObj.script.trueName}>`);
                let constructorStr = `super(${param.scriptName}.NAME)`;
                str = str.replace(constructorStr, exports.TemplateScriptMap.mediatorConstructor2);
                str = this.formatStrByTemplate(str, constructorStr, TemplateStr.Constructor);
                str = this.formatStrByTemplate(str, linkObj.script.trueName, TemplateStr.InterfaceClassName);
                let index = str.indexOf('public RegisterNotification');
                if (index >= 0) {
                    str = str.slice(0, index) + this.formatNoticeListener(linkObj.script.trueName);
                    str += '}';
                }
            }
        }
        else {
            //extends
            if (mvc.layer && ((_c = (_b = mvc.mediator) === null || _b === void 0 ? void 0 : _b.link) === null || _c === void 0 ? void 0 : _c.status)) {
                //mediator 绑定 layer
                let extendsStr = `extends ${extendsCls}`;
                str = str.replace(extendsStr, `${extendsStr}<${mvc.layer.name}>`);
                let constructorStr = `super(${param.scriptName}.NAME)`;
                str = str.replace(constructorStr, mvc.layer.constAppend ? exports.TemplateScriptMap.mediatorConstructor : exports.TemplateScriptMap.mediatorConstructor2);
                str = this.formatStrByTemplate(str, constructorStr, TemplateStr.Constructor);
                str = this.formatStrByTemplate(str, mvc.layer.name, TemplateStr.InterfaceClassName);
                str = this.formatStrByTemplate(str, mvc.layer.appendPath || "", TemplateStr.AppendPath);
                let index = str.indexOf('public RegisterNotification');
                if (index >= 0) {
                    str = str.slice(0, index) + this.formatNoticeListener(mvc.layer.name);
                    str += '}';
                }
            }
        }
        return str;
    }
    static async _formatProxy(str, param, proxy, extendsCls) {
        let constructorStr = `super(${param.scriptName}.NAME)`;
        //proxy 绑定 model
        let linkObj = proxy === null || proxy === void 0 ? void 0 : proxy.link;
        if (linkObj && linkObj.status && linkObj.script) {
            let extendsStr = `extends ${extendsCls}`;
            str = str.replace(extendsStr, `${extendsStr}<${linkObj.script.trueName}>`);
            str = str.replace(constructorStr, exports.TemplateScriptMap.proxyConstructor);
            str = this.formatStrByTemplate(str, constructorStr, TemplateStr.Constructor);
            str = this.formatStrByTemplate(str, linkObj.script.trueName, TemplateStr.InterfaceClassName);
            let lastRightBrace = str.lastIndexOf('}');
            str = str.slice(0, lastRightBrace) + await this.formatModelRequest(linkObj);
            str += '}';
        }
        return str;
    }
    static formatNoticeListener(name) {
        return this.formatStrByTemplate(exports.TemplateScriptMap.noticeStr, name, TemplateStr.InterfaceClassName);
    }
    /** 格式化model的request方法 */
    static async formatModelRequest(linkItem) {
        if (!linkItem)
            return '';
        let script = await util_1.default.readFile(linkItem.script.path);
        if (!script)
            return '';
        let cmd = `enum ${linkItem.script.trueName}CMD`;
        let index = script.indexOf(cmd);
        if (index < 0)
            return '';
        let enumEndIndex = script.indexOf('}', index);
        if (enumEndIndex < 0)
            return '';
        let sEnum = script.slice(index + cmd.length, enumEndIndex + 1);
        let str = '';
        sEnum = sEnum.replace(new RegExp('=', 'g'), ':');
        let messageMap = {};
        eval(`messageMap=${sEnum}`);
        let reqS = '';
        let resS = '';
        for (let k in messageMap) {
            //res 返回
            if (k[2] == 's') {
                resS += this.formatStrByTemplate(exports.TemplateScriptMap.proxyResponse, `${k}`, TemplateStr.ProxyRes) + '\n';
            }
            else { //res请求 
                let req = this.formatStrByTemplate(exports.TemplateScriptMap.proxyRequest, `${k}`, TemplateStr.ProxyReq);
                req = this.formatStrByTemplate(req, `${messageMap[k] % 1000}`, TemplateStr.IndexStr) + '\n';
                reqS += req;
            }
        }
        if (reqS.length > 0) {
            str += '\n\t/** ----------------------request------------------------ */';
            str += reqS;
        }
        if (resS.length > 0) {
            str += '\n\t/** ----------------------response---------------------- */';
            str += resS;
        }
        return str;
    }
    /** 格式化驼峰命名 根据大写分割并转小写用 split填充间隔
     * @example TestClassName        NBClass
     * @returns test_class_name      NB_class
     */
    static formatHumpName(str, split = '_') {
        if (!str || str.length == 0)
            return "";
        let bakS = str[0];
        str = bakS.toUpperCase() + str.slice(1);
        let result = "";
        let reg = new RegExp('[A-Z][^A-Z]*', 'g');
        let match = str.match(reg) || [];
        for (let i = 0; i < match.length; i++) {
            if (match[i].length == 0)
                continue;
            if (match[i].length == 1) {
                result += match[i];
            }
            else {
                result += match[i].toLowerCase();
            }
            if (match[i + 1] && match[i + 1].length > 1) {
                result += split;
            }
        }
        if ((new RegExp('[a-z]')).test(bakS))
            result = bakS + result.slice(1);
        return result;
    }
}
exports.wtemplate = wtemplate;
