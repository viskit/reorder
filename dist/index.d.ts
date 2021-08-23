/// <reference types="lodash" />
import { LitElement } from "lit";
import { Gesture, GestureDetail } from "@ionic/core";
export declare type DraggableOrigin = "current" | "top-left" | "top-center" | "top-right" | "center-left" | "center-center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right";
declare type DataCacheMap = Map<HTMLElement, {
    rect: DOMRect;
    index?: number;
}>;
export declare class StartEvent extends Event implements GestureDetail {
    draggable: HTMLElement;
    container: HTMLElement;
    constructor(detail: GestureDetail, draggable: HTMLElement, container: HTMLElement, type?: string);
    startX: number;
    startY: number;
    startTime: number;
    currentX: number;
    currentY: number;
    velocityX: number;
    velocityY: number;
    deltaX: number;
    deltaY: number;
    currentTime: number;
    event: UIEvent;
    data: any;
}
export declare class DragEvent extends StartEvent {
    draggable: HTMLElement;
    container: HTMLElement;
    constructor(detail: GestureDetail, draggable: HTMLElement, container: HTMLElement);
}
export declare type ReorderEventArgs = {
    draggable: HTMLElement;
    container: HTMLElement;
    gestureDetail: GestureDetail;
    hoverable: HTMLElement;
    hoverIndex: number;
    hoverContainer: HTMLElement;
    draggableIndex: number;
    hoverableRect: DOMRect;
    draggableRect: DOMRect;
    x: number;
    y: number;
};
export declare class EndEvent extends StartEvent {
    draggable: HTMLElement;
    container: HTMLElement;
    constructor(detail: GestureDetail, draggable: HTMLElement, container: HTMLElement);
}
export declare class ReorderEvent extends StartEvent {
    constructor({ draggable, container, gestureDetail, hoverContainer, hoverIndex, hoverable, hoverableRect, draggableRect, draggableIndex, x, y, }: ReorderEventArgs, type?: string);
    hoverable: HTMLElement;
    hoverIndex: number;
    hoverContainer: HTMLElement;
    draggableIndex: number;
    hoverableRect: DOMRect;
    draggableRect: DOMRect;
    x: number;
    y: number;
}
export declare class DropEvent extends Event {
    complete: (after?: boolean) => void;
    data: any;
    constructor(complete: (after?: boolean) => void, data?: any);
}
export declare class Reorder extends LitElement {
    draggableOrigin: DraggableOrigin;
    dataCacheMap: DataCacheMap;
    gesture: Gesture;
    private gestureDetail;
    containers: HTMLElement[];
    private reorder;
    direction: "x" | "y";
    hoverPosition(x: number, y: number, width: number, height: number, currentX: number, currentY: number): ["left" | "right", "top" | "bottom"];
    enable: boolean;
    canStart: (_: GestureDetail) => boolean;
    onWillStart: (_: GestureDetail) => Promise<void>;
    private within;
    private calcCacheData;
    private offsetX;
    private offsetY;
    mutation: import("lodash").DebouncedFunc<(offset?: {
        x: number;
        y: number;
    }) => void>;
    firstUpdated(): void;
    createRenderRoot(): this;
}
declare global {
    interface HTMLElementTagNameMap {
        "viskit-reorder": Reorder;
    }
}
export {};
