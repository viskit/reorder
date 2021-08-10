# viskit-reorder

reorder web component

# API

### containers? : string[] | HTMLElement[] | ()=>HTMLElement[]

default [this]

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
            hoverable: HTMLElement;
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
            hoverContainer: HTMLElement;
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
