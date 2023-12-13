
import { Project } from 'ts-morph'

export class AST {

    private static _project: Project;

    /** 每次打开公用同一个project 之后再加载sourceFile的时候先get一次看能否从缓存中get到 */
    public static get Project() {
        if (!AST._project) {
            AST._project = new Project()
        }
        return AST._project
    }

    public static clear() {
        this._project = null as any;
    }

    public static getSourceByPath(path: string) {
        return AST.Project.getSourceFile(path);
    }
    public static getDirByPath(path: string) {
        return AST.Project.getDirectory(path);
    }

    /** 根据字符串格式化 */
    public static formatSourceByStr(path: string, str: string) {
        let p = AST.Project;
        return p.createSourceFile(path, str, { overwrite: true });
    }

    /** 根据文件路径加载为source */
    public static loadSourceByPath(path: string) {
        return AST.getSourceByPath(path) || AST.Project.addSourceFileAtPath(path);
    }
    /** 获取路径下的所有的source */
    public static async loadDirectoryAtPath(path: string) {
        path = path.replace(new RegExp('\\\\', 'g'), '/')
        let dir = AST.getDirByPath(path);
        if (dir) {
            return dir.getDescendantSourceFiles()
        } else {
            return (await AST.Project.addDirectoryAtPath(path)).getDescendantSourceFiles();
        }
    }
}