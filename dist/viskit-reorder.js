import { __awaiter, __decorate } from "tslib";
import { LitElement, property } from "lit-element";
import { createGesture } from "@ionic/core";
const within = Symbol.for("within");
export class Reorder extends LitElement {
    constructor() {
        super();
        this.dataCacheMap = null;
        this.containers = [this];
        this.containerSelectors = "";
        this.timeout = 500;
        this.direction = "y";
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
                hoverEl.insertAdjacentElement(hoverContainer.children.item(hoverIndex) === hoverEl
                    ? "beforebegin"
                    : "afterend", selectedItemEl);
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
        return __awaiter(this, void 0, void 0, function* () {
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
        let started = false, ct;
        const onEnd = (gestureDetail) => {
            if (started) {
                started = false;
                clearTimeout(ct);
                this.dispatchEvent(new CustomEvent("onDrop", {
                    detail: Object.assign({ el: this.selectedItemEl, gestureDetail, complete: this.complete }, this._lastHoverData),
                }));
            }
        };
        this.gesture = createGesture({
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
                            index
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
                        this.dispatchEvent(new CustomEvent("onStart", {
                            detail: {
                                el: this.selectedItemEl,
                                gestureDetail,
                                container: this.selectedItemEl.parentElement,
                                reorder: this,
                            },
                        }));
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
                                        const [hp, vp] = this.hoverPosition(x, y, width, height, gestureDetail.currentX, gestureDetail.currentY);
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
__decorate([
    property({ attribute: false })
], Reorder.prototype, "containers", void 0);
__decorate([
    property({ attribute: false })
], Reorder.prototype, "containerSelectors", void 0);
__decorate([
    property({ type: Number })
], Reorder.prototype, "timeout", void 0);
__decorate([
    property({ attribute: false })
], Reorder.prototype, "draggableFilter", null);
__decorate([
    property({ type: String })
], Reorder.prototype, "direction", void 0);
__decorate([
    property({ attribute: false })
], Reorder.prototype, "hoverPosition", null);
window.customElements.define("viskit-reorder", Reorder);
//# sourceMappingURL=viskit-reorder.js.map