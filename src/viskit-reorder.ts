import { html, LitElement, property } from "lit-element";
import { createGesture, Gesture, GestureDetail } from "@ionic/core";
type DataCacheMap = Map<
  HTMLElement,
  {
    rect: DOMRect;
    index: number;
    itemDataMap: Map<HTMLElement, { rect: DOMRect; index: number }>;
  }
>;

export type onStartEvent = CustomEvent<{
  el: HTMLElement;
  gestureDetail: GestureDetail;
  container: HTMLElement;
  reorder: Reorder;
}>;

export type onDragEvent = CustomEvent<{
  el: HTMLElement;
  gestureDetail: GestureDetail;
  container: HTMLElement;
  reorder: Reorder;
  hoverEl: HTMLElement;
  hoverContainer: HTMLElement;
  hoverIndex: number;
}>;

export type onDropEvent = CustomEvent<{
  el: HTMLElement;
  gestureDetail: GestureDetail;
  complete: (bool: boolean) => void;
  hoverEl: HTMLElement;
  hoverContainer: HTMLElement;
  hoverIndex: number;
}>;

const within = Symbol.for("within");

export class Reorder extends LitElement {
  dataCacheMap: DataCacheMap = null;

  constructor() {
    super();
    this.complete = this.complete.bind(this);
    this.draggableFilter = this.draggableFilter.bind(this);
  }

  gesture: Gesture;

  private selectedItemEl: HTMLElement;

  @property({ attribute: false })
  containers: HTMLElement[] = [this];

  @property({ attribute: false })
  containerSelectors: string | string[] = "";

  @property({ type: Number })
  timeout = 500;

  @property({ attribute: false })
  draggableFilter(el: HTMLElement) {
    for (let container of this.containers) {
      if (Array.from(container.children).find((dom) => dom === el)) {
        return true;
      }
    }
    return false;
  }

  @property({ type: String })
  direction: "x" | "y" = "y";

  @property({ type: String })
  draggableOrigin: "center" | "pointer" = "center";

  @property({ attribute: false })
  hoverPosition(
    x: number,
    y: number,
    width: number,
    height: number,
    currentX: number,
    currentY: number
  ): ["left" | "right", "top" | "bottom"] {
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
          hoverEl.insertAdjacentElement(
            hoverContainer.children.item(hoverIndex) === hoverEl
              ? "beforebegin"
              : "afterend",
            selectedItemEl
          );
        }
      }

      this.selectedItemEl = undefined;
    }
  }

  [within](x, y, width, height, currentX, currentY) {
    return (
      x <= currentX &&
      x + width >= currentX &&
      y <= currentY &&
      y + height >= currentY
    );
  }

  async updateContainers() {
    setTimeout(() => {
      this.containers = [];
      if (this.containerSelectors) {
        for (let selector of this.containerSelectors) {
          const containerList = this.querySelectorAll(selector);
          this.containers = [
            ...this.containers,
            ...Array.from<HTMLElement>(
              containerList as NodeListOf<HTMLElement>
            ),
          ];
        }
        this.containers = this.containers.sort((ac, bc) => {
          const { top: btop } = bc.getBoundingClientRect();
          const { top: atop } = ac.getBoundingClientRect();
          return atop - btop;
        });
      } else {
        this.containers = [this];
      }

      
    });
  }

  updated(map: Map<string, any>) {
    if (map.has("containerSelectors")) {
      this.updateContainers();
    }
  }

  private _lastHoverData: {
    hoverEl: HTMLElement;
    hoverContainer: HTMLElement;
    hoverIndex: number;
  };

  firstUpdated() {
    let started = false,
      ct,
      startX = 0,
      startY = 0,
      _overContainer: HTMLElement = null;

    const overContainer = (el: HTMLElement, container: HTMLElement) => {
      this.dispatchEvent(
        new CustomEvent("onOverContainer", {
          detail: {
            el,
            container,
          },
        })
      );
    };

    const outContainer = (el: HTMLElement, container: HTMLElement) => {
      this.dispatchEvent(
        new CustomEvent("onOutContainer", {
          detail: {
            el,
            container,
          },
        })
      );
    };

    const onEnd = (gestureDetail) => {
      if (started) {
        started = false;
        clearTimeout(ct);
        this.dispatchEvent(
          new CustomEvent("onDrop", {
            detail: {
              el: this.selectedItemEl,
              gestureDetail,
              complete: this.complete,
              ...this._lastHoverData,
            },
          })
        );
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

          for (
            let index = 0, len = this.containers.length;
            index < len;
            index++
          ) {
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

          const event = gestureDetail.event as any;

          if (this.draggableFilter) {
            this.selectedItemEl = event.path.find(this.draggableFilter);
          } else {
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
            } else {
              startY = gestureDetail.currentY;
              startX = gestureDetail.currentX;
            }

            const container = this.selectedItemEl.parentElement;

            this.dispatchEvent(
              new CustomEvent("onStart", {
                detail: {
                  el: this.selectedItemEl,
                  gestureDetail,
                  container,
                  reorder: this,
                },
              })
            );
            _overContainer = container;
            overContainer(this.selectedItemEl, container);
          }
        }, this.timeout);

        return true;
      },

      onMove: (gestureDetail) => {
        clearTimeout(ct);
        if (started) {
          let hoverContainer: HTMLElement;
          let hoverEl: HTMLElement;
          let hoverIndex: number;

          for (let [container, metadata] of this.dataCacheMap) {
            const { x, y, width, height } = metadata.rect;
            if (
              this[within](
                x,
                y,
                width,
                height,
                gestureDetail.currentX,
                gestureDetail.currentY
              )
            ) {

              hoverContainer = container;

              if(hoverContainer !== _overContainer){
                overContainer(this.selectedItemEl,hoverContainer);
                if(_overContainer){
                  outContainer(this.selectedItemEl,_overContainer);
                }
                _overContainer = hoverContainer;
              }

              const childs = Array.from(container.children);
              for (let i = 0, len = childs.length; i < len; i++) {
                const child = childs[i];
                const data = metadata.itemDataMap.get(child as HTMLElement);
                if (data) {
                  const {
                    rect: { x, y, width, height },
                  } = data;
                  if (
                    this[within](
                      x,
                      y,
                      width,
                      height,
                      gestureDetail.currentX,
                      gestureDetail.currentY
                    )
                  ) {
   
                    hoverEl = child as HTMLElement;
                    if (hoverEl === this.selectedItemEl) {
                      container;
                    }
                    const [hp, vp] = this.hoverPosition(
                      x,
                      y,
                      width,
                      height,
                      startX + gestureDetail.deltaX,
                      startY + gestureDetail.deltaY
                    );

                    if (this.direction === "y") {
                      vp === "top" ? (hoverIndex = i) : (hoverIndex = i + 1);
                    } else {
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

          this.dispatchEvent(
            new CustomEvent("onDrag", {
              detail: {
                el: this.selectedItemEl,
                gestureDetail,
                container: this.selectedItemEl.parentElement, // TODO
                reorder: this,
                hoverEl,
                hoverContainer,
                hoverIndex,
              },
            })
          );
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

window.customElements.define("viskit-reorder", Reorder);

declare global {
  interface HTMLElementTagNameMap {
    "viskit-reorder": Reorder;
  }
}
