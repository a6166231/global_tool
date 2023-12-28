import { OptionalKind, ParameterDeclarationStructure, SourceFile, SyntaxKind, Type, ts } from "ts-morph";
import { CIBase } from "./CIBase";
import { AST } from "../ts-morph/AST";
import path, { basename, extname, join } from "path";

export class CIProxyLink extends CIBase {
    protected proxyFile: SourceFile = null as any

    async readyToInject() {
        //该proxy解析
        this.proxyFile = await AST.formatSourceByStr(join(Editor.Project.path, this._CIItemData.opath!.replace('db:', '') + '.ts'), this._CIItemData.buffer!)!;
        if (this._CIItemData.fpath) {
            let extName = extname(this._CIItemData.fpath!)
            let fileName = basename(this._CIItemData.fpath!).replace(extName, '')
            //解析class的方法 太太太费性能了
            let vResponseImport = this._injectReqRes(fileName)
            //import插入
            this._injectImportList(vResponseImport)
        }
    }

    /** import列表 */
    private async _injectImportList(vResponseImport: string[]) {
        if (!vResponseImport.length) return;
        let project = await AST.loadDirectoryAtPath(path.dirname(this.sourceFile.getFilePath()))
        if (!project) return;
        for (let _import of vResponseImport) {
            if (!_import || _import.length == 0) continue
            let importFile = project.find((v) => { return v.getBaseName() == _import + '.ts' })
            if (!importFile) continue;
            let _interface = importFile.getInterface(_import)
            if (!_interface) return
            this.proxyFile.addImportDeclaration({
                moduleSpecifier: this.proxyFile.getRelativePathTo(join(importFile.getDirectoryPath(), importFile.getBaseNameWithoutExtension())),
                defaultImport: _interface.getName()
            })
        }
    }

    /** 请求、返回 */
    private _injectReqRes(fileName: string) {
        let vResponseImport: string[] = []
        let modelClass = this.sourceFile.getClass(fileName)
        if (!modelClass) return vResponseImport

        let _enumDec = this.sourceFile.getEnum(`${fileName}CMD`);
        let membs = _enumDec?.getMembers() || [];

        let vRequest = []
        let vResponse = []

        for (let _enum of membs) {
            let request = _enum.getName().slice(0, 3).toLowerCase() == 'req'
            request ? vRequest.push(_enum) : vResponse.push(_enum)
        }

        let reqHead = vRequest.length > 0 ? '----------------------request------------------------' : ''
        let resHead = vResponse.length > 0 ? '----------------------response------------------------' : '';
        let tarClass = this.proxyFile.getClasses()[0]

        for (let i = 0; i < vRequest.length; i++) {
            let _enum = vRequest[i]
            let _enumFunName = `send${_enum.getName()}`
            if (tarClass.getMethod(_enumFunName)) continue;

            let funcName = `send${Number(_enum.getValue()) % 1000}`
            let tarFunc = modelClass.getMethod(funcName)
            let docs = tarFunc?.getJsDocs().reduce((ary: Array<string>, v) => {
                ary.push(v.getInnerText())
                return ary
            }, []) || []

            i == 0 && docs.splice(0, 0, reqHead)

            let vParam: string[] = []
            let parameters = tarFunc?.getParameters().reduce((ary: Array<OptionalKind<ParameterDeclarationStructure>>, v) => {
                vParam.push(v.getName())
                ary.push({
                    name: v.getName(),
                    type: v.getTypeNode()?.getText()
                })
                vResponseImport.push(v.getTypeNode()?.getText() || "")
                return ary;
            }, [])

            let resultFunc = tarClass.addMethod({
                docs: docs,
                name: _enumFunName,
                parameters: parameters,
            })
            resultFunc.setBodyText(`this.model.${funcName}(${vParam.join(',')})`)
        }

        for (let i = 0; i < vResponse.length; i++) {
            let _enum = vResponse[i]

            let _enumFunName = _enum.getName().slice(3)
            if (tarClass.getMethod(_enumFunName)) continue;

            let docs = _enum?.getJsDocs().reduce((ary: Array<string>, v) => {
                let txt = '\n' + _enum.getValue()!.toString() + '\n' + v.getInnerText()
                ary.push(txt)
                return ary
            }, []) || []
            i == 0 && docs.splice(0, 0, resHead)

            let funcName = _enum.getName()
            let tarFunc = modelClass.getMethod('on' + funcName)
            let dataVar = tarFunc?.getVariableDeclaration('data')
            let tsType = dataVar?.getTypeNode()
            let dataType = 'any'
            if (tsType) {
                dataType = tsType.getText()
            } else {
                switch (dataVar?.getStructure().initializer) {
                    case "{}": dataType = funcName; vResponseImport.push(funcName); break
                    case "[]": dataType = 'Array<any>'; break
                }
            }

            let parameters = [
                {
                    name: 'cmd',
                    type: 'number',
                },
                {
                    name: 'data',
                    type: dataType,
                },
            ]

            let resultFunc = tarClass.addMethod({
                docs: docs,
                name: 'on' + _enum.getName(),
                parameters: parameters,
            })
            resultFunc.setBodyText(`console.log("------------ ${'on' + _enum.getName()}", cmd, data)`)
        }
        return vResponseImport;
    }

    public getFullText() {
        return this.proxyFile?.getFullText() || ""
    }

    public async save(): Promise<void> {
        try {
            await this.sourceFile.save();
        } catch (error) {
            console.log(`保存失败：${this.sourceFile.getFilePath()}. `, error)
        }
        try {
            await this.proxyFile.save();
        } catch (error) {
            console.log(`保存失败：${this.proxyFile.getFilePath()}. `, error)
        }
    }
}