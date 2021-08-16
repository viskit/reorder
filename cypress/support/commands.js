Cypress.Commands.add(
  "dnd",
  {
    prevSubject: "optional",
  },
  (subject, { target, x, y, x1, y1, dropTimeout }) => {
    dropTimeout = dropTimeout || 0;
    const exec = ({ startX, startY, endX, endY }) => {
      const ready = cy
        .wrap(subject)
        .trigger("mousedown", { pageX: startX, pageY: startY, force: true,which: 1 })
        .wait(600)
        .trigger("mousemove", {
          clientX: startX,
          pageX: startX,
          clientY: startY + 10,
          pageY: startY + 10,
          force: true,
          which: 1
        });

      const xb = Math.ceil(Math.abs(endX - startX) / 5);
      const yb = Math.ceil(Math.abs(endY - startY) / 5);
      const b = xb > yb ? xb : yb;

      const xPart = Math.floor((endX - startX) / b);
      const yPart = Math.floor((endY - startY) / b);

      for (let i = 0; i < b; i++) {
        ready.wait(5).trigger("mousemove", {
          pageX: startX + xPart * (i + 1),
          pageY: startY + yPart * (i + 1),

          clientX: startX + xPart * (i + 1),
          clientY: startY + yPart * (i + 1),

          force: true,
        });
      }
      ready
        .wait(5)
        .trigger("mousemove", { 
          clientX: endX, clientY: endY, 
          pageX: endX, pageY: endY, 
          force: true })
        .wait(dropTimeout)
        .trigger("mouseup");
    };

    if (target) {
      cy.get(target)
        .then(([targetEl]) => {
          return targetEl.getBoundingClientRect();
        })
        .then((targetRect) => {
          const subjectRect = subject[0].getBoundingClientRect();
          x = x || 0;
          y = y || 0;
          x1 = x1 || 0;
          y1 = y1 || 0;
          exec({
            startX: subjectRect.x + x,
            startY: subjectRect.y + y,
            endX: targetRect.x + x1,
            endY: targetRect.y + y1,
          });
        });
    } else {
      x = x || 0;
      y = y || 0;
      const subjectRect = subject[0].getBoundingClientRect();
      exec({
        start: subjectRect.x + x,
        startY: subjectRect.y + y,
        endX: x1,
        endY: y1,
      });
    }

    return cy.wrap(subject);
  }
);
