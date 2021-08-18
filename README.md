# \<viskit-reorder\>

`<viskit-reorder>` web component, provides event data but no UI.

# Install

    npm i @viskit/reorder

# Use

```html
<viskit-reorder>
  <div>item 1</div>
  <div>item 2</div>
  <div>item 3</div>
  <div>item 4</div>
</viskit-reorder>

<script>
  const reorder = document.querySelector("viskit-reorder");
  reorder.addEventListener("viskit-start", (event) => {});
  reorder.addEventListener("viskit-drag", (event) => {});
  reorder.addEventListener("viskit-reorder", (event) => {});
  reorder.addEventListener("viskit-drop", (event) => {});
</script>
```

# API

### @viskit-start as StartEvent 

long press trigger viskit-start event.

##### Properties
+ `type`:string = "viskit-start"
+ `draggable`: HTMLElement 
+ `container`: HTMLElement  drggable's parent element.

##### Properties inherited from `GestureDetail`  
see https://ionicframework.com/docs/utilities/gestures#gesturedetail
+ `startX`: number
+ `startY`: number
+ `startTime`: number
+ `currentX`: number
+ `currentY`: number
+ `velocityX`: number
+ `velocityY`: number
+ `deltaX`: number
+ `deltaY`: number
+ `currentTime`: number
+ `event`: UIEvent
+ `data`: any

### @viskit-drag : DragEvent 

> Extends StartEvent.

Move to trigger viskit-drag event , event handler don't add time-consuming code because triggered at a high frequency. 

##### Properties
+ `type` = "viskit-drag"

### @viskit-reorder : ReorderEvent

> Extends StartEvent.

Short pause in effective hoverable to trigger viskit-reorder event.

You can add time-consuming code because triggered at a low frequency.

##### Properties
+ `hoverable`: HTMLElement - draggable element hovering over it. 
+ `hoverIndex`: number - index by container element (see hoverContainer property).
+ `hoverContainer`: HTMLElement - hoverable.parentElement.
+ `draggableIndex`: number - index by container element.
+ `hoverableRect`: DOMRect - hoverable.getBoundingClientrect()
+ `draggableRect`: - draggable.getBoundingClientrect()
+ `x`: number & `y`: number - trigger point.

### @viskit-drop : DropEvent

up to trigger viskit-drop event.

##### Properties
+ complete(after: boolean = true) => void
    + reorder doms
    + after - moving draggable element to hoverable element by after. true is after , false is before. (default true)


# LICENSE

MIT
