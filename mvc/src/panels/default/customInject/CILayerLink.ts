import { StructureKind, SyntaxKind } from "ts-morph";
import { CIBase } from "./CIBase";
import { basename, extname, join } from "path";

export class CILayerLink extends CIBase {

    readyToInject() {
        if (!this._CIItemData.opath) return
        let extName = extname(this._CIItemData.opath!)
        let fileName = basename(this._CIItemData.opath!).replace(extName, '')

        let _class = this.sourceFile.getClass(fileName)
        if (!_class) return

        let _extends = _class.getExtends()
        if (!_extends) return

        let baseClassName = fileName.replace('Layer', '')

        let interfaceName = baseClassName + 'Data'

        this.sourceFile.insertInterface(_class.getChildIndex(), {
            kind: StructureKind.Interface,
            name: interfaceName,
            properties: [],
            extends: ['BaseUIData']
        })

        _extends.addTypeArgument(interfaceName)
        this.sourceFile.addImportDeclaration({
            moduleSpecifier: this.sourceFile.getRelativePathTo(this._CIItemData.lpath!.replace('.ts', '')),
            namedImports: [{ name: 'BaseUIData' }]
        })

        let method = _class.getMethod('onInit')
        if (!method) return

        let data = method.getParameter('data')
        if (!data) return
        data.setType(interfaceName)
    }

}