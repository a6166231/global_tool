
/**
 * custom-inject
 * 自定义注入基类
 * 不同的类的注入内容方式不同，需要解析各自的结构后进行分析插入代码
 */

import path, { join } from 'path';
module.paths.push(join(Editor.App.path, 'node_modules'));
import { SourceFile } from "ts-morph"
import { AST } from '../ts-morph/AST'
import { TemplateCIDataModel } from '../wtemplate';

export abstract class CIBase<T = string> {
    /** 资源文件 */
    protected sourceFile: SourceFile = null as any;
    /** 注入数据结构 */
    protected _CIItemData: TemplateCIDataModel<T> = null as any

    static async create(CIItem: TemplateCIDataModel): Promise<CIBase> {
        let ts: CIBase = Reflect.construct(CIItem.CIWay, [CIItem])
        if (CIItem.fpath) {
            await ts.createByPath(join(Editor.Project.path, CIItem.fpath))
        } else if (CIItem.buffer) {
            ts.createByStr(CIItem.buffer, CIItem.opath!)
        }
        return ts;
    }

    async createByStr(str: string, path: string) {
        this.sourceFile = AST.formatSourceByStr(path, str)!
        try {
            await this.readyToInject()
        } catch (error) {
            console.error('解析失败', error)
        }
    }

    async createByPath(str: string) {
        this.sourceFile = await AST.loadSourceByPath(str)!
        try {
            await this.readyToInject()
        } catch (error) {
            console.error('解析失败', error)
        }
    }

    /** 不让外部实例化 */
    protected constructor(CIItem: TemplateCIDataModel<T>) {
        this._CIItemData = CIItem;
    }

    /** 准备注入信息 */
    readyToInject() { };

    public getFullText() {
        return this.sourceFile?.getFullText() || ""
    }

    /** import 外部 class */
    protected async injectImportClass(name: string, opath: string) {
        let importFile = await AST.loadSourceByPath(join(Editor.Project.path, opath, name + '.ts'))
        // let project = await AST.loadDirectoryAtPath(join(Editor.Project.path, opath))
        // if (!project) return;
        // let importFile = project.find((v) => { return v.getBaseName() == name + '.ts' })
        if (!importFile) return;
        let _class = importFile.getClass(name)
        if (!_class) return
        this.sourceFile.addImportDeclaration({
            moduleSpecifier: this.sourceFile.getRelativePathTo(join(importFile.getDirectoryPath(), importFile.getBaseNameWithoutExtension())),
            defaultImport: _class.getName()
        })
    }

    public async save() {
        try {
            await this.sourceFile.save();
        } catch (error) {
            console.log(`保存失败：${this.sourceFile.getFilePath()}. `, error)
        }
    }

    /** import列表注入 */
    public static async injectImport(vResponseImport: Array<string>, sourceFile: SourceFile, injectFile: SourceFile) {
        if (!vResponseImport.length) return;
        let project = await AST.loadDirectoryAtPath(path.dirname(sourceFile.getFilePath()))
        if (!project) return;

        vResponseImport = Array.from(new Set(vResponseImport))
        for (let _import of vResponseImport) {
            if (!_import || _import.length == 0) continue
            let importFile = project.find((v) => { return v.getBaseName() == _import + '.ts' })
            if (!importFile) continue;
            //直接查找导出的interface 或者 class
            let _export = importFile.getInterface(_import) || importFile.getClass(_import)
            if (!_export) continue
            injectFile.addImportDeclaration({
                moduleSpecifier: injectFile.getRelativePathTo(join(importFile.getDirectoryPath(), importFile.getBaseNameWithoutExtension())),
                defaultImport: _export.getName()
            })
        }
    }
}