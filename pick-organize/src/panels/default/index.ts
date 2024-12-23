import { readFileSync } from 'fs-extra';
import { join } from 'path';
import { createApp, App, onMounted } from 'vue';
import typeEnum from './typeEnum';
import { po } from '../../po';
import { LocalGroupModel } from './localCfg';
import { dragDisableSet } from '../../assetsMap';
import utils from '../../utils';
import { group } from 'console';
import { AssetInfo } from '../../../@types/packages/asset-db/@types/public';
const panelDataMap = new WeakMap<any, App>();
/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }

let uutag = 1

module.exports = Editor.Panel.define({
    template: readFileSync(join(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: readFileSync(join(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
        dragArea: '#dragArea',
    },
    methods: {
    },
    ready() {
        if (this.$.app) {
            const app = createApp({});
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            app.component('MyCounter', {
                template: readFileSync(join(__dirname, '../../../static/template/vue/counter.html'), 'utf-8'),
                data() {
                    return {
                        groups: [],
                        allGroup: [],
                        searchGroup: [],
                        groupInfos: [],
                        cuseGroup: [],
                        typeEnum: typeEnum,
                        nowType: typeEnum[0].name,
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
                        this.groups = this.allGroup = po.localCfg.getLocalCfgJson()
                        this.cuseGroup = this.allGroup.filter((group: LocalGroupModel) => group.pin)
                    },
                    saveAllData() {
                        po.localCfg.setLocalCfgJson(this.allGroup)
                    },
                    onReGroupName() {
                        if (!this.nowGroup || this.bAddGroup) return

                        this.bReName = true
                        this.inputValue = this.nowGroup.name
                    },
                    drop(event: Event) {
                        if (!this.nowGroup) {
                            this.bAddGroup = false
                            this.addGroup()
                        }

                        let group: LocalGroupModel = this.nowGroup

                        let itemsSet = new Set(group.items)
                        let targetSet = group.bNew ? this.infos.ready : this.infos.group

                        type T = { name: string, type: string, value: string }
                        //@ts-ignore
                        let additional: Array<T> = JSON.parse(event.dataTransfer.getData('additional'))
                        let map: Record<string, T> = {}
                        additional.forEach(element => {
                            if (dragDisableSet.has(element.type)) return
                            let key = element.value.split('@')[0]
                            if (!map[key] || element.type != 'cc.Asset') {
                                map[key] = element
                            }
                        });

                        let status = false
                        let tag = ++uutag
                        for (let uuid in map) {
                            this.deepForeachAddGroup(targetSet, uuid, tag)
                            status = true
                            itemsSet.add(uuid)
                        }
                        this.RefreshGroupInfo()

                        group.items = Array.from(itemsSet)

                        if (status && !group.bNew) {
                            this.saveAllData()
                        }
                    },

                    deepForeachAddGroup(targetSet: Map<string, any>, uuid: string, tag: number) {
                        let itemInfo = {}
                        utils.QueryAssetInfo(uuid).then(info => {
                            if (tag != uutag) return
                            if (!info) return
                            if (info.isDirectory) {
                                utils.QueryAssetList(info.url).then(list => {
                                    if (tag != uutag) return
                                    list?.forEach(v => {
                                        this.deepForeachAddGroup(targetSet, v.uuid, tag)
                                    })
                                })
                                targetSet.delete(uuid)
                                this.RefreshGroupInfo()
                                return
                            }

                            itemInfo = Object.assign({}, info)
                            targetSet.set(uuid, itemInfo)
                            this.RefreshGroupInfo()
                        })
                        targetSet.set(uuid, itemInfo)

                    },

                    clickGroup(group: any) {
                        if (group == this.nowGroup) return
                        this.bAddGroup = false
                        this.bReName = false
                        this.nowGroup = group
                        this.formatNowGroupData()
                    },
                    formatNowGroupData() {
                        let items = this.nowGroup.items || []
                        this.infos.group.clear()

                        for (let uuid of items) {
                            let itemInfo = {}
                            utils.QueryAssetInfo(uuid).then(info => {
                                itemInfo = Object.assign({}, info)
                                this.infos.group.set(uuid, itemInfo)
                                this.RefreshGroupInfo()
                            })
                            this.infos.group.set(uuid, itemInfo)
                        }
                        this.RefreshGroupInfo()
                    },
                    clickPin() {
                        if (!this.nowGroup) return
                        this.nowGroup.pin = !this.nowGroup.pin
                        if (!this.bAddGroup) {

                            if (this.nowGroup.pin) {
                                this.cuseGroup.push(this.nowGroup)
                            } else {
                                this.cuseGroup.splice(this.cuseGroup.indexOf(this.nowGroup), 1)
                            }
                            this.saveAllData()
                        }
                    },
                    addGroup() {
                        this.bAddGroup = !this.bAddGroup
                        this.nowGroup = this.bAddGroup ? {
                            name: "",
                            items: [],
                            bNew: true,
                        } : null
                        this.infos.ready.clear()
                        this.infos.group.clear()
                        this.RefreshGroupInfo()
                    },
                    delAsset(uuid: string) {
                        if (!this.nowGroup) return
                        if (this.bReName) {
                            this.infos.ready.delete(uuid)
                            this.RefreshGroupInfo()
                            return
                        }
                        this.infos.group.delete(uuid)
                        this.nowGroup.items.splice(this.nowGroup.items.indexOf(uuid), 1)
                        this.saveAllData()
                        this.RefreshGroupInfo()
                    },
                    delGroup() {
                        if (!this.nowGroup || this.bAddGroup) return

                        if (this.bReName) {
                            this.bReName = false
                            return
                        }

                        this.allGroup.splice(this.allGroup.indexOf(this.nowGroup), 1)
                        this.cuseGroup.splice(this.cuseGroup.indexOf(this.nowGroup), 1)
                        this.searchGroup.splice(this.searchGroup.indexOf(this.nowGroup), 1)

                        this.infos.group.clear()
                        this.nowGroup = null
                        this.RefreshGroupInfo()
                        this.saveAllData()

                    },
                    inputGroupName(event: Event) {
                        //@ts-ignore
                        this.inputValue = event.target.value
                    },
                    onCreateNewGroup() {
                        if (!this.inputValue || !this.inputValue.length) return

                        if (this.bReName) {
                            this.nowGroup.name = this.inputValue
                            this.bReName = false
                            this.saveAllData()
                        } else {
                            let model = {
                                name: this.inputValue,
                                pin: this.nowGroup.pin,
                                items: Array.from(this.infos.ready.values()).map((v: any) => {
                                    return v.uuid
                                })
                            }
                            this.allGroup.push(model)

                            if (this.nowGroup.pin) {
                                this.cuseGroup.push(model)
                            }

                            this.saveAllData()
                            this.nowGroup = null
                            this.infos.ready.clear()
                            this.bAddGroup = false
                            this.inputValue = ''

                            this.RefreshGroupInfo()
                        }

                    },
                    openResource(uuid: string) {
                        utils.OpenAsset(uuid)
                    },
                    jumpResource(uuid: string) {
                        utils.JumpAsset(uuid)
                    },
                    onSearchInput(e: Event) {
                        //@ts-ignore
                        let txt = e.target?.value || ''
                        if (!txt.length) {
                            this.searchText = txt
                            return
                        }
                        this.searchGroup = this.allGroup.filter((group: LocalGroupModel) => {
                            return group.name.toLowerCase().includes(txt.toLowerCase());
                        });
                        this.searchText = txt
                    },
                    RefreshGroupInfo() {
                        this.bRefreshGroupInfo = !this.bRefreshGroupInfo
                    },
                    initListener() {
                    },
                },
                mounted() {
                    this.initAllData()
                    this.initListener()
                },
                watch: {
                    nowType<T extends typeof typeEnum[number]>(newVal: T, oldVal: T) {
                    },

                    bRefreshGroupInfo() {
                        this.infos.show = this.bAddGroup ? Array.from(this.infos.ready.values()) : Array.from(this.infos.group.values())
                    },
                    searchText() {
                        this.groups = this.searchText.length > 0 ? this.searchGroup : this.allGroup
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
