<template>
  <div style="width: 100%;display: flex;" :style="{ height: 35 }">
    <input style="width: 100%;height:100%;" type="text" placeholder="是兄弟就来砍我" :value="searchStr"
      @click="handleSearchChange" @input="handleSearchChange">
    <div style="margin-right: 0;width: 35px;height: 100%" @click="handleChearSearch">
      <img style="width: 35px; height: 35px;"
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAWCAYAAAArdgcFAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAb9JREFUeNpi/P//P8OQAyBHM9HSAmyG+wDxOihNDCBafQ0Qv0bCsQTUdyOpBVmgixwsyEAIpjDIiev9/nlqv5Slmd/gsQBucEog/weQeiC7H5fhYJeDDLy7Xe/fs/0G/08u1/yNwwIUg0FqQfjaJp3V+CK05e7Tv/OXbnn5FcSRlWBnWdajxg+0oB/JApDBCSAG0GDWpjxFfhD7+89/bwR4WcqJiaTupmzxzzAXIfkAq4vv7tB7DaSV0JMiORYQNBhmOCMRPshICZHkAXEev/j5Z/WOV9+LEmR5YUHByc5kLuV44R45hoNAP9CCFJgFMIDPYGJzKCiMY+qmvvxx+OyHH8gS7TMfsgIN9iI1hzKgpwqgyzlsjQU4kCUL4mV4bA3ZmoDMHFINRzEYFiTvPv5+2bfg8WdwjuNnZZ5er8pHyAKcOQ85tdzconsfSAuC5JFTy5UN2n+AFrxDtwBrDiVgMNwBOCwgXLYQMBinBcHO3PNwpRaQzROBGYUx2kecGyTw+evfB7zczEbAVPEei+Glc9Z/nF036f5HWBw05yvyEiyfE/z49l3frHMeh4sx1BfFCR8BqScl+w/uag4gwABkfT32dt4TeQAAAABJRU5ErkJggg==">
    </div>
    <div style="margin-right: 0;width: 35px;height: 100%; transform: rotate(-45deg)"
      @click="treeMap.length && props.show && Utils.createRayCaught()">
      <img style="width: 35px; height: 35px;"
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAC+0lEQVQ4jZVVz2sTQRT+Zmc3u9nmVw0US0trragnfxQREbxYpBcvFsGKhx68mIqggopXQT2L2IKKFi14EOtRL/0DBClqQSp4VEqVNmnSJpvszjyZTfOrm5j2wezwvvfet9/MvNllvU4X2lm2Z+UcgBSAqdjv5Pt2+do2CFNatzZrv4mdYbu1WeW3JSUitBrZnpVxlmST4ddR8FM67JkoWJxNKvx/dRok0GzkelfPswibDr+IQtvP0ZWP+HP4VRQszKZzvaujrWqbKs31rY7AwFvrWQTaEY7BTBK9a3F/Vr71vAMw8C7Xt3p6W0rX+9PHwfHRehIBP6Fj78oudOYshBzNn5XPTxqwHnUAHHPr/emjQaWSUBnrA+l9YPhkPrTBh3X0/00gsWaBOYAoSX9WvsL5iAHzng0wzK8PpPfU81SXvzGY6QRwM3TXAh810LccRyJtgjkEURLVoXyFqzi/YMC4ZakDv70xmIlXuHQSVOmE+/oVM8XHQ+hZiiGeMcEEIPw1NRoDEHdN9Igofl0mUIZS3tMikaCrKlEnApyD2cf8YiilXzdhFDnIlXDIhelxaJIFSKVGKGoC0iV/D/UbJihLE4UDWWktxq6xWJJf0s4aM8YDS2181RIZE11LNsIFPUBaCHv4051HJlGsgQJw7xQgP3hjquIb/RAojW3UEmyG9EtCZFmH4QSV5jtKSMccuOMFIE+1gOs/v+vGV3vBPZw/BCBUDUbYZ5ISJeZBFnmAVOEqTouqB+lYfUjx6SQAfd5eqKDeUD6uZoULT0A4IkCqcKrBP/V5e63i+Hyqr5qZwoVH8IrB01d4fd1Wjhak5SLpSohiUKnCy3W0E1Jsk3RHSjdJPelfzwCp14YULUgVri6BbKJU4Q11QaWNBX5Xknq7UkQtlJIfZ1RR2hgPLL/S6v7yhYRwgyuRonyQ9bmNpOryN7Hyl4sgKXijCoPqa1S3HVs49M2uCBoBXgzIDbVIqIe3pDD7ixHI14fl5OYvuZ1NeXPaREMSgH95IhIq6Ht+IQAAAABJRU5ErkJggg==">
    </div>
    <div style="margin-right: 0;width: 35px;height: 100%;" @click="props.show && Utils.directorPause()">
      <img style="width: 35px; height: 35px;"
        src="data:image/png;base64,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">
    </div>
  </div>
  <div style="width: 100%;" :style="{ height: treeViewHeight }">
    <el-tree-v2 ref="treeView" :props="defaultProps" empty-text="正在加载场景" :highlight-current="true"
      :expand-on-click-node="false" @current-change="handleCurrentNodeChange" :height="treeViewHeight">
      <template #default="{ node }">
        <el-scrollbar>
          <span @dblclick="Utils.jumpPrefab(node.data)" :class="{ 'node-hide': !node.data.active , 'bprefab': node.data.bprefab }">{{ (node.data.bprefab ? '[P]' : '') + node.label }}</span>
        </el-scrollbar>
      </template>
    </el-tree-v2>
  </div>
  <div style="width: 100%;border-top: 2px solid #414243;" :style="{ height: treeViewHeight }">
    <template v-if="updateKey !== 0 && Utils.checkNodeValid(currentNode)">
      <el-scrollbar>
        <CCNode :cc-node="currentNode" :update-key="updateKey"></CCNode>
        <div class="row" style="height: 2px;background-color: #1d1e21"></div>
        <template v-for="component in Utils.getComponents(currentNode)" :key="component.name">
          <CCComponent v-if="component.name.startsWith('cc.')" :component="component.target" :name="component.name"
            :update-key="updateKey"></CCComponent>
          <UserComponent v-else :component="component.target" :name="component.name" :update-key="updateKey">
          </UserComponent>
          <div class="row" style="height: 2px;background-color: #1d1e21"></div>
        </template>
      </el-scrollbar>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { ref } from 'vue-demi';
import CCNode from './CCNode.vue';
import Utils from '../misc/Utils';
import CCComponent from './CCComponent.vue';
import UserComponent from './UserComponent.vue';

//@ts-ignore
window["__updateSelectCurrentNode"] = (node: any) => {
  console.log('nodePath: ' + Utils.getNodePath(node))
  console.log(node)
  currentNode = node;
  handleNodeExpandDeep(currentNode);
}

const props = defineProps({
  show: Boolean,
  searchStr: String,
});

interface TreeNode {
  name: string;
  uuid: string;
  active: boolean;
  children?: TreeNode[];
  path: string[];
  bprefab: boolean;
}

let updateKey = ref(1);
let currentNode: any;
const expandedNodeMap = new Map();
let expandedKeys: string[] = [];
const defaultProps = {
  value: 'uuid',
  label: 'name',
  children: 'children',
};

let treeMap: Array<any> = []

const treeViewHeight = (window.innerHeight - 120) / 2;
const treeView = ref(null);

onMounted(() => {
  console.log('ccc-devtools init');
});
function getChildByUuidPath(node: any, path: string[], index: number): any {
  if (index >= path.length) {
    return node;
  }
  node = node.getChildByUuid(path[index]);
  return getChildByUuidPath(node, path, index + 1);
}

let searchStr: string = ''
let dirty: boolean = true
let searchResult: Array<any> = []
function handleSearchChange(data: any) {
  searchStr = data.target.value
  dirty = false;
}

function handleChearSearch(data: any) {
  searchStr = ""
  dirty = false;
  currentNode && handleNodeExpandDeep(currentNode);
}

function initSearchNodeList() {
  if (dirty) return;
  dirty = true
  searchResult = getMatchedFiles(searchStr)
}

function getMatchedFiles(keyword: string) {
  const components = keyword.split('');
  for (let i = 0, l = components.length; i < l; i++) {
    if (/[*.?+$^()\[\]{}|\\\/]/.test(components[i])) {
      components[i] = '\\' + components[i];
    }
  }
  const pattern = components.join('.*?'), regExp = new RegExp(pattern, 'i');
  const caches = treeMap;
  let results: any = []
  if (treeMap) {
    let getNodeInTreeByName = (node: TreeNode, result: any[] = []) => {
      if (!node.children) return []
      for (let child of node.children) {
        const match = child.name.match(regExp);
        if (match) {
          result.push(cloneNewNode(child));
        }
        getNodeInTreeByName(child, result)
      }
      return result;
    }
    for (let mapNode of caches) {
      results.push(...getNodeInTreeByName(mapNode))
    }
  }
  return results;
}

function cloneNewNode(bakNode: TreeNode) {
  let deepNew = (bak: TreeNode, lv: number) => {
    let node: TreeNode = {
      name: bak.name,
      uuid: bak.uuid + `_${lv}`,
      active: bak.active,
      children: [],
      path: [...bak.path],
      bprefab: bak.bprefab
    }
    if (!bak.children || !bak.children.length) return node;
    for (let child of bak.children) {
      node.children.push(deepNew(child, lv + 1))
    }
    return node
  }

  let newNode = deepNew(bakNode, 1)
  return newNode
}

function handleCurrentNodeChange(data: any) {
  // @ts-ignore
  const ccNode = getChildByUuidPath(cc.director.getScene(), data.path, 0);
  if (data) {
    currentNode = ccNode;
  } else {
    currentNode = null;
  }
}

function handleNodeExpandDeep(node: any) {
  let temp = node;
  expandedNodeMap.clear()
  let count = 0
  while (temp) {
    if (temp.parent)
      count += temp.parent.children.indexOf(temp) + 1
    expandedNodeMap.set(temp.uuid, true)
    temp = temp.parent
  }

  treeView.value.setExpandedKeys([...expandedNodeMap.keys()])
  treeView.value.setCurrentKey(node.uuid)

  //这里得加个延迟跳转 否则滚动坐标会因为tree的展开和收缩出现问题
  //鼠标的滚动也会导致这里的element的滚动出现问题 所以写成这样子
  setTimeout(() => {
    getElement().scrollTop = (count + 1) * getElItemHeight() - getElement().offsetHeight / 2
  }, 100);
}

// function handleNodeExpand(data: any) {
//   expandedNodeMap.set(data.uuid, true);
//   expandedKeys = [...expandedNodeMap.keys()];
// }

// function handleNodeCollapse(data: any) {
//   expandedNodeMap.delete(data.uuid);
//   expandedKeys = [...expandedNodeMap.keys()];
// }

function setChildren(container: TreeNode[], children: any[], path: string[]) {
  children.forEach(ccNode => {
    const childPath = path.concat(ccNode.uuid);
    const node:TreeNode = {
      uuid: ccNode.uuid,
      name: ccNode.name,
      active: ccNode.activeInHierarchy,
      children: [],
      path: childPath,
      bprefab: Boolean(ccNode.prefab?.root?.uuid == ccNode.uuid) ? ccNode.prefab?.asset?.uuid: false
    };
    if (ccNode.children && ccNode.children.length > 0) {
      setChildren(node.children, ccNode.children, childPath);
    }
    container.push(node);
  });
}

function refreshTree() {
  // @ts-ignore
  if (props.show && window.ccdevShow && cc.director.getScene()) {
    treeMap = [];
    //@ts-ignore
    setChildren(treeMap, cc.director.getScene().children, []);
    let treeData = treeMap
    if (searchStr.length > 0) {
      initSearchNodeList()
      treeData = searchResult;
    }
    (treeView.value as any).setData(treeData);
    updateKey.value = -updateKey.value;
  }
  window.requestAnimationFrame(refreshTree);
}

function init() {
  refreshTree();
}

const intervalId = setInterval(() => {
  // @ts-ignore
  if (window['cc'] && cc.director.getScene()) {
    init();
    clearInterval(intervalId);
  }
}, 1000);


let _treeElement;
let getElItemHeight = function () {
  return getElement().getElementsByClassName('el-tree-node')[0]?.offsetHeight || 26
}
let getElement = function () {
  if (_treeElement) return _treeElement
  _treeElement = document.querySelector('.el-tree-virtual-list')
  return _treeElement
}


</script>

<style>
.row {
  display: flex;
  justify-content: center;
  margin: 10px;
}

.el-input__inner {
  text-align: left !important;
}

.el-input__wrapper {
  padding-left: 10px !important;
}

.el-color-picker {
  flex: 1 !important;
}

.el-color-picker__trigger {
  width: 100% !important;
}

.el-tree-virtual-list {
  overflow-y: hidden !important;
}

span {
  color: #cfd3dc;
}

.node-hide {
  opacity: 0.3;
}

.bprefab {
  font-weight: bold;
  color: #39ff95 ;
}
</style>
