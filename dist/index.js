var $1ZQrD$lit = require("lit");
var $1ZQrD$litdecoratorsjs = require("lit/decorators.js");
var $1ZQrD$ioniccore = require("@ionic/core");
var $1ZQrD$lodash = require("lodash");

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "StartEvent", () => $b03e17997ed23475$export$cc4ebe9deb7007ee, (v) => $b03e17997ed23475$export$cc4ebe9deb7007ee = v);
$parcel$export(module.exports, "DragEvent", () => $b03e17997ed23475$export$7c822568a4fa8542, (v) => $b03e17997ed23475$export$7c822568a4fa8542 = v);
$parcel$export(module.exports, "EndEvent", () => $b03e17997ed23475$export$2066b1507471daea, (v) => $b03e17997ed23475$export$2066b1507471daea = v);
$parcel$export(module.exports, "ReorderEvent", () => $b03e17997ed23475$export$13331832f7da8736, (v) => $b03e17997ed23475$export$13331832f7da8736 = v);
$parcel$export(module.exports, "DropEvent", () => $b03e17997ed23475$export$d72ac1b5c807f918, (v) => $b03e17997ed23475$export$d72ac1b5c807f918 = v);
$parcel$export(module.exports, "Reorder", () => $b03e17997ed23475$export$335fca4219867448, (v) => $b03e17997ed23475$export$335fca4219867448 = v);




var $b03e17997ed23475$var$__decorate = undefined && undefined.__decorate || function(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class $b03e17997ed23475$export$cc4ebe9deb7007ee extends Event {
    constructor(detail, draggable, container, type = "viskit-start"){
        super(type);
        this.draggable = draggable;
        this.container = container;
        for(let k in detail)if (k !== "type") this[k] = detail[k];
        if (!detail.data) detail.data = {
        };
    }
}
class $b03e17997ed23475$export$7c822568a4fa8542 extends $b03e17997ed23475$export$cc4ebe9deb7007ee {
    constructor(detail, draggable, container){
        super(detail, draggable, container, "viskit-drag");
        this.draggable = draggable;
        this.container = container;
    }
}
class $b03e17997ed23475$export$2066b1507471daea extends $b03e17997ed23475$export$cc4ebe9deb7007ee {
    constructor(detail, draggable, container){
        super(detail, draggable, container, "viskit-end");
        this.draggable = draggable;
        this.container = container;
    }
}
class $b03e17997ed23475$export$13331832f7da8736 extends $b03e17997ed23475$export$cc4ebe9deb7007ee {
    constructor({ draggable: draggable , container: container , gestureDetail: gestureDetail , hoverContainer: hoverContainer , hoverIndex: hoverIndex , hoverable: hoverable , hoverableRect: hoverableRect , draggableRect: draggableRect , draggableIndex: draggableIndex , x: x , y: y ,  }, type = "viskit-reorder"){
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
class $b03e17997ed23475$export$d72ac1b5c807f918 extends Event {
    constructor(complete, data = {
    }){
        super("viskit-drop");
        this.complete = complete;
        this.data = data;
    }
}
let $b03e17997ed23475$export$335fca4219867448 = class $b03e17997ed23475$export$335fca4219867448 extends $1ZQrD$lit.LitElement {
    constructor(){
        super(...arguments);
        this.draggableOrigin = "center-center";
        this.dataCacheMap = null;
        this.containers = [
            this
        ];
        this.reorder = $1ZQrD$lodash.debounce((gestureDetail)=>{
            let { currentX: currentX , currentY: currentY , data: { triggerOffsetX: triggerOffsetX , triggerOffsetY: triggerOffsetY , draggable: draggable  } ,  } = gestureDetail;
            const triggerX = currentX + triggerOffsetX + this.offsetX;
            const triggerY = currentY + triggerOffsetY + this.offsetY;
            for (let hoverContainer of this.containers){
                const { x: x , y: y , width: width , height: height  } = this.dataCacheMap.get(hoverContainer).rect;
                if (this.within(x, y, width, height, triggerX, triggerY)) {
                    const childs = Array.from(hoverContainer.children);
                    for(let i = 0, len = childs.length; i < len; i++){
                        const child = childs[i];
                        const data = this.dataCacheMap.get(child);
                        if (data) {
                            const { rect: { x: x , y: y , width: width , height: height  } , index: index ,  } = data;
                            if (this.within(x, y, width, height, triggerX, triggerY)) {
                                const hoverable = child;
                                const hoverIndex = index;
                                gestureDetail.data = Object.assign(Object.assign({
                                }, gestureDetail.data), {
                                    hoverable: hoverable,
                                    hoverContainer: hoverContainer,
                                    hoverIndex: hoverIndex,
                                    draggable: gestureDetail.data.draggable,
                                    container: gestureDetail.data.container,
                                    hoverableRect: this.dataCacheMap.get(hoverable).rect,
                                    x: triggerX,
                                    y: triggerY
                                });
                                break;
                            }
                        }
                    }
                    if (gestureDetail.data.hoverable) {
                        const { index: draggableIndex , rect: draggableRect  } = this.dataCacheMap.get(gestureDetail.data.draggable);
                        this.dispatchEvent(new $b03e17997ed23475$export$13331832f7da8736({
                            gestureDetail: gestureDetail,
                            hoverable: gestureDetail.data.hoverable,
                            hoverContainer: hoverContainer,
                            hoverableRect: gestureDetail.data.hoverable ? this.dataCacheMap.get(gestureDetail.data.hoverable).rect : null,
                            hoverIndex: gestureDetail.data.hoverIndex,
                            draggableIndex: draggableIndex,
                            draggable: gestureDetail.data.draggable,
                            container: gestureDetail.data.container,
                            draggableRect: draggableRect,
                            x: triggerX,
                            y: triggerY
                        }));
                    }
                    break;
                }
            }
        });
        this.direction = "y";
        this.enable = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.mutation = $1ZQrD$lodash.debounce((offset)=>{
            if (offset) {
                if (offset.x !== this.offsetX || offset.y !== this.offsetY) {
                    this.offsetX = offset.x;
                    this.offsetY = offset.y;
                } else return;
            } else this.calcCacheData();
            if (this.gestureDetail) this.reorder(this.gestureDetail);
        }, 50);
    }
    hoverPosition(x, y, width, height, currentX, currentY) {
        return [
            currentX <= x + width / 2 ? "left" : "right",
            currentY <= y + height / 2 ? "top" : "bottom", 
        ];
    }
    within(x, y, width, height, currentX, currentY) {
        return x <= currentX && x + width >= currentX && y <= currentY && y + height >= currentY;
    }
    calcCacheData() {
        this.dataCacheMap = new Map();
        for(let index = 0, len = this.containers.length; index < len; index++){
            const container = this.containers[index];
            const map = new Map();
            this.dataCacheMap.set(container, {
                rect: container.getBoundingClientRect()
            });
            const childs = Array.from(container.children);
            for(let i = 0, len = childs.length; i < len; i++){
                const child = childs[i];
                this.dataCacheMap.set(child, {
                    rect: child.getBoundingClientRect(),
                    index: i
                });
            }
        }
    }
    firstUpdated() {
        let started = false;
        const onEnd = (gestureDetail)=>{
            this.offsetX = 0;
            this.offsetY = 0;
            if (started) {
                started = false;
                this.gestureDetail = null;
                gestureDetail.data || (gestureDetail.data = {
                });
                this.dispatchEvent(new $b03e17997ed23475$export$d72ac1b5c807f918((after = true)=>{
                    const selectedItemEl = gestureDetail.data.draggable;
                    if (selectedItemEl) {
                        const { hoverContainer: hoverContainer , hoverable: hoverable , hoverIndex: hoverIndex  } = gestureDetail.data;
                        if (hoverContainer.children.length) hoverable.insertAdjacentElement(after ? "afterend" : "beforebegin", selectedItemEl);
                        else hoverContainer.appendChild(selectedItemEl);
                        this.mutation();
                    }
                }, gestureDetail.data));
                this.dispatchEvent(new $b03e17997ed23475$export$2066b1507471daea(gestureDetail, gestureDetail.data.draggable, gestureDetail.data.container));
            }
        };
        this.gesture = $1ZQrD$ioniccore.createGesture({
            el: this,
            direction: "y",
            gestureName: "pzl-reorder-list",
            disableScroll: true,
            canStart: (gestureDetail)=>{
                gestureDetail.data = {
                };
                const { data: data , event: event  } = gestureDetail;
                const els = event.composedPath();
                const draggable = els.find((el)=>this.containers.includes(el.parentElement)
                );
                if (draggable) {
                    data.draggable = draggable;
                    data.container = draggable.parentElement;
                } else return false;
                if (this.canStart) return this.canStart(gestureDetail);
                return true;
            },
            onWillStart: this.onWillStart,
            onStart: (gestureDetail)=>{
                started = false;
                if (this.enable) {
                    this.calcCacheData();
                    const draggable = gestureDetail.data.draggable;
                    const container = gestureDetail.data.container;
                    const draggableRect = this.dataCacheMap.get(draggable).rect;
                    if (draggable) {
                        gestureDetail.data = Object.assign(Object.assign({
                        }, gestureDetail.data), {
                            draggable: draggable,
                            container: container
                        });
                        // calc drggable trigger point by origin
                        let triggerOffsetX = 0;
                        let triggerOffsetY = 0;
                        if (this.draggableOrigin !== "current") {
                            const { startX: startX , startY: startY  } = gestureDetail;
                            const { left: left , top: top , width: width , height: height  } = draggableRect;
                            switch(this.draggableOrigin){
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
                            gestureDetail.data.triggerOffsetX = triggerOffsetX;
                            gestureDetail.data.triggerOffsetY = triggerOffsetY;
                            this.dispatchEvent(new $b03e17997ed23475$export$cc4ebe9deb7007ee(gestureDetail, draggable, container));
                        }
                        started = true;
                    }
                } else onEnd(gestureDetail);
            },
            onMove: (gestureDetail)=>{
                if (started) {
                    this.dispatchEvent(new $b03e17997ed23475$export$7c822568a4fa8542(gestureDetail, gestureDetail.data.draggable, gestureDetail.data.container));
                    this.gestureDetail = gestureDetail;
                    this.reorder(gestureDetail);
                }
            },
            onEnd: onEnd,
            notCaptured: (ev)=>{
                return onEnd(ev);
            }
        });
        this.gesture.enable(true);
    }
    createRenderRoot() {
        return this;
    }
};
$b03e17997ed23475$export$335fca4219867448.styles = $1ZQrD$lit.css`
    :host {
      display: block;
    }
  `;
$b03e17997ed23475$var$__decorate([
    $1ZQrD$litdecoratorsjs.property({
        type: String
    })
], $b03e17997ed23475$export$335fca4219867448.prototype, "draggableOrigin", void 0);
$b03e17997ed23475$var$__decorate([
    $1ZQrD$litdecoratorsjs.property({
        type: String
    })
], $b03e17997ed23475$export$335fca4219867448.prototype, "direction", void 0);
$b03e17997ed23475$var$__decorate([
    $1ZQrD$litdecoratorsjs.property({
        attribute: false
    })
], $b03e17997ed23475$export$335fca4219867448.prototype, "hoverPosition", null);
$b03e17997ed23475$export$335fca4219867448 = $b03e17997ed23475$var$__decorate([
    $1ZQrD$litdecoratorsjs.customElement("viskit-reorder")
], $b03e17997ed23475$export$335fca4219867448);


//# sourceMappingURL=index.js.map
