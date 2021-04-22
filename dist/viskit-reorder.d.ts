import { LitElement } from "lit-element";
import { Gesture, GestureDetail } from "@ionic/core";
declare type DataCacheMap = Map<HTMLElement, {
    rect: DOMRect;
    index: number;
    itemDataMap: Map<HTMLElement, {
        rect: DOMRect;
        index: number;
    }>;
}>;
export declare type onStartEvent = CustomEvent<{
    el: HTMLElement;
    gestureDetail: GestureDetail;
    container: HTMLElement;
    reorder: Reorder;
}>;
export declare type onDragEvent = CustomEvent<{
    el: HTMLElement;
    gestureDetail: GestureDetail;
    container: HTMLElement;
    reorder: Reorder;
    hoverEl: HTMLElement;
    hoverContainer: HTMLElement;
    hoverIndex: number;
}>;
export declare type onDropEvent = CustomEvent<{
    el: HTMLElement;
    gestureDetail: GestureDetail;
    complete: (bool: boolean) => void;
    hoverEl: HTMLElement;
    hoverContainer: HTMLElement;
    hoverIndex: number;
}>;
declare const within: unique symbol;
export declare class Reorder extends LitElement {
    dataCacheMap: DataCacheMap;
    constructor();
    gesture: Gesture;
    private selectedItemEl;
    containers: HTMLElement[];
    containerSelectors: string | string[];
    timeout: number;
    draggableFilter(el: HTMLElement): boolean;
    direction: "x" | "y";
    hoverPosition(x: number, y: number, width: number, height: number, currentX: number, currentY: number): ["left" | "right", "top" | "bottom"];
    complete(bool?: boolean): void;
    [within](x: any, y: any, width: any, height: any, currentX: any, currentY: any): boolean;
    updateContainers(): Promise<void>;
    updated(map: Map<string, any>): void;
    private _lastHoverData;
    firstUpdated(): void;
    createRenderRoot(): this;
}
declare global {
    interface HTMLElementTagNameMap {
        "viskit-reorder": Reorder;
    }
}
export {};
