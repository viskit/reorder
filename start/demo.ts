import { LitElement, html, css } from "lit";
import { property, state, query, queryAll } from "lit/decorators.js";
import { register } from "@viskit/long-press";

import {
  StartEvent,
  DropEvent,
  ReorderEvent,
  DragEvent,
  Reorder,
} from "../src/index";
import "../src/index";
import clone from "clone-element";

const clear = (children: HTMLCollection) => {
  const childrens = Array.from(children) as HTMLElement[];
  childrens.forEach((c) => {
    c.style.transform = "";
    c.classList.remove("transform");
  });
};

export class Demo extends LitElement {
  static get styles() {
    return css`
      #c1,
      #c2 {
        min-height: 100px;
        border: 1px solid #ccc;
        margin-top: 20px;
      }

      .draggable {
        background-color: #3710d6;
      }

      .transform {
        transition: transform 0.2s;
      }

      .item {
        margin: 5px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #c7bcf5;
      }
    `;
  }

  @queryAll(".container")
  containers: NodeList;

  @query("viskit-reorder")
  reorder: Reorder;

  onStart({ draggable, data }: StartEvent) {
    // clone
  }

  onDrag({ data, deltaY }: DragEvent) {
    this.dragEl.style.transform = `translateY(${deltaY}px)`;
  }

  onReorder({
    data,
    y,
    container,
    hoverIndex,
    hoverable,
    hoverContainer,
    draggable,
    draggableIndex,
    draggableRect,
    hoverableRect,
  }: ReorderEvent) {

    const prevHoverContainer = data.hoverContainer as HTMLElement;

    // clear prev

    let index = hoverIndex;

    // clear previous cntainer's children transform
    if (prevHoverContainer !== hoverContainer && prevHoverContainer) {
      clear(prevHoverContainer.children);
    }

    if (container === hoverContainer) {
      if (hoverIndex === draggableIndex) {
        clear(hoverContainer.children);
      } else if (hoverIndex < draggableIndex) {
        if (y > hoverableRect.top + hoverableRect.height / 2) {
          ++index;
          data.after = true;
        } else {
          data.after = false;
        }
        if (index === draggableIndex) {
          clear(hoverContainer.children);
        } else {
          const children = Array.from(hoverContainer.children) as HTMLElement[];
          for (let i = 0, len = children.length; i < len; i++) {
            children[i].classList.contains("transform") ||
              children[i].classList.add("transform");
            let y = 0;
            if (i >= index && i < draggableIndex) {
              y = draggableRect.height;
            }
            children[i].style.transform = `translateY(${y}px)`;
          }
        }
      } else {
        if (y < hoverableRect.top + hoverableRect.height / 2) {
          --index;
          data.after = false;
        } else {
          data.after = true;
        }

        if (index === draggableIndex) {
          clear(hoverContainer.children);
        } else {
          const children = Array.from(hoverContainer.children) as HTMLElement[];
          for (let i = 0, len = children.length; i < len; i++) {
            let y = 0;
            if (i > draggableIndex && i <= index) {
              y = -draggableRect.height;
            }
            children[i].classList.contains("transform") ||
              children[i].classList.add("transform");

            children[i].style.transform = `translateY(${y}px)`;
          }
        }
      }
    } else {
      if (hoverable) {
        const fromTop = draggableRect.top < hoverableRect.top;

        if (y > hoverableRect.top + hoverableRect.height / 2) {
          ++index;
          data.after = true;
        } else {
          data.after = false;
        }
        const children = Array.from(hoverContainer.children) as HTMLElement[];
        for (let i = 0, len = children.length; i < len; i++) {
          let y = 0;

          if (index === children.length) {
            y = -draggableRect.height;
          } else {
            if (i >= index) {
              y = draggableRect.height;
            }
          }

          children[i].classList.contains("transform") ||
            children[i].classList.add("transform");

          if (
            (fromTop && hoverIndex === 0 && !data.after) ||
            (!fromTop &&
              hoverIndex === hoverContainer.children.length - 1 &&
              data.after)
          ) {
            y = y / 2;
          }
          children[i].style.transform = `translateY(${y}px)`;
        }
      }
    }

    data.hoverContainer = hoverContainer;
    data.dropIndex = index;
  }

  onDrop({ data, complete }: DropEvent) {
    console.log("ondrop");
    complete(data.after);
  }

  private dragEl: HTMLElement;

  render() {
    return html`
      <viskit-reorder
        @viskit-start=${this.onStart}
        @viskit-drag=${this.onDrag}
        @viskit-reorder=${this.onReorder}
        @viskit-drop=${this.onDrop}
        @viskit-end=${({ data }) => {
          this.reorder.enable = false;
          this.dragEl && this.dragEl.remove();
          data.draggable && (data.draggable.style.opacity = "1");

          data.hoverContainer && clear(data.hoverContainer.children);
          data.container && clear(data.container.children);
        }}
        data-longpress-delay="1000"
      >
        <div id="c1" class="container">
          <div id="a" class="item">a</div>
          <div id="b" class="item">b</div>
          <div id="c" class="item">c</div>
          <div id="b2" class="item">b2</div>
          <div id="b3" class="item">b3</div>
        </div>
        <div id="c2" class="container">
          <div id="d" class="item">hi</div>
        </div>
      </viskit-reorder>
    `;
  }

  firstUpdated() {
    this.reorder.containers = Array.from(this.containers) as HTMLElement[];
    register(this.shadowRoot);
    this.reorder.addEventListener(
      "long-press",
      (e: PointerEvent) => {
        const draggable = e.target as HTMLElement;
        if (this.reorder.containers.includes(draggable.parentElement)) {
          const dragEl = draggable.cloneNode(true) as HTMLElement;
          const { left, top, width, height } =
            draggable.getBoundingClientRect();
          const styles = window.getComputedStyle(draggable);

          for (let i = 0, len = styles.length; i < len; i++) {
            const key = styles.item(i);
            dragEl.style.setProperty(key, styles.getPropertyValue(key));
          }
          dragEl.style.position = "absolute";
          dragEl.style.top = top + "px";
          dragEl.style.left = left + "px";
          dragEl.style.margin = "0";
          dragEl.style.width = width + "px";
          dragEl.style.height = height + "px";
          dragEl.style.pointerEvents = "none";
          // dragEl.classList.add("draggable");

          // dragEl.style.transform = `translateY(${}px)`; 
          this.dragEl = dragEl;
          draggable.style.opacity = "0";
          document.body.appendChild(dragEl);

          this.reorder.enable = true;
        }
      },
      true
    );
  }
}

window.customElements.define("zl-demo", Demo);

document.body.innerHTML = "<zl-demo></zl-demo>";
