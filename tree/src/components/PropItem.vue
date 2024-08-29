<template>
  <div class="row" v-if="Utils.checkPropShow(propData.show)">
    <span style="flex: 1">{{ propName }}</span>
    <el-select size="small" style="flex: 1" v-model="model[propKey]" v-if="Boolean(propData.enum)">
      <el-option v-for="item in CustomModel.CEnum" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>
    <el-select size="small" style="flex: 1" v-model="model[propKey]" v-else-if="propData.dropList">
      <el-option v-for="item of propData.dropList()" :key="item" :label="item" :value="item" />
    </el-select>
    <div style="display:contents" v-else-if="Boolean(propData.progress)">
      <el-input v-model="model[propKey]" style="width: 50px;" />
      <el-slider v-model="model[propKey]" style="width: 130;padding:15px 10px" size="small"
        :min="propData.progress.min || 0" :max="propData.progress.max || 100"
        :step="propData.progress.step || propData.progress.max ? propData.progress.max / 10 : 1" 
        @mousemove="propData.progress.touchmove"
        @mouseenter="propData.progress.touchstart" @mouseleave="propData.progress.touchend"
        />
    </div>
    <el-input v-model="CustomModel.font" readonly="true" style="flex: 1" v-else-if="propKey == 'font'" />
    <el-input-number v-model="CustomModel.numVal" :precision="2" size="small" controls-position="right" style="flex: 1"
      v-else-if="getPropType() == 'number'" />
    <el-input size="small" v-model="model[propKey]" style="flex: 1" v-else-if="getPropType() == 'string'" />
    <el-checkbox v-model="model[propKey]" size="small" style="margin-left: 10px" v-else-if="getPropType() == 'boolean'" />
    <el-color-picker v-model="CustomModel.color" size="small" style="flex: 1" color-format="hex" show-alpha
      v-else-if="getPropType() == 'cc.Color'" />
    <el-input v-model="CustomModel.spriteFrame" readonly="true" style="flex: 1"
      v-else-if="getPropType() == 'cc.SpriteFrame'" />
  </div>
</template>

<script setup lang="ts">
import { IComponentProp } from '../misc/ComponentManager';
import Utils from '../misc/Utils';

const props = defineProps<{
  model: any;
  propName: string;
  propKey: string;
  propData: IComponentProp;
  updateKey: number;
}>();

function getPropType() {
  const data = props.model[props.propKey];
  if (data == null || data == undefined) return null
  const dataType = typeof data;
  if (dataType === "object" && data.__classname__) {
    return data.__classname__;
  }
  return dataType;
}

class CustomModel {
  //这里增加number类型的值的get、set的容错 非number类型的默认给0
  //否则这里会因为数据类型从number变为其他类型导致 v-if中的type不是number类型了  输入框就不显示了
  static get numVal() {
    if (!Utils.checkNumVal(props.model[props.propKey])) return 0
    return props.model[props.propKey] || 0
  }
  static set numVal(val) {
    if (!Utils.checkNumVal(val)) val = 0
    props.model[props.propKey] = val || 0
  }

  static get color() {
    const origin = props.model[props.propKey];
    const hexA = origin.a.toString(16);
    return `#${origin.toHEX()}${hexA.length === 1 ? "0" + hexA : hexA}`;
  }

  static set color(v: string) {
    // @ts-ignore
    props.model[props.propKey] = new cc.Color().fromHEX(v);
  }

  static get spriteFrame() {
    return props.model[props.propKey].name
  }

  static get font() {
    return props.model[props.propKey]?.name || ''
  }

  static get CEnum() {
    let vEnums = []
    for (let k of Object.keys(props.propData.enum)) {
      if (!isNaN(Number(k))) {
        vEnums.push({
          value: Number(k),
          label: props.propData.enum[k]
        })
      }
    }
    return vEnums
  }
}
</script>
