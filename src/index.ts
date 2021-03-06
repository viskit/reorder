import { LitElement, css } from "lit";
import { property, customElement } from "lit/decorators.js";
import { createGesture, Gesture, GestureDetail } from "@ionic/core";
import { debounce } from "lodash";

type Rect = { x: number; y: number; width: number; height: number };

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
    rect: Rect;
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
  hoverableRect: Rect;
  draggableRect: Rect;

  x: number;
  y: number;
};

export class EndEvent extends StartEvent {
  constructor(
    detail: GestureDetail,
    public draggable: HTMLElement,
    public container: HTMLElement
  ) {
    super(detail, draggable, container, "viskit-end");
  }
}

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
  hoverableRect: Rect;
  draggableRect: Rect;

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

@customElement("viskit-reorder")
export class Reorder extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: String })
  draggableOrigin: DraggableOrigin = "center-center";

  rootContainer: HTMLElement = this;

  dataCacheMap: DataCacheMap = null;

  gesture: Gesture;

  private gestureDetail: GestureDetail;

  @property({ attribute: false })
  containers: HTMLElement[] = [this];

  i = 0;

  private reorder = debounce((gestureDetail: GestureDetail) => {
    let {
      currentX,
      currentY,
      data: { triggerOffsetX, triggerOffsetY, draggable },
    } = gestureDetail;

    const rootRect = this.rootContainer.getBoundingClientRect();

    const triggerX = currentX - rootRect.x + triggerOffsetX + this.offsetX;
    const triggerY = currentY - rootRect.y + triggerOffsetY + this.offsetY;

    for (let hoverContainer of this.containers) {
      const data = this.dataCacheMap.get(hoverContainer);
      if (data) {
        const { x, y, width, height } = data.rect;

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
                gestureDetail.data = {
                  ...gestureDetail.data,
                  hoverable,
                  hoverContainer,
                  hoverIndex,
                  draggable: gestureDetail.data.draggable,
                  container: gestureDetail.data.container,
                  hoverableRect: this.dataCacheMap.get(hoverable).rect,
                  x: triggerX,
                  y: triggerY,
                };

                break;
              }
            }
          }
          if (gestureDetail.data.hoverable) {
            const { index: draggableIndex, rect: draggableRect } =
              this.dataCacheMap.get(
                gestureDetail.data.draggable as HTMLElement
              );
            this.dispatchEvent(
              new ReorderEvent({
                gestureDetail,
                hoverable: gestureDetail.data.hoverable,
                hoverContainer,
                hoverableRect: gestureDetail.data.hoverable
                  ? this.dataCacheMap.get(gestureDetail.data.hoverable).rect
                  : null,
                hoverIndex: gestureDetail.data.hoverIndex,

                draggableIndex,
                draggable: gestureDetail.data.draggable,
                container: gestureDetail.data.container,
                draggableRect,
                x: triggerX,
                y: triggerY,
              })
            );
          }

          break;
        }
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

  enable = false;

  canStart: (_: GestureDetail) => boolean;

  onWillStart: (_: GestureDetail) => Promise<void>;

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
    const rootRect = this.rootContainer.getBoundingClientRect();

    for (let index = 0, len = this.containers.length; index < len; index++) {
      const container = this.containers[index];
      const map = new Map();
      const containerRect = container.getBoundingClientRect();
      this.dataCacheMap.set(container, {
        rect: {
          width: containerRect.width,
          height: containerRect.height,
          x: containerRect.x - rootRect.x,
          y: containerRect.y - rootRect.y,
        },
      });
      const childs = Array.from(container.children);
      for (let i = 0, len = childs.length; i < len; i++) {
        const child = childs[i] as HTMLElement;
        const rect = child.getBoundingClientRect();
        this.dataCacheMap.set(child, {
          rect: {
            width: rect.width,
            height: rect.height,
            x: rect.x - rootRect.x,
            y: rect.y - rootRect.y,
          },
          index: i,
        });
      }
    }
  }

  private offsetX = 0;
  private offsetY = 0;

  public mutation = debounce((offset?: { x: number; y: number }) => {
    if (offset) {
      if (offset.x !== this.offsetX || offset.y !== this.offsetY) {
        this.offsetX = offset.x;
        this.offsetY = offset.y;
      } else {
        return;
      }
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
      this.offsetX = 0;
      this.offsetY = 0;
      if (started) {
        started = false;

        this.gestureDetail = null;
        gestureDetail.data || (gestureDetail.data = {});
        this.dispatchEvent(
          new DropEvent((after = true) => {
            const selectedItemEl = gestureDetail.data.draggable as HTMLElement;
            if (selectedItemEl) {
              const { hoverContainer, hoverable, hoverIndex } =
                gestureDetail.data;
              if (hoverContainer.children.length) {
                hoverable.insertAdjacentElement(
                  after ? "afterend" : "beforebegin",
                  selectedItemEl
                );
              } else {
                hoverContainer.appendChild(selectedItemEl);
              }
              this.mutation(); // TODO
            }
          }, gestureDetail.data)
        );

        this.dispatchEvent(
          new EndEvent(
            gestureDetail,
            gestureDetail.data.draggable,
            gestureDetail.data.container
          )
        );
      }
    };

    this.gesture = createGesture({
      el: this,
      direction: "y",
      gestureName: "pzl-reorder-list",
      disableScroll: true,
      canStart: (gestureDetail: GestureDetail) => {
        gestureDetail.data = {};
        const { data, event } = gestureDetail;
        const els = event.composedPath();
        const draggable = els.find((el: any) =>
          this.containers.includes(el.parentElement)
        ) as HTMLElement;

        if (draggable) {
          data.draggable = draggable;
          data.container = draggable.parentElement;
        } else {
          return false;
        }

        if (this.canStart) {
          return this.canStart(gestureDetail);
        }
        return true;
      },
      onWillStart: this.onWillStart,
      onStart: (gestureDetail: GestureDetail) => {
        started = false;
        if (this.enable) {
          this.calcCacheData();

          const draggable: HTMLElement = gestureDetail.data.draggable;
          const container: HTMLElement = gestureDetail.data.container;
          const draggableRect: Rect = this.dataCacheMap.get(draggable).rect;

          if (draggable) {
            gestureDetail.data = {
              ...gestureDetail.data,
              draggable,
              container,
            };

            // calc drggable trigger point by origin
            let triggerOffsetX = 0;
            let triggerOffsetY = 0;
            if (this.draggableOrigin !== "current") {
              const { x, y, width, height } = draggableRect;
              switch (this.draggableOrigin) {
                case "center-center":
                  triggerOffsetX = width / 2;
                  triggerOffsetY = height / 2;
                  break;
                case "center-left":
                  triggerOffsetY = height / 2;
                  break;
                case "center-right":
                  triggerOffsetX = width;
                  triggerOffsetY = height / 2;
                  break;

                case "top-center":
                  triggerOffsetX = width / 2;
                  break;

                case "top-right":
                  triggerOffsetX = width;
                  break;

                case "bottom-center":
                  triggerOffsetX = width / 2;
                  triggerOffsetY = height;
                  break;

                case "bottom-left":
                  triggerOffsetY = height;
                  break;

                case "bottom-right":
                  triggerOffsetX = width;
                  triggerOffsetY = height;
                  break;
              }

              gestureDetail.data.triggerOffsetX = triggerOffsetX;
              gestureDetail.data.triggerOffsetY = triggerOffsetY;

              this.dispatchEvent(
                new StartEvent(gestureDetail, draggable, container)
              );
            }

            started = true;
          }
        } else {
          onEnd(gestureDetail);
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
          this.gestureDetail = gestureDetail;
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

declare global {
  interface HTMLElementTagNameMap {
    "viskit-reorder": Reorder;
  }
}
