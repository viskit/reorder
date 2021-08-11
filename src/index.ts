import { html, LitElement, property } from "lit-element";
import { createGesture, Gesture, GestureDetail } from "@ionic/core";
import { debounce } from "lodash";

type DataCacheMap = Map<
  HTMLElement,
  {
    rect: DOMRect;
    index: number;
    itemDataMap: Map<HTMLElement, { rect: DOMRect; index: number }>;
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
};

type DropEventDetail = ReorderEventDetail & {
  complete: (bool: boolean) => void;
};

export type onStartEvent = CustomEvent<StartEventDetail>;

export type onDragEvent = CustomEvent<StartEventDetail>;

export type onReorderEvent = CustomEvent<ReorderEventDetail>;

export type onDropEvent = CustomEvent<DropEventDetail>;

const within = Symbol.for("within"); // TODO

export class Reorder extends LitElement {
  public canStart(
    args: GestureDetail & { draggable: HTMLElement; container: HTMLElement }
  ) {
    return true;
  }

  dataCacheMap: DataCacheMap = null;

  constructor() {
    super();
    this.draggableFilter = this.draggableFilter.bind(this);
  }

  gesture: Gesture;

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

  private reorder = debounce((gestureDetail: GestureDetail) => {
    const els = gestureDetail.event.composedPath();
    const containerIndex = els.findIndex((el) =>
      this.containers.includes(el as HTMLElement)
    );

    if (containerIndex !== -1) {
      const hoverContainer = els[containerIndex] as HTMLElement;
      const children = Array.from(hoverContainer.children);
      const hoverIndex = children.findIndex((el) => els.includes(el));

      if (hoverIndex !== -1) {
        const hoverable = children[hoverIndex] as HTMLElement;
        const prevHoverData = gestureDetail.data;
        if (
          prevHoverData.hoverable !== hoverable ||
          prevHoverData.hoverContainer !== hoverContainer ||
          prevHoverData.hoverIndex !== hoverIndex
        ) {
          gestureDetail.data.hoverable = hoverable;
          gestureDetail.data.hoverIndex = hoverIndex;
          gestureDetail.data.hoverContainer = hoverContainer;

          this.dispatchEvent(
            new CustomEvent<ReorderEventDetail>("onReorder", {
              detail: {
                ...gestureDetail,
                hoverable,
                hoverContainer,
                hoverIndex,
                draggable: gestureDetail.data.draggable,
                container: gestureDetail.data.container,
              },
            })
          );
        }
      }
    }
  }, 300);

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

  [within](x, y, width, height, currentX, currentY) {
    return (
      x <= currentX &&
      x + width >= currentX &&
      y <= currentY &&
      y + height >= currentY
    );
  }

  updateContainers() {
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

  calcCacheData() {
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
  }

  private _lastHoverData: {
    hoverEl: HTMLElement;
    hoverContainer: HTMLElement;
    hoverIndex: number;
  };

  public mutation() {
    this.updateContainers();
    this.calcCacheData();
  }

  firstUpdated() {
    let started = false,
      ct,
      startX = 0,
      startY = 0;

    const onEnd = (gestureDetail) => {
      if (started) {
        started = false;
        clearTimeout(ct);
        this.dispatchEvent(
          new CustomEvent<DropEventDetail>("onDrop", {
            detail: {
              ...gestureDetail,
              complete: (bool = false) => {
                const selectedItemEl = gestureDetail.data
                  .draggable as HTMLElement;

                if (selectedItemEl) {
                  if (bool) {
                    const { hoverContainer, hoverEl, hoverIndex } =
                      this._lastHoverData;
                    if (hoverEl) {
                      hoverEl.insertAdjacentElement(
                        hoverContainer.children.item(hoverIndex) === hoverEl
                          ? "beforebegin"
                          : "afterend",
                        selectedItemEl
                      );
                    }
                  }
                }
              },
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
      canStart: (gestureDetail: GestureDetail) => {
        ct = setTimeout(() => {
          // generate DataCacheMap by containers

          this.calcCacheData();

          const event = gestureDetail.event as any;
          const path =
            event.path || (event.composedPath && event.composedPath());
          const draggable = path.find(this.draggableFilter) as HTMLElement;

          if (draggable) {
            const container = draggable.parentElement;

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
