const fs = require("fire-fs");
const path = require("path");

// let _gamesPath = Editor.argv.panelArgv.path;

Editor.Panel.extend({
    style: `
        
    `,
    template: `
        <h1>panel view</h1>
        <hr />
        <button id="btn">testBtn</button>
        <div>
            name：<span id="name">?</span>
        </div>
        <span>
            test:<select id="select">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
            </select>
        </span>
    `,
    $: {
        btn: "#btn"
    },
    ready() {
        Editor.log(path.join(Editor.projectInfo.path, "packages"))
        Editor.log(Editor.Project.path)

        this.$btn.addEventListener("mousedown", () => {
            Editor.log("1")
        })
    },
    listeners: {
        // mousedown(event) {
        //     event.stopPropagation();
        //     Editor.log('on mousedown', event);
        // },
        // 'panel-resize'(event) {
        //     Editor.log('panel resize ', event);
        // }
    },
    messages: {
        "wwwtool:test1"(args) {
            Editor.log("ttt ", args)
        }
    }
});