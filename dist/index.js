/******/ // The require scope
/******/ var __webpack_require__ = {};
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "_t": () => (/* binding */ DragEvent),
  "AP": () => (/* binding */ DropEvent),
  "tm": () => (/* binding */ Reorder),
  "tO": () => (/* binding */ ReorderEvent),
  "T4": () => (/* binding */ StartEvent)
});

;// CONCATENATED MODULE: external "tslib"
const external_tslib_namespaceObject = require("tslib");
;// CONCATENATED MODULE: external "lit"
const external_lit_namespaceObject = require("lit");
;// CONCATENATED MODULE: external "lit/decorators.js"
const decorators_js_namespaceObject = require("lit/decorators.js");
;// CONCATENATED MODULE: external "@ionic/core"
const core_namespaceObject = require("@ionic/core");
;// CONCATENATED MODULE: external "lodash"
const external_lodash_namespaceObject = require("lodash");
;// CONCATENATED MODULE: ./src/index.ts





class StartEvent extends Event {
    constructor(detail, draggable, container, type = "viskit-start") {
        super(type);
        this.draggable = draggable;
        this.container = container;
        for (let k in detail) {
            if (k !== "type") {
                this[k] = detail[k];
            }
        }
        if (!detail.data)
            detail.data = {};
    }
}
class DragEvent extends StartEvent {
    constructor(detail, draggable, container) {
        super(detail, draggable, container, "viskit-drag");
        this.draggable = draggable;
        this.container = container;
    }
}
class ReorderEvent extends StartEvent {
    constructor({ draggable, container, gestureDetail, hoverContainer, hoverIndex, hoverable, hoverableRect, draggableRect, draggableIndex, x, y, }, type = "viskit-reorder") {
        super(gestureDetail, draggable, container, type);
        this.hoverable = hoverable;
        this.hoverIndex = hoverIndex;
        this.hoverContainer = hoverContainer;
        this.draggableIndex = draggableIndex;
        this.hoverableRect = hoverableRect;
        this.draggableRect = draggableRect;
        this.x = x;
        this.y = y;
    }
}
class DropEvent extends Event {
    constructor(complete, data = {}) {
        super("viskit-drop");
        this.complete = complete;
        this.data = data;
    }
}
class Reorder extends external_lit_namespaceObject.LitElement {
    constructor() {
        super(...arguments);
        this.draggableOrigin = "center-center";
        this.dataCacheMap = null;
        this.containers = [this];
        this.timeout = 500;
        this.reorder = (0,external_lodash_namespaceObject.debounce)((gestureDetail) => {
            let { currentX, currentY, data: { triggerOffsetX, triggerOffsetY, draggable }, } = gestureDetail;
            currentX += this.offsetX;
            currentY += this.offsetY;
            const triggerX = currentX + triggerOffsetX + this.offsetX;
            const triggerY = currentY + triggerOffsetY + this.offsetY;
            for (let hoverContainer of this.containers) {
                const { x, y, width, height } = this.dataCacheMap.get(hoverContainer).rect;
                if (this.within(x, y, width, height, triggerX, triggerY)) {
                    const childs = Array.from(hoverContainer.children);
                    for (let i = 0, len = childs.length; i < len; i++) {
                        const child = childs[i];
                        const data = this.dataCacheMap.get(child);
                        if (data) {
                            const { rect: { x, y, width, height }, index, } = data;
                            if (this.within(x, y, width, height, triggerX, triggerY)) {
                                const hoverable = child;
                                const hoverIndex = index;
                                const { index: draggableIndex, rect: draggableRect } = this.dataCacheMap.get(gestureDetail.data.draggable);
                                gestureDetail.data = Object.assign(Object.assign({}, gestureDetail.data), { hoverable,
                                    hoverContainer,
                                    hoverIndex,
                                    draggableIndex, draggable: gestureDetail.data.draggable, container: gestureDetail.data.container, draggableRect, hoverableRect: this.dataCacheMap.get(hoverable).rect, x: triggerX, y: triggerY });
                                this.dispatchEvent(new ReorderEvent({
                                    gestureDetail,
                                    hoverable,
                                    hoverContainer,
                                    hoverIndex,
                                    draggableIndex,
                                    draggable: gestureDetail.data.draggable,
                                    container: gestureDetail.data.container,
                                    draggableRect,
                                    hoverableRect: this.dataCacheMap.get(hoverable).rect,
                                    x: triggerX,
                                    y: triggerY,
                                }));
                                break;
                            }
                        }
                    }
                    break;
                }
            }
        });
        this.direction = "y";
        this.offsetX = 0;
        this.offsetY = 0;
        this.mutation = (0,external_lodash_namespaceObject.debounce)((offset) => {
            if (offset) {
                this.offsetX = offset.x;
                this.offsetY = offset.y;
            }
            else {
                this.calcCacheData();
            }
            if (this.gestureDetail) {
                this.reorder(this.gestureDetail);
            }
        }, 50);
    }
    canStart(args) {
        return true;
    }
    hoverPosition(x, y, width, height, currentX, currentY) {
        return [
            currentX <= x + width / 2 ? "left" : "right",
            currentY <= y + height / 2 ? "top" : "bottom",
        ];
    }
    within(x, y, width, height, currentX, currentY) {
        return (x <= currentX &&
            x + width >= currentX &&
            y <= currentY &&
            y + height >= currentY);
    }
    calcCacheData() {
        this.dataCacheMap = new Map();
        for (let index = 0, len = this.containers.length; index < len; index++) {
            const container = this.containers[index];
            const map = new Map();
            this.dataCacheMap.set(container, {
                rect: container.getBoundingClientRect(),
            });
            const childs = Array.from(container.children);
            for (let i = 0, len = childs.length; i < len; i++) {
                const child = childs[i];
                this.dataCacheMap.set(child, {
                    rect: child.getBoundingClientRect(),
                    index: i,
                });
            }
        }
    }
    firstUpdated() {
        let started = false, ct;
        const onEnd = (gestureDetail) => {
            if (started) {
                started = false;
                this.gestureDetail = null;
                clearTimeout(ct);
                this.dispatchEvent(new DropEvent((after = true) => {
                    const selectedItemEl = gestureDetail.data.draggable;
                    if (selectedItemEl) {
                        const { hoverContainer, hoverable, hoverIndex } = gestureDetail.data;
                        if (hoverable) {
                            hoverable.insertAdjacentElement(after ? "afterend" : "beforebegin", selectedItemEl);
                            this.mutation();
                        }
                    }
                }, gestureDetail.data));
            }
        };
        this.gesture = (0,core_namespaceObject.createGesture)({
            el: this,
            direction: "y",
            gestureName: "pzl-reorder-list",
            disableScroll: false,
            canStart: (gestureDetail) => {
                ct = setTimeout(() => {
                    // generate DataCacheMap by containers
                    this.calcCacheData();
                    let draggable, container;
                    let draggableRect;
                    for (let _container of this.containers) {
                        const { rect } = this.dataCacheMap.get(_container);
                        if (this.within(rect.x, rect.y, rect.width, rect.height, gestureDetail.currentX, gestureDetail.currentY)) {
                            container = _container;
                            const children = Array.from(container.children);
                            for (let child of children) {
                                if (this.dataCacheMap.has(child)) {
                                    const { rect, index } = this.dataCacheMap.get(child);
                                    if (this.within(rect.x, rect.y, rect.width, rect.height, gestureDetail.currentX, gestureDetail.currentY)) {
                                        draggable = child;
                                        draggableRect = rect;
                                        break;
                                    }
                                }
                            }
                            break;
                        }
                    }
                    if (draggable) {
                        gestureDetail.data = {
                            draggable,
                            container,
                        };
                        if (this.canStart(Object.assign(Object.assign({}, gestureDetail), { draggable,
                            container }))) {
                            started = true;
                            // calc drggable trigger point by origin
                            let triggerOffsetX = 0;
                            let triggerOffsetY = 0;
                            if (this.draggableOrigin !== "current") {
                                const { startX, startY } = gestureDetail;
                                const { left, top, width, height } = draggableRect;
                                switch (this.draggableOrigin) {
                                    case "center-center":
                                        triggerOffsetX = width / 2 + left;
                                        triggerOffsetY = height / 2 + top;
                                        break;
                                    case "center-left":
                                        triggerOffsetX = left;
                                        triggerOffsetY = height / 2 + top;
                                        break;
                                    case "center-right":
                                        triggerOffsetX = width + left;
                                        triggerOffsetY = height / 2 + top;
                                        break;
                                    case "top-center":
                                        triggerOffsetX = width / 2 + left;
                                        triggerOffsetY = top;
                                        break;
                                    case "top-left":
                                        triggerOffsetX = left;
                                        triggerOffsetY = top;
                                        break;
                                    case "top-right":
                                        triggerOffsetX = width + left;
                                        triggerOffsetY = top;
                                        break;
                                    case "bottom-center":
                                        triggerOffsetX = width / 2 + left;
                                        triggerOffsetY = height + top;
                                        break;
                                    case "bottom-left":
                                        triggerOffsetX = left;
                                        triggerOffsetY = height + top;
                                        break;
                                    case "bottom-right":
                                        triggerOffsetX = width + left;
                                        triggerOffsetY = height + top;
                                        break;
                                }
                                triggerOffsetX -= startX;
                                triggerOffsetY -= startY;
                            }
                            gestureDetail.data.triggerOffsetX = triggerOffsetX;
                            gestureDetail.data.triggerOffsetY = triggerOffsetY;
                            this.dispatchEvent(new StartEvent(gestureDetail, draggable, container));
                        }
                    }
                }, this.timeout);
                return true;
            },
            onMove: (gestureDetail) => {
                clearTimeout(ct);
                if (started) {
                    this.dispatchEvent(new DragEvent(gestureDetail, gestureDetail.data.draggable, gestureDetail.data.container));
                    this.reorder(gestureDetail);
                }
                this.gestureDetail = gestureDetail;
            },
            onEnd,
            notCaptured: (ev) => {
                if (started) {
                    return onEnd(ev);
                }
            },
        });
        this.gesture.enable(true);
    }
    updated() {
        console.log(this.containers);
    }
    createRenderRoot() {
        return this;
    }
}
(0,external_tslib_namespaceObject.__decorate)([
    (0,decorators_js_namespaceObject.property)({ type: String })
], Reorder.prototype, "draggableOrigin", void 0);
(0,external_tslib_namespaceObject.__decorate)([
    (0,decorators_js_namespaceObject.property)({ attribute: false })
], Reorder.prototype, "containers", void 0);
(0,external_tslib_namespaceObject.__decorate)([
    (0,decorators_js_namespaceObject.property)({ type: Number })
], Reorder.prototype, "timeout", void 0);
(0,external_tslib_namespaceObject.__decorate)([
    (0,decorators_js_namespaceObject.property)({ type: String })
], Reorder.prototype, "direction", void 0);
(0,external_tslib_namespaceObject.__decorate)([
    (0,decorators_js_namespaceObject.property)({ attribute: false })
], Reorder.prototype, "hoverPosition", null);
window.customElements.define("viskit-reorder", Reorder);

var __webpack_exports__DragEvent = __webpack_exports__._t;
var __webpack_exports__DropEvent = __webpack_exports__.AP;
var __webpack_exports__Reorder = __webpack_exports__.tm;
var __webpack_exports__ReorderEvent = __webpack_exports__.tO;
var __webpack_exports__StartEvent = __webpack_exports__.T4;
export { __webpack_exports__DragEvent as DragEvent, __webpack_exports__DropEvent as DropEvent, __webpack_exports__Reorder as Reorder, __webpack_exports__ReorderEvent as ReorderEvent, __webpack_exports__StartEvent as StartEvent };
