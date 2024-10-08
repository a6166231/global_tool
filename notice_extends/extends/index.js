document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        focusIn()
    }
});

var _iframe
const Add = 'add';
const Change = 'change';
const Delete = 'unlink';

function getFrameEleTextContent() {
    try {
        let win = getIFrameEle().contentWindow
        let content = win && win.document && win.document.body && win.document.body.textContent
        if (!content) return false
        if (content == 'success') return true
        return JSON.parse(content)
    } catch (error) {
        console.error(error)
        return false
    }
}

async function iframeDocumentCall(scriptBakMap) {
    let status = false
    for (let k in scriptBakMap) {
        for (let v of scriptBakMap[k]) {
            status = true
            await hotloadScriptList(k, v)
        }
    }
    return status
}

function getIFrameEle(func) {
    if (!_iframe) {
        _iframe = document.createElement('iframe');
        _iframe.style.display = 'none';
        document.body.appendChild(_iframe);
    }
    if (func) {
        let call = () => {
            _iframe.removeEventListener('load', call)
            func()
        }
        _iframe.addEventListener('load', call)
    }
    return _iframe
}

function focusIn() {
    getIFrameEle(async () => {
        let scriptBakMap = getFrameEleTextContent()
        if (!scriptBakMap) return
        let status = (() => {
            for (let k in scriptBakMap) {
                for (let v of scriptBakMap[k]) {
                    return true
                }
            }
            return false
        })()
        if (!status) return

        // getIFrameEle(async () => {
        status = await iframeDocumentCall(scriptBakMap)
        if (status) {
            console.log('%c hot load success~', 'color: green;font-weight:bold;')
        }
        // }).src = `http://localhost:${location.port}/asset-db/refresh`;
    }).src = `http://localhost:${location.port}/notice_extends/refresh-scripts`;
}

var REGISTRY

function getSystemSymbol() {
    if (!REGISTRY)
        REGISTRY = Object.getOwnPropertySymbols(System)[0]
    return REGISTRY
}

async function hotloadScriptList(type, path) {
    let ppath = await System.resolve(`file:///${path.replaceAll('\\','/')}`)
    console.log(ppath)
    let model = System.get(ppath)
    if (model) {
        let readyDel = []
        for (let k in model) {
            if (model[k] instanceof Function) {
                readyDel.push(model[k])
            }
        }
        cc.js.unregisterClass(...readyDel)
    }
    System.delete(ppath)
    System.import(ppath)
}