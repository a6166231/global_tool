/**
 * 解析器
 * import from 陈皮皮
 * https://gitee.com/ifaswind/ccc-references-finder
 */
 const Parser = {

    /**
     * 节点树缓存
     * @type {{ [key: string]: object }}
     */
    caches: Object.create(null),

    /**
     * 将资源解析为节点树
     * @param {object} source 源数据
     * @returns {object}
     */
    convert(source) {
        const tree = Object.create(null),
            type = source[0]['__type__'];
        if (type === 'cc.SceneAsset') {
            // 场景资源
            const sceneId = source[0]['scene']['__id__'],
                children = source[sceneId]['_children'];
            tree.type = 'cc.Scene'; // 类型
            tree.id = sceneId; // ID
            // 场景下可以有多个一级节点
            tree.children = [];
            for (let i = 0, l = children.length; i < l; i++) {
                const nodeId = children[i]['__id__'];
                Parser.convertNode(source, nodeId, tree);
            }
        } else if (type === 'cc.Prefab') {
            // 预制体资源 
            const uuid = source[source.length - 1]['asset']['__uuid__'];
            tree.type = 'cc.Prefab'; // 类型
            tree.uuid = uuid; // uuid
            // 预制体本身就是一个节点
            tree.children = [];
            const nodeId = source[0]['data']['__id__'];
            Parser.convertNode(source, nodeId, tree);
        }
        return tree;
    },

    /**
     * 解析节点
     * @param {object} source 源数据
     * @param {number} nodeId 节点 ID
     * @param {object} parent 父节点
     */
    convertNode(source, nodeId, parent) {
        const srcNode = source[nodeId],
            node = Object.create(null);
        // 基本信息
        node.name = srcNode['_name'];
        node.id = nodeId;
        node.type = srcNode['__type__'];

        // 路径
        const parentPath = parent.path || null;
        node.path = parentPath ? `${parentPath}/${node.name}` : node.name;

        // 组件
        node.components = [];
        const srcComponents = srcNode['_components'];
        if (srcComponents && srcComponents.length > 0) {
            for (let i = 0, l = srcComponents.length; i < l; i++) {
                const compId = srcComponents[i]['__id__'],
                    component = Parser.extractValidInfo(source[compId]);
                node.components.push(component);
            }
        }

        node.children = [];
        const srcChildren = srcNode['_children'];
        if (srcChildren && srcChildren.length > 0) {
            for (let i = 0, l = srcChildren.length; i < l; i++) {
                const nodeId = srcChildren[i]['__id__'];
                Parser.convertNode(source, nodeId, node);
            }
        }

        // 保存到父节点
        parent.children.push(node);
    },

    /**
     * 提取有效信息（含有 uuid）
     * @param {object} source 源数据
     * @returns {{ __type__: string, _name: string, fileId?: string }}
     */
    extractValidInfo(source) {
        const result = Object.create(null);

        // 记录有用的属性
        const keys = ['__type__', '_name', 'fileId'];
        for (let i = 0, l = keys.length; i < l; i++) {
            const key = keys[i];
            if (source[key] !== undefined) {
                result[key] = source[key];
            }
        }

        // 记录包含 uuid 的属性
        for (const key in source) {
            const contains = Parser.containsProperty(source[key], '__uuid__');
            if (contains) {
                result[key] = source[key];
            }
        }

        return result;
    },

    /**
     * 对象中是否包含指定的属性
     * @param {object} object 对象
     * @param {string} name 属性名
     */
    containsProperty(object, name) {
        let result = false;
        const search = (_object) => {
            if (Parser.isObject(_object)) {
                for (const key in _object) {
                    if (key == name) {
                        result = true;
                        return;
                    }
                    search(_object[key]);
                }
            } else if (Array.isArray(_object)) {
                for (let i = 0, l = _object.length; i < l; i++) {
                    search(_object[i]);
                }
            }
        }
        search(object);
        return result;
    },

    /**
     * 判断指定值是否是一个对象
     * @param {any} arg 参数
     */
    isObject(arg) {
        return Object.prototype.toString.call(arg) === '[object Object]';
    },

};
module.exports = Parser;