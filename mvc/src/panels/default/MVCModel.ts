import { ScriptDataModel } from "../../main";
import { LinkItem } from "./ui/linkItem";

export interface MVCModel {
    model?: AssetItem,
    layer?: AssetItem,
    mediator?: AssetItem,
    proxy?: AssetItem,
    prefab?: AssetItem,
}

export interface AssetItem {
    name: string,
    path: string,
    constAppend?: boolean,
    appendPath?: string,
    link?: ScriptLinkModel,
}

export interface ScriptLinkModel {
    status: boolean,
    script: ScriptDataModel,
    item: LinkItem,
}

export enum MVCModelName {
    Mediator = 'mediator',
    Proxy = 'proxy',
    Layer = 'layer',
    Model = 'model',
    Prefab = 'prefab',
}