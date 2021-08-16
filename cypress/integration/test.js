describe("viskit-reorder", () => {
  const ready1 = () => {
    cy.viewport("iphone-6");
    cy.visit("http://localhost:9000");
    cy.window().then(({ document }) => {
      document.body.innerHTML = `
        <style>
          html, body {
            overflow:hidden;
            height: 100%;
            margin:0;padding:0;
            user-select: none;
          }

          .item {
            border: 1px solid #eee;
            margin: 5px;
            height : 50px;
          }
        </style>
        <viskit-reorder >
            <div class="item" id="target" >a</div>
            <div class="item" id="draggable">b</div>
            <div class="item">c</div>
        </viskit-reorder>
      `;
    });
  };

  /**
   *  <container1/><container2/>
   * */ 
  const ready2 = () => {
    cy.viewport("iphone-6");
    cy.visit("http://localhost:9000");
    cy.window().then(({ document }) => {
      document.body.innerHTML = `
        <style>
          html, body {
            overflow:hidden;
            height: 100%;
            margin:0;padding:0;
            user-select: none;
          }

          .item {
            border: 1px solid #eee;
            margin: 5px;
            height : 50px;
          }

          .container1, .container2 {
            min-height: 200px;
          }

        </style>
        <viskit-reorder >
          <div id="container1">
            <div class="item" id="target" >a</div>
            <div class="item" id="draggable">b</div>
            <div class="item">c</div>
          </div>

          <div id="container2">
            
          </div>

            
        </viskit-reorder>
      `;
    });
  };


  it("#canStart return  true", () => {
    ready1();
    let started = false;

    cy.get("viskit-reorder").then(([reorder]) => {
      // reorder.canStart = () => false;
      reorder.addEventListener("onStart", () => (started = true));
    });

    cy.get("#draggable").dnd({
      target: "#target",
      x: 10,
      y: 10,
      x1: 10,
      y1: 10,
    });

    cy.wait(700).then(() => expect(started).eql(true));
  });

  it("#canStart return false", () => {
    ready1();

    let started = false;

    cy.get("viskit-reorder").then(([reorder]) => {
      reorder.canStart = () => false;
      reorder.addEventListener("onStart", () => (started = true));
    });

    cy.get("#draggable").dnd({
      target: "#target",
      x: 10,
      y: 10,
      x1: 10,
      y1: 10,
      // dropTimeout: 2000,
    });

    cy.wait(900).then(() => expect(started).eql(false));
  });




  it("#onStart", () => {
    ready1();

    let detail;

    cy.get("viskit-reorder").then(([reorder]) => {
      reorder.addEventListener("onStart", (ev) => (detail = ev.detail));
    });

    cy.get("#draggable").dnd({
      target: "#target",
      x: 10,
      y: 10,
      x1: 10,
      y1: 10,
    });

    cy.document().then((doc) => {
      const reorder = doc.querySelector("viskit-reorder");
      const draggable = doc.querySelector("#draggable");
      expect(detail.container).eql(reorder);
      expect(detail.draggable).eql(draggable);
    });
  });


  

  it("#containerSelectors", () => {
    ready2();

    let detail;

    cy.get("viskit-reorder").then(([reorder]) => {
      reorder.containerSelectors = ["#container1","#container2"];
      reorder.addEventListener("onStart", (ev) => (detail = ev.detail));
    });

    cy.wait(50);

    cy.get("#draggable").dnd({
      target: "#target",
      x: 10,
      y: 10,
      x1: 10,
      y1: 10,
    });

    cy.document().then((doc) => {
      const container = doc.querySelector("#container1");
      const container2 = doc.querySelector("#container2");
      const reorder = doc.querySelector("viskit-reorder");
      const draggable = doc.querySelector("#draggable");

      expect(reorder.containers.length).to.eql(2);
      expect(reorder.containers).to.deep.include(container);
      expect(reorder.containers).to.deep.include(container2);

      expect(detail.container).eql(container);
      expect(detail.draggable).eql(draggable);
      const {height,width} = draggable.getBoundingClientRect()
      expect(detail.data.triggerOffsetX).eql(width/2 - 10);
      expect(detail.data.triggerOffsetY).eql(height/2 - 10);
    });
  });

  it.only("#onReorder", () => {
    ready2();

    let detail;

    cy.get("viskit-reorder").then(([reorder]) => {
      reorder.containerSelectors = ["#container1","#container2"];
      reorder.addEventListener("onReorder", (ev) => {
        detail = ev.detail
      });
    });

    cy.wait(50);

    cy.get("#draggable").dnd({
      target: "#target",
      x: 20,
      y: 20,
      x1: 10,
      y1: 10,
    });

    cy.wait(500);

    cy.document().then((doc) => {
      const container = doc.querySelector("#container1");
      const container2 = doc.querySelector("#container2");
      const reorder = doc.querySelector("viskit-reorder");
      const draggable = doc.querySelector("#draggable");
      const target = doc.querySelector("#target");

      expect(detail.hoverable).eql(target);
      expect(detail.hoverContainer).eql(container);
      expect(detail.container).eql(container);
      expect(detail.hoverIndex).eql(0);
      expect(detail.draggable).eql(draggable);
      
      

    });


  });
});
