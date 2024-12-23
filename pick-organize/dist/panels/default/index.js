"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const vue_1 = require("vue");
const typeEnum_1 = __importDefault(require("./typeEnum"));
const po_1 = require("../../po");
const assetsMap_1 = require("../../assetsMap");
const utils_1 = __importDefault(require("../../utils"));
const panelDataMap = new WeakMap();
/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
let uutag = 1;
module.exports = Editor.Panel.define({
    template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
        dragArea: '#dragArea',
    },
    methods: {},
    ready() {
        if (this.$.app) {
            const app = (0, vue_1.createApp)({});
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            app.component('MyCounter', {
                template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/vue/counter.html'), 'utf-8'),
                data() {
                    return {
                        groups: [],
                        allGroup: [],
                        searchGroup: [],
                        groupInfos: [],
                        cuseGroup: [],
                        typeEnum: typeEnum_1.default,
                        nowType: typeEnum_1.default[0].name,
                        bAddGroup: false,
                        bDragAreaReady: false,
                        bRefreshGroupInfo: false,
                        bReName: false,
                        nowGroup: null,
                        inputValue: "",
                        searchText: "",
                        infos: {
                            show: [],
                            ready: new Map,
                            group: new Map,
                        }
                    };
                }, methods: {
                    initAllData() {
                        this.groups = this.allGroup = po_1.po.localCfg.getLocalCfgJson();
                        this.cuseGroup = this.allGroup.filter((group) => group.pin);
                    },
                    saveAllData() {
                        po_1.po.localCfg.setLocalCfgJson(this.allGroup);
                    },
                    onReGroupName() {
                        if (!this.nowGroup || this.bAddGroup)
                            return;
                        this.bReName = true;
                        this.inputValue = this.nowGroup.name;
                    },
                    drop(event) {
                        if (!this.nowGroup) {
                            this.bAddGroup = false;
                            this.addGroup();
                        }
                        let group = this.nowGroup;
                        let itemsSet = new Set(group.items);
                        let targetSet = group.bNew ? this.infos.ready : this.infos.group;
                        //@ts-ignore
                        let additional = JSON.parse(event.dataTransfer.getData('additional'));
                        let map = {};
                        additional.forEach(element => {
                            if (assetsMap_1.dragDisableSet.has(element.type))
                                return;
                            let key = element.value.split('@')[0];
                            if (!map[key] || element.type != 'cc.Asset') {
                                map[key] = element;
                            }
                        });
                        let status = false;
                        let tag = ++uutag;
                        for (let uuid in map) {
                            this.deepForeachAddGroup(targetSet, uuid, tag);
                            status = true;
                            itemsSet.add(uuid);
                        }
                        this.RefreshGroupInfo();
                        group.items = Array.from(itemsSet);
                        if (status && !group.bNew) {
                            this.saveAllData();
                        }
                    },
                    deepForeachAddGroup(targetSet, uuid, tag) {
                        let itemInfo = {};
                        utils_1.default.QueryAssetInfo(uuid).then(info => {
                            if (tag != uutag)
                                return;
                            if (!info)
                                return;
                            if (info.isDirectory) {
                                utils_1.default.QueryAssetList(info.url).then(list => {
                                    if (tag != uutag)
                                        return;
                                    list === null || list === void 0 ? void 0 : list.forEach(v => {
                                        this.deepForeachAddGroup(targetSet, v.uuid, tag);
                                    });
                                });
                                targetSet.delete(uuid);
                                this.RefreshGroupInfo();
                                return;
                            }
                            itemInfo = Object.assign({}, info);
                            targetSet.set(uuid, itemInfo);
                            this.RefreshGroupInfo();
                        });
                        targetSet.set(uuid, itemInfo);
                    },
                    clickGroup(group) {
                        if (group == this.nowGroup)
                            return;
                        this.bAddGroup = false;
                        this.bReName = false;
                        this.nowGroup = group;
                        this.formatNowGroupData();
                    },
                    formatNowGroupData() {
                        let items = this.nowGroup.items || [];
                        this.infos.group.clear();
                        for (let uuid of items) {
                            let itemInfo = {};
                            utils_1.default.QueryAssetInfo(uuid).then(info => {
                                itemInfo = Object.assign({}, info);
                                this.infos.group.set(uuid, itemInfo);
                                this.RefreshGroupInfo();
                            });
                            this.infos.group.set(uuid, itemInfo);
                        }
                        this.RefreshGroupInfo();
                    },
                    clickPin() {
                        if (!this.nowGroup)
                            return;
                        this.nowGroup.pin = !this.nowGroup.pin;
                        if (!this.bAddGroup) {
                            if (this.nowGroup.pin) {
                                this.cuseGroup.push(this.nowGroup);
                            }
                            else {
                                this.cuseGroup.splice(this.cuseGroup.indexOf(this.nowGroup), 1);
                            }
                            this.saveAllData();
                        }
                    },
                    addGroup() {
                        this.bAddGroup = !this.bAddGroup;
                        this.nowGroup = this.bAddGroup ? {
                            name: "",
                            items: [],
                            bNew: true,
                        } : null;
                        this.infos.ready.clear();
                        this.infos.group.clear();
                        this.RefreshGroupInfo();
                    },
                    delAsset(uuid) {
                        if (!this.nowGroup)
                            return;
                        if (this.bReName) {
                            this.infos.ready.delete(uuid);
                            this.RefreshGroupInfo();
                            return;
                        }
                        this.infos.group.delete(uuid);
                        this.nowGroup.items.splice(this.nowGroup.items.indexOf(uuid), 1);
                        this.saveAllData();
                        this.RefreshGroupInfo();
                    },
                    delGroup() {
                        if (!this.nowGroup || this.bAddGroup)
                            return;
                        if (this.bReName) {
                            this.bReName = false;
                            return;
                        }
                        this.allGroup.splice(this.allGroup.indexOf(this.nowGroup), 1);
                        this.cuseGroup.splice(this.cuseGroup.indexOf(this.nowGroup), 1);
                        this.searchGroup.splice(this.searchGroup.indexOf(this.nowGroup), 1);
                        this.infos.group.clear();
                        this.nowGroup = null;
                        this.RefreshGroupInfo();
                        this.saveAllData();
                    },
                    inputGroupName(event) {
                        //@ts-ignore
                        this.inputValue = event.target.value;
                    },
                    onCreateNewGroup() {
                        if (!this.inputValue || !this.inputValue.length)
                            return;
                        if (this.bReName) {
                            this.nowGroup.name = this.inputValue;
                            this.bReName = false;
                            this.saveAllData();
                        }
                        else {
                            let model = {
                                name: this.inputValue,
                                pin: this.nowGroup.pin,
                                items: Array.from(this.infos.ready.values()).map((v) => {
                                    return v.uuid;
                                })
                            };
                            this.allGroup.push(model);
                            if (this.nowGroup.pin) {
                                this.cuseGroup.push(model);
                            }
                            this.saveAllData();
                            this.nowGroup = null;
                            this.infos.ready.clear();
                            this.bAddGroup = false;
                            this.inputValue = '';
                            this.RefreshGroupInfo();
                        }
                    },
                    openResource(uuid) {
                        utils_1.default.OpenAsset(uuid);
                    },
                    jumpResource(uuid) {
                        utils_1.default.JumpAsset(uuid);
                    },
                    onSearchInput(e) {
                        var _a;
                        //@ts-ignore
                        let txt = ((_a = e.target) === null || _a === void 0 ? void 0 : _a.value) || '';
                        if (!txt.length) {
                            this.searchText = txt;
                            return;
                        }
                        this.searchGroup = this.allGroup.filter((group) => {
                            return group.name.toLowerCase().includes(txt.toLowerCase());
                        });
                        this.searchText = txt;
                    },
                    RefreshGroupInfo() {
                        this.bRefreshGroupInfo = !this.bRefreshGroupInfo;
                    },
                    initListener() {
                    },
                },
                mounted() {
                    this.initAllData();
                    this.initListener();
                },
                watch: {
                    nowType(newVal, oldVal) {
                    },
                    bRefreshGroupInfo() {
                        this.infos.show = this.bAddGroup ? Array.from(this.infos.ready.values()) : Array.from(this.infos.group.values());
                    },
                    searchText() {
                        this.groups = this.searchText.length > 0 ? this.searchGroup : this.allGroup;
                    },
                }
            });
            app.mount(this.$.app);
            panelDataMap.set(this, app);
        }
    },
    beforeClose() { },
    close() {
        const app = panelDataMap.get(this);
        if (app) {
            app.unmount();
        }
    },
});
