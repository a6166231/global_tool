<template>
    <div class="row">
        <el-checkbox v-model="component!.enabled" size="small" style="margin-right: 10px;" />
        <span class="header-title" style="flex: 1;">{{ name }}</span>
        <el-button size="small" @click="Utils.outputToConsole(component)">output</el-button>
    </div>
    <PropItem v-if="model" v-for="prop in model.props" :key="prop.key" :model="prop.custom ? model : component"
        :prop-name="prop.name" :prop-key="prop.key" :prop-data="prop" :update-key="updateKey!"></PropItem>
</template>

<script setup lang="ts">
import { ComponentManager } from '../misc/ComponentManager';
import Utils from '../misc/Utils';
import PropItem from './PropItem.vue';

const props = defineProps({
    name: String,
    component: Object,
    updateKey: Number,
});

const model = ComponentManager.getCustomViewModel(props.name!, () => props.component)!;

</script>
