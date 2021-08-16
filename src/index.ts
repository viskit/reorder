import { html, LitElement, property } from "lit-element";
import { createGesture, Gesture, GestureDetail } from "@ionic/core";
import { debounce } from "lodash";

export type DraggableOrigin =
  "current"
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center-center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

type DataCacheMap = Map<
  HTMLElement,
  {
    rect: DOMRect;
    index?: number;
  }
>;

type StartEventDetail = GestureDetail & {
  draggable: HTMLElement;
  container: HTMLElement;
};

type DragEventDetail = StartEventDetail;

type ReorderEventDetail = StartEventDetail & {
  hoverable: HTMLElement;
  hoverIndex: number;
  hoverContainer: HTMLElement;

  draggableIndex: number;
  hoverableRect: DOMRect;
  draggableRect: DOMRect;

  // under draggable origin point
  x: number;
  y: number;
};

type DropEventDetail = ReorderEventDetail & {
  complete: (bool?: boolean, after?: boolean) => void;
};

export type onStartEvent = CustomEvent<StartEventDetail>;

export type onDragEvent = CustomEvent<StartEventDetail>;

export type onReorderEvent = CustomEvent<ReorderEventDetail>;

export type onDropEvent = CustomEvent<DropEventDetail>;

export class Reorder extends LitElement {
  public canStart(
    args: GestureDetail & { draggable: HTMLElement; container: HTMLElement }
  ) {
    return true;
  }

  @property({ type: String })
  draggableOrigin: DraggableOrigin = "center-center";

  dataCacheMap: DataCacheMap = null;

  gesture: Gesture;

  private gestureDetail: GestureDetail;

  containers: HTMLElement[] = [this];

  @property({ attribute: false })
  containerSelectors: string | string[] = "";

  @property({ type: Number })
  timeout = 500;

  private reorder = debounce((gestureDetail: GestureDetail) => {
    let {
      currentX,
      currentY,
      data: { triggerOffsetX, triggerOffsetY, draggable },
    } = gestureDetail;

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
          const data = this.dataCacheMap.get(child as HTMLElement);
          if (data) {
            const {
              rect: { x, y, width, height },
              index,
            } = data;
            if (this.within(x, y, width, height, triggerX, triggerY)) {

              const hoverable = child as HTMLElement;
              const hoverIndex = index;
              const { index: draggableIndex, rect: draggableRect } = this.dataCacheMap.get(gestureDetail.data.draggable as HTMLElement);
              gestureDetail.data = {
                ...gestureDetail.data,
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
              }
              this.dispatchEvent(
                new CustomEvent<ReorderEventDetail>("onReorder", {
                  detail: {
                    ...gestureDetail,
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
                  },
                })
              );

              break;
            }
          }
        }
        break;
      }
    }
  });

  @property({ type: String })
  direction: "x" | "y" = "y";

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

  private within(x, y, width, height, currentX, currentY) {
    return (
      x <= currentX &&
      x + width >= currentX &&
      y <= currentY &&
      y + height >= currentY
    );
  }

  private updateContainers() {
    this.containers = [];
    if (this.containerSelectors) {
      for (let selector of this.containerSelectors) {
        const containerList = this.querySelectorAll(selector);
        this.containers = [
          ...this.containers,
          ...Array.from<HTMLElement>(containerList as NodeListOf<HTMLElement>),
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
  }

  updated(map: Map<string, any>) {
    if (map.has("containerSelectors")) {
      this.updateContainers();
    }
  }

  private calcCacheData() {
    this.dataCacheMap = new Map();

    for (let index = 0, len = this.containers.length; index < len; index++) {
      const container = this.containers[index];
      const map = new Map();
      this.dataCacheMap.set(container, {
        rect: container.getBoundingClientRect(),
      });
      const childs = Array.from(container.children);
      for (let i = 0, len = childs.length; i < len; i++) {
        const child = childs[i] as HTMLElement;
        this.dataCacheMap.set(child, { rect: child.getBoundingClientRect(), index: i });
      }
    }
  }

  private _lastHoverData: {
    hoverEl: HTMLElement;
    hoverContainer: HTMLElement;
    hoverIndex: number;
  };

  private offsetX = 0;
  private offsetY = 0;

  public mutation = debounce((offset?: { x: number; y: number }) => {
    this.updateContainers();
    if (offset) {
      this.offsetX = offset.x;
      this.offsetY = offset.y;
    } else {
      this.calcCacheData();
    }
    if (this.gestureDetail) {
      this.reorder(this.gestureDetail);
    }
  }, 50);

  firstUpdated() {
    let started = false,
      ct;

    const onEnd = (gestureDetail: GestureDetail) => {
      if (started) {
        started = false;
        this.gestureDetail = null;
        clearTimeout(ct);

        
        this.dispatchEvent(
          new CustomEvent<DropEventDetail>("onDrop", {
            detail: {
              ...gestureDetail,
              complete: (bool = false, after = true) => {
                const selectedItemEl = gestureDetail.data
                  .draggable as HTMLElement;

                if (selectedItemEl) {
                  if (bool) {
                    const { hoverContainer, hoverable, hoverIndex } =
                      gestureDetail.data;
                    if (hoverable) {
                      hoverable.insertAdjacentElement(
                        after ? "afterend"
                          : "beforebegin",
                        selectedItemEl
                      );
                    }
                  }
                }
              },
            } as any,
          })
        );
      }
    };
    this.gesture = createGesture({
      el: this,
      direction: "y",
      gestureName: "pzl-reorder-list",
      disableScroll: false,
      canStart: (gestureDetail: GestureDetail) => {
        ct = setTimeout(() => {
          // generate DataCacheMap by containers

          this.calcCacheData();

          let draggable: HTMLElement, container: HTMLElement;
          let draggableRect: DOMRect;

          for (let _container of this.containers) {
            const { rect } = this.dataCacheMap.get(_container);
            if (
              this.within(
                rect.x,
                rect.y,
                rect.width,
                rect.height,
                gestureDetail.currentX,
                gestureDetail.currentY
              )
            ) {
              container = _container;
              const children = Array.from(container.children) as HTMLElement[];
              for (let child of children) {
                if (this.dataCacheMap.has(child)) {
                  const { rect, index } = this.dataCacheMap.get(child);
                  if (
                    this.within(
                      rect.x,
                      rect.y,
                      rect.width,
                      rect.height,
                      gestureDetail.currentX,
                      gestureDetail.currentY
                    )
                  ) {
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

            if (
              this.canStart({
                ...gestureDetail,
                draggable,
                container,
              })
            ) {
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

              this.dispatchEvent(
                new CustomEvent<StartEventDetail>("onStart", {
                  detail: {
                    ...gestureDetail,
                    draggable,
                    container,
                  },
                })
              );
            }
          }
        }, this.timeout);

        return true;
      },

      onMove: (gestureDetail) => {
        clearTimeout(ct);
        if (started) {
          this.dispatchEvent(
            new CustomEvent<DragEventDetail>("onDrag", {
              detail: {
                ...gestureDetail,
                draggable: gestureDetail.data.draggable,
                container: gestureDetail.data.container,
              },
            })
          );
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
