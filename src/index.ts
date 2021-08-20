import { LitElement } from "lit";
import { state, property } from "lit/decorators.js";
import { createGesture, Gesture, GestureDetail } from "@ionic/core";
import { debounce } from "lodash";

export type DraggableOrigin =
  | "current"
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

export class StartEvent extends Event implements GestureDetail {
  constructor(
    detail: GestureDetail,
    public draggable: HTMLElement,
    public container: HTMLElement,
    type = "viskit-start"
  ) {
    super(type);
    for (let k in detail) {
      if (k !== "type") {
        this[k] = detail[k];
      }
    }
    if (!detail.data) detail.data = {};
  }

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

export class DragEvent extends StartEvent {
  constructor(
    detail: GestureDetail,
    public draggable: HTMLElement,
    public container: HTMLElement
  ) {
    super(detail, draggable, container, "viskit-drag");
  }
}

export type ReorderEventArgs = {
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

export class ReorderEvent extends StartEvent {
  constructor(
    {
      draggable,
      container,
      gestureDetail,
      hoverContainer,
      hoverIndex,
      hoverable,
      hoverableRect,
      draggableRect,
      draggableIndex,
      x,
      y,
    }: ReorderEventArgs,
    type = "viskit-reorder"
  ) {
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
  hoverable: HTMLElement;
  hoverIndex: number;
  hoverContainer: HTMLElement;

  draggableIndex: number;
  hoverableRect: DOMRect;
  draggableRect: DOMRect;

  x: number;
  y: number;
}

export class DropEvent extends Event {
  constructor(
    public complete: (after?: boolean) => void,
    public data: any = {}
  ) {
    super("viskit-drop");
  }
}

export class Reorder extends LitElement {
  @property({ attribute: false })
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
      const { x, y, width, height } =
        this.dataCacheMap.get(hoverContainer).rect;
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
              const { index: draggableIndex, rect: draggableRect } =
                this.dataCacheMap.get(
                  gestureDetail.data.draggable as HTMLElement
                );
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
              };
              this.dispatchEvent(
                new ReorderEvent({
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
        this.dataCacheMap.set(child, {
          rect: child.getBoundingClientRect(),
          index: i,
        });
      }
    }
  }

  private offsetX = 0;
  private offsetY = 0;

  public mutation = debounce((offset?: { x: number; y: number }) => {
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
    let started = false;

    const onEnd = (gestureDetail: GestureDetail) => {
      if (started) {
        this.dispatchEvent(
          new DropEvent((after = true) => {
            const selectedItemEl = gestureDetail.data.draggable as HTMLElement;

            if (selectedItemEl) {
              const { hoverContainer, hoverable, hoverIndex } =
                gestureDetail.data;
              if (hoverable) {
                hoverable.insertAdjacentElement(
                  after ? "afterend" : "beforebegin",
                  selectedItemEl
                );
                this.mutation();
              }
            }
          }, gestureDetail.data)
        );
      }
    };

    this.gesture = createGesture({
      el: this,
      direction: "y",
      gestureName: "pzl-reorder-list",
      disableScroll: false,
      canStart: this.canStart,
      onStart: (gestureDetail: GestureDetail) => {
        started = false;
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

            gestureDetail.data.triggerOffsetX = triggerOffsetX;
            gestureDetail.data.triggerOffsetY = triggerOffsetY;

            this.dispatchEvent(
              new StartEvent(gestureDetail, draggable, container)
            );

            started = true;
          }
        }
      },

      onMove: (gestureDetail) => {
        if (started) {
          this.dispatchEvent(
            new DragEvent(
              gestureDetail,
              gestureDetail.data.draggable,
              gestureDetail.data.container
            )
          );
          this.reorder(gestureDetail);
        }
      },
      onEnd: onEnd,
      notCaptured: (ev) => {
        return onEnd(ev);
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
