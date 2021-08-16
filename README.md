# viskit-reorder

reorder web component

# API

### mutation()

will call `calcCacheData()` and generate `containers`

### calcCacheData()

### enable = true

### longPressTimeout = 300

### containerSelectors? : string[]

### containers: HTMLElement[]

default [this]

### triggerPoint = "center-center"

```ts
type DraggableOrigin = "top-left" |
                    "top-center" |
                    "top-right" |
                    "center-left" |
                    "center-center" |
                    "center-right" |
                    "bottom-left" |
                    "bottom-center" |
                    "bottom-right" 
```

### canStart

```ts
canStart(args:  GestureDetail & { draggable: HTMLElement; container: HTMLElement; }): boolean;
```

### onStart

```ts

onStart({
    detail: GestureDetail &
    { data: { draggable: HTMLElement; container: HTMLElement; } }
});
```

### onDrag

```ts
onDrag({
    detail: GestureDetail &
    { data: {
        draggable: HTMLElement;
        container: HTMLElement;
    } }
});
```

### onReorder

```ts
onReorder({
    detail: GestureDetail &
    { data: {
            draggable: HTMLElement;
            container: HTMLElement;
            hoverable: HTMLElement;
            hoverIndex: number;
            hoverContainer: HTMLElement;
    } }
});
```

### onDrop

```ts
onDrop({
    detail: GestureDetail &
    { data: {
            draggable: HTMLElement;
            container: HTMLElement;
            hoverable: HTMLElement;
            hoverIndex: number;
            hoverContainer: HTMLElement;

            complete:(bool:boolean)=>void;
    } }
});
```

![](https://raw.githubusercontent.com/viskit/viskit-reorder/main/show.gif)

# Install

    npm i @viskit/reorder

# Use

See sample online [https://codepen.io/liangzeng/pen/mdRKbOE](https://codepen.io/liangzeng/pen/mdRKbOE)

```html
<viskit-reorder>
  <div>item 1</div>
  <div>item 2</div>
  <div>item 3</div>
  <div>item 4</div>
</viskit-reorder>
```

# LICENSE

MIT
