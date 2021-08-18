import { LitElement, html, property, state, css } from "lit-element";
import {
  onStartEvent,
  onDragEvent,
  onDropEvent,
  onReorderEvent,
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

  onStart(ev: onStartEvent) {
    // clone
    const draggable = ev.detail.draggable;
    const dragEl = clone(draggable) as HTMLElement;
    const { left, top, width, height } = draggable.getBoundingClientRect();
    dragEl.style.position = "absolute";
    dragEl.style.top = top + "px";
    dragEl.style.left = left + "px";
    dragEl.style.margin = "0";
    dragEl.style.width = width + "px";
    dragEl.style.height = height + "px";

    dragEl.classList.add("draggable");

    // dragEl.style.transform = `translateY(${}px)`;
    ev.detail.data.dragEl = dragEl;

    document.body.appendChild(dragEl);

    draggable.style.opacity = "0";
  }

  onDrag(ev: onDragEvent) {
    ev.detail.data.dragEl.style.transform = `translateY(${ev.detail.deltaY}px)`;
  }

  onReorder(ev: onReorderEvent) {
    const prevHoverContainer = ev.detail.data.hoverContainer as HTMLElement;

    // clear prev

    const {
      y,
      container,
      hoverIndex,
      hoverable,
      hoverContainer,
      draggable,
      draggableIndex,
      draggableRect,
      hoverableRect,
    } = ev.detail;

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
          ev.detail.data.after = true;
        } else {
          ev.detail.data.after = false;
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
          ev.detail.data.after = false;
        } else {
          ev.detail.data.after = true;
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
      const fromTop = draggableRect.top < hoverableRect.top;

      if (y > hoverableRect.top + hoverableRect.height / 2) {
        ++index;
        ev.detail.data.after = true;
      } else {
        ev.detail.data.after = false;
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
          ( fromTop && hoverIndex === 0 && !ev.detail.data.after) ||
          (!fromTop && hoverIndex === hoverContainer.children.length - 1 &&
            ev.detail.data.after)
        ) {
          y = y / 2;
        }
        children[i].style.transform = `translateY(${y}px)`;
      }
    }

    ev.detail.data.hoverContainer = hoverContainer;
    ev.detail.data.dropIndex = index;
  }

  onDrop(ev: onDropEvent) {
    ev.detail.data.dragEl.remove();
    ev.detail.data.draggable.style.opacity = "1";
    if (ev.detail.data.hoverContainer) {
      clear(ev.detail.data.hoverContainer.children);
      if (ev.detail.data.draggable !== ev.detail.data.hoverable) {
        ev.detail.complete(true, ev.detail.data.after);
      }
    }
  }

  render() {
    return html`
      <viskit-reorder
        @onStart=${this.onStart}
        @onDrag=${this.onDrag}
        @onReorder=${this.onReorder}
        @onDrop=${this.onDrop}
        .containerSelectors=${["#c1", "#c2"]}
      >
        <div id="c1">
          <div id="a" class="item">a</div>
          <div id="b" class="item">b</div>
          <div id="c" class="item">c</div>
          <div id="b2" class="item">b2</div>
          <div id="b3" class="item">b3</div>
        </div>
        <div id="c2">
          <div id="d" class="item">d</div>
        </div>
      </viskit-reorder>
    `;
  }
}

window.customElements.define("zl-demo", Demo);

document.body.innerHTML = "<zl-demo></zl-demo>";
