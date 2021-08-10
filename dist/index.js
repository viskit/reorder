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
  "t": () => (/* binding */ Reorder)
});

;// CONCATENATED MODULE: external "tslib"
const external_tslib_namespaceObject = require("tslib");
;// CONCATENATED MODULE: external "lit-element"
const external_lit_element_namespaceObject = require("lit-element");
;// CONCATENATED MODULE: external "@ionic/core"
const core_namespaceObject = require("@ionic/core");
;// CONCATENATED MODULE: ./src/index.ts



const within = Symbol.for("within");
class Reorder extends external_lit_element_namespaceObject.LitElement {
    constructor() {
        super();
        this.dataCacheMap = null;
        this.containers = [this];
        this.containerSelectors = "";
        this.timeout = 500;
        this.direction = "y";
        this.draggableOrigin = "center";
        this.complete = this.complete.bind(this);
        this.draggableFilter = this.draggableFilter.bind(this);
    }
    draggableFilter(el) {
        for (let container of this.containers) {
            if (Array.from(container.children).find((dom) => dom === el)) {
                return true;
            }
        }
        return false;
    }
    hoverPosition(x, y, width, height, currentX, currentY) {
        return [
            currentX <= x + width / 2 ? "left" : "right",
            currentY <= y + height / 2 ? "top" : "bottom",
        ];
    }
    complete(bool = false) {
        const selectedItemEl = this.selectedItemEl;
        if (selectedItemEl) {
            if (bool) {
                const { hoverContainer, hoverEl, hoverIndex } = this._lastHoverData;
                if (hoverEl) {
                    hoverEl.insertAdjacentElement(hoverContainer.children.item(hoverIndex) === hoverEl
                        ? "beforebegin"
                        : "afterend", selectedItemEl);
                }
            }
            this.selectedItemEl = undefined;
        }
    }
    [within](x, y, width, height, currentX, currentY) {
        return (x <= currentX &&
            x + width >= currentX &&
            y <= currentY &&
            y + height >= currentY);
    }
    updateContainers() {
        return (0,external_tslib_namespaceObject.__awaiter)(this, void 0, void 0, function* () {
            setTimeout(() => {
                this.containers = [];
                if (this.containerSelectors) {
                    for (let selector of this.containerSelectors) {
                        const containerList = this.querySelectorAll(selector);
                        this.containers = [
                            ...this.containers,
                            ...Array.from(containerList),
                        ];
                    }
                    this.containers = this.containers.sort((ac, bc) => {
                        const { top: btop } = bc.getBoundingClientRect();
                        const { top: atop } = ac.getBoundingClientRect();
                        return atop - btop;
                    });
                }
                else {
                    this.containers = [this];
                }
            });
        });
    }
    updated(map) {
        if (map.has("containerSelectors")) {
            this.updateContainers();
        }
    }
    firstUpdated() {
        let started = false, ct, startX = 0, startY = 0, _overContainer = null;
        const overContainer = (el, container) => {
            this.dispatchEvent(new CustomEvent("onOverContainer", {
                detail: {
                    el,
                    container,
                },
            }));
        };
        const outContainer = (el, container) => {
            this.dispatchEvent(new CustomEvent("onOutContainer", {
                detail: {
                    el,
                    container,
                },
            }));
        };
        const onEnd = (gestureDetail) => {
            if (started) {
                started = false;
                clearTimeout(ct);
                this.dispatchEvent(new CustomEvent("onDrop", {
                    detail: Object.assign({ el: this.selectedItemEl, gestureDetail, complete: this.complete }, this._lastHoverData),
                }));
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
                    this.dataCacheMap = new Map();
                    for (let index = 0, len = this.containers.length; index < len; index++) {
                        const container = this.containers[index];
                        const map = new Map();
                        this.dataCacheMap.set(container, {
                            rect: container.getBoundingClientRect(),
                            itemDataMap: map,
                            index,
                        });
                        const childs = Array.from(container.children);
                        for (let i = 0, len = childs.length; i < len; i++) {
                            const child = childs[i];
                            map.set(child, { rect: child.getBoundingClientRect(), index: i });
                        }
                    }
                    const event = gestureDetail.event;
                    if (this.draggableFilter) {
                        this.selectedItemEl = event.path.find(this.draggableFilter);
                    }
                    else {
                        let childArr = Array.from(this.children);
                        const set = new Set(childArr);
                        this.selectedItemEl = event.path.find((dom) => set.has(dom));
                    }
                    if (this.selectedItemEl) {
                        started = true;
                        // TODO , use switch repeated when multi options.
                        if (this.draggableOrigin === "center") {
                            const rect = this.selectedItemEl.getBoundingClientRect();
                            startY = rect.top + rect.height / 2;
                            startX = rect.left + rect.width / 2;
                        }
                        else {
                            startY = gestureDetail.currentY;
                            startX = gestureDetail.currentX;
                        }
                        const container = this.selectedItemEl.parentElement;
                        this.dispatchEvent(new CustomEvent("onStart", {
                            detail: {
                                el: this.selectedItemEl,
                                gestureDetail,
                                container,
                                reorder: this,
                            },
                        }));
                        _overContainer = container;
                        overContainer(this.selectedItemEl, container);
                    }
                }, this.timeout);
                return true;
            },
            onMove: (gestureDetail) => {
                clearTimeout(ct);
                if (started) {
                    let hoverContainer;
                    let hoverEl;
                    let hoverIndex;
                    for (let [container, metadata] of this.dataCacheMap) {
                        const { x, y, width, height } = metadata.rect;
                        if (this[within](x, y, width, height, gestureDetail.currentX, gestureDetail.currentY)) {
                            hoverContainer = container;
                            if (hoverContainer !== _overContainer) {
                                overContainer(this.selectedItemEl, hoverContainer);
                                if (_overContainer) {
                                    outContainer(this.selectedItemEl, _overContainer);
                                }
                                _overContainer = hoverContainer;
                            }
                            const childs = Array.from(container.children);
                            for (let i = 0, len = childs.length; i < len; i++) {
                                const child = childs[i];
                                const data = metadata.itemDataMap.get(child);
                                if (data) {
                                    const { rect: { x, y, width, height }, } = data;
                                    if (this[within](x, y, width, height, gestureDetail.currentX, gestureDetail.currentY)) {
                                        hoverEl = child;
                                        if (hoverEl === this.selectedItemEl) {
                                            container;
                                        }
                                        const [hp, vp] = this.hoverPosition(x, y, width, height, startX + gestureDetail.deltaX, startY + gestureDetail.deltaY);
                                        if (this.direction === "y") {
                                            vp === "top" ? (hoverIndex = i) : (hoverIndex = i + 1);
                                        }
                                        else {
                                            hp === "left" ? (hoverIndex = i) : (hoverIndex = i + 1);
                                        }
                                        break;
                                    }
                                }
                            }
                            break;
                        }
                    }
                    this._lastHoverData = {
                        hoverEl,
                        hoverContainer,
                        hoverIndex,
                    };
                    this.dispatchEvent(new CustomEvent("onDrag", {
                        detail: {
                            el: this.selectedItemEl,
                            gestureDetail,
                            container: this.selectedItemEl.parentElement,
                            reorder: this,
                            hoverEl,
                            hoverContainer,
                            hoverIndex,
                        },
                    }));
                }
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
    createRenderRoot() {
        return this;
    }
}
(0,external_tslib_namespaceObject.__decorate)([
    (0,external_lit_element_namespaceObject.property)({ attribute: false })
], Reorder.prototype, "containers", void 0);
(0,external_tslib_namespaceObject.__decorate)([
    (0,external_lit_element_namespaceObject.property)({ attribute: false })
], Reorder.prototype, "containerSelectors", void 0);
(0,external_tslib_namespaceObject.__decorate)([
    (0,external_lit_element_namespaceObject.property)({ type: Number })
], Reorder.prototype, "timeout", void 0);
(0,external_tslib_namespaceObject.__decorate)([
    (0,external_lit_element_namespaceObject.property)({ attribute: false })
], Reorder.prototype, "draggableFilter", null);
(0,external_tslib_namespaceObject.__decorate)([
    (0,external_lit_element_namespaceObject.property)({ type: String })
], Reorder.prototype, "direction", void 0);
(0,external_tslib_namespaceObject.__decorate)([
    (0,external_lit_element_namespaceObject.property)({ type: String })
], Reorder.prototype, "draggableOrigin", void 0);
(0,external_tslib_namespaceObject.__decorate)([
    (0,external_lit_element_namespaceObject.property)({ attribute: false })
], Reorder.prototype, "hoverPosition", null);
window.customElements.define("viskit-reorder", Reorder);

var __webpack_exports__Reorder = __webpack_exports__.t;
export { __webpack_exports__Reorder as Reorder };
