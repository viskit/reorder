import { createGesture, Gesture, GestureDetail } from "@ionic/core";
import { LitElement, html, css, query, state } from "lit-element";

import {styleMap} from "lit-html/directives/style-map";

class Demo extends LitElement {
  @query(".draggable")
  el: HTMLDivElement;

  @query(".scroll")
  scrollEl: HTMLDivElement;

  @query(".list")
  list: HTMLDivElement;


  @state()
  offset = 0;

  private cloneEl: HTMLElement;

  firstUpdated() {

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        console.log(entry);
      }
    });
    resizeObserver.observe(this.list);

    
    const gesture = createGesture({
      gestureName: "test",
      el: this.el,
      canStart:(ev)=> {

        this.cloneEl = this.el.cloneNode(true) as HTMLElement;
        const styles = globalThis.getComputedStyle(this.el);

        for(let i=0,len=styles.length;i<len;i++){
          const key = styles.item(i);
          this.cloneEl.style.setProperty(key, styles.getPropertyValue(key));
        }

        const elRect = this.el.getBoundingClientRect();
        this.cloneEl.style.position = "absolute";
        this.cloneEl.style.top = elRect.top +"px";
        this.cloneEl.style.left = elRect.left +"px";
        this.cloneEl.style.width = elRect.width +"px";
        this.cloneEl.style.height = elRect.height +"px";

        document.body.appendChild(this.cloneEl);

        setTimeout(()=>{
            this.scrollEl.scrollBy({top:30});
        },5000);
        return true;
      },
      onStart(ev) {
        console.log("onStart", ev);
      },
      onMove:(ev)=>{
        console.log("onMove", ev);

        this.cloneEl.style.transform = `translateY(${ev.deltaY}px)`;
      },
      onEnd(ev) {
        console.log("OnEnd", ev);
      },
    });
    gesture.enable();
  }

  static get styles() {
    return css`
    :host{
        user-select:none;
    }
      .scroll {
        overflow-x: hidden;
        height: 200px;
        border: 1px solid #aaa;
      }
      .list {
        min-height: 120px;
      }

    `;
  }

  render() {
    return html`
      <div class="scroll">
        <div class="list">
          <div>placeholder</div>
          <div>placeholder</div>
          <div>placeholder</div>
          <div>placeholder</div>
          <div>placeholder</div>
          <div class="draggable"
          >draggable el</div>

          <div>placeholder</div>
          <div>placeholder</div>
          <div>placeholder</div>
          <div>placeholder</div>
          <div>placeholder</div>
          <div>placeholder</div>
          <div>placeholder</div>
          <div>placeholder</div>
          <div>placeholder</div>
          <div>placeholder</div>
          <div>placeholder</div>
          <div>placeholder</div>
          <div>placeholder</div>
          <div>placeholder</div>
          <div>placeholder</div>
        </div>
      </div>
    `;
  }
}

window.customElements.define("test-demo", Demo);

document.body.innerHTML = `<test-demo></test-demo>`;
