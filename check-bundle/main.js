'use strict';
const fs = require("fs")
const path = require('path');

//根据自己分包的命名逻辑来判断是不是分包
var isBundle = async function (str) {
    return new Promise((call) => {
        //如果是res/resources 直接返回true
        if (str == 'resources' || str == 'res') {
            call(true);
            return;
        }
        fs.readFile(str, 'utf8', async (err, data) => {
            call(data && JSON.parse(data).isBundle)
        })
    })
}

var checkDir = async function (p) {
    return new Promise(call => call(fs.lstatSync(p).isDirectory()))
}

/** 返回ts脚本 */
var getTsList = async function (dir) {
    return new Promise((call) => {
        fs.readdir(dir, async (err, info) => {
            if (err) Editor.log(err);
            let list = [];
            for (let item of info) {
                if (await checkDir(path.join(dir, item))) {
                    list.push(...await getTsList(path.join(dir, item)))
                } else if (path.extname(item) === '.ts') {
                    list.push(path.join(dir, item));
                }
            }
            call(list)
        })
    })
}

/** 返回resList */
var getResList = async function (dir) {
    return new Promise((call) => {
        fs.readdir(dir, async (err, info) => {
            if (err) Editor.log(err);
            let listMeta = [];
            let listPrefab = [];
            for (let item of info) {
                if (await checkDir(path.join(dir, item))) {
                    let l = await getResList(path.join(dir, item))
                    listMeta.push(...l[0])
                    listPrefab.push(...l[1])
                } else {
                    if (path.extname(item) === '.meta') { //meta文件
                        listMeta.push(path.join(dir, item));
                    }
                    if (path.extname(item) === '.prefab' || path.extname(item) === '.fire') {
                        listPrefab.push(path.join(dir, item))
                    }
                }
            }
            call([listMeta, listPrefab])
        })
    })
}

var checkTsList = function (ppath ,bundle, list) {
    for (let ts of list) {
        fs.readFile(ts, 'utf8', async (err, data) => {
            const lines = data.split(/\r?\n/);
            for (let line of lines) {
                if (line.indexOf("import") != -1) {
                    line = line.replace(/\//g, "\\");
                    let ds = line.split("\\");
                    ds = ds.splice(1, ds.length - 2)
                    for (let char of ds) {
                        if (char != bundle && isBundle(ppath)) {
                            Editor.error("bundle : ", bundle, " import ", char)
                            Editor.warn(ts)
                            Editor.warn(line)
                        }
                    }
                }
            }
        })
    }
}

var getResMap = function (resList) {
    return new Promise(async (callfunc) => {
        let map = {}
        for (let bundle in resList) {
            for (let dir of resList[bundle]) {
                await new Promise((callfunc) => {
                    fs.readFile(dir, 'utf8', (err, data) => {
                        let obj = JSON.parse(data)
                        if (obj.uuid) {
                            map[obj.uuid] = {
                                path: path.join(path.dirname(dir), path.basename(dir, ".meta")),
                                obj: obj,
                                bundle: bundle,
                            }
                        }
                        let name = path.basename(dir).split(".")[0];
                        if (obj.subMetas[name] && obj.subMetas[name].uuid) {
                            map[obj.subMetas[name].uuid] = {
                                path: path.join(path.dirname(dir), path.basename(dir, ".meta")),
                                obj: obj,
                                bundle: bundle,
                            }
                        }
                        callfunc();
                    })
                })
            }
        }
        callfunc(map)
    })
}

var checkPrefabByMap = async function (prefabList, resMap) {
    return new Promise(async (endcall) => {
        for (let bundle in prefabList) {
            for (let prefabPath of prefabList[bundle]) {
                await new Promise((callfunc) => {
                    fs.readFile(prefabPath, 'utf8', (err, data) => {
                        let lines = data.split(/\r?\n/);
                        for (let line of lines) {
                            if (line.indexOf('__uuid__') != -1) {
                                let useUuid = JSON.parse(`{${line}}`)["__uuid__"]
                                if (resMap[useUuid] && resMap[useUuid].bundle != bundle) {
                                    let obj = `\n"user path": ${prefabPath},\n"asset path": ${resMap[useUuid].path},\n"uuid": ${useUuid}`
                                    Editor.warn("bundle: " + bundle + " use " + resMap[useUuid].bundle + " asset. infomation :", obj);
                                }
                            }
                        }
                        callfunc();
                    });
                })
            }
        }
        endcall();
    })
}


/** 检测分包脚本引用 */
var checkScript = async function () {
    const PPATH = Editor.Project.path;
    const ASSETS_Path = PPATH + '\\assets';
    Editor.log("start check script import .... ")

    fs.readdir(ASSETS_Path, async (err, bundleList) => {
        for (let dir of bundleList) {
            if (isBundle(dir)) {
                let list = await getTsList(path.join(ASSETS_Path, dir))
                if (list.length == 0) continue;
                checkTsList(path.join(ASSETS_Path, dir),dir, list)
            }
        }
        Editor.success("check Over")
    })
}

/** 检测分包资源引用 */
var checkResources = function () {
    const PPATH = Editor.Project.path;
    const ASSETS_Path = PPATH + '\\assets';
    Editor.log("start check res import .... ")
    //当前只在assets下的文件夹分包  只检测其中的   其他的情况不考虑
    fs.readdir(ASSETS_Path, async (err, bundleList) => {
        let prefabAry = {};
        let resAry = {};
        for (let dir of bundleList) {
            if (dir.indexOf('.meta') > -1 && await isBundle(path.join(ASSETS_Path, dir))) {
                const sDir = dir.split('.meta')[0]
                let list = await getResList(path.join(ASSETS_Path, sDir))
                resAry[sDir] = list[0];
                prefabAry[sDir] = list[1];
            }
        }
        let resMap = await getResMap(resAry)
        await checkPrefabByMap(prefabAry, resMap);
        Editor.success("check Over")
    })
}

var tsLint = function () {
    const exec = require("child_process").exec;
    Editor.success("~start ts lint~");
    exec(`tslint --project "${Editor.Project.path}" --config ${path.join(__dirname,"tslint.json")}`, (err, sdout, stderr) => {
        if (stderr) {
            Editor.err(stderr);
        } else {
            Editor.warn(sdout);
        }
        Editor.success("~lint over~");
    })
}

module.exports = {
    load() {

    },

    unload() {

    },

    messages: {
        // 'check-bundle:script'() {
            // checkScript()
        // },
        'check-bundle:res'() {
            checkResources()
        },
        'check-bundle:ts-lint'() {
            tsLint()
        },
    },
};