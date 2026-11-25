import { expect, test } from "bun:test";
import { Window } from "happy-dom";
import { installHoverInput } from "../src/hover-input";

function fixture() {
  const ownerWindow = new Window();
  const button = ownerWindow.document.createElement("button");
  button.setAttribute("aria-pressed", "true");
  button.className = "is-active";
  ownerWindow.document.body.append(button);
  const root = ownerWindow.document.documentElement;
  const dispose = installHoverInput(ownerWindow as unknown as globalThis.Window);
  const pointer = (type: string, pointerType: string) => button.dispatchEvent(new ownerWindow.PointerEvent(type, { bubbles: true, pointerType }));
  return { ownerWindow, button, root, dispose, pointer };
}

test("mouse hover is cleared during touch capture without changing selected state or focus", async () => {
  const context = fixture();
  try {
    expect(context.root.getAttribute("data-ui-hover")).toBe("false");
    context.pointer("pointerover", "mouse");
    expect(context.root.getAttribute("data-ui-hover")).toBe("true");
    context.button.focus();
    context.button.addEventListener("pointerdown", event => {
      expect(context.root.getAttribute("data-ui-hover")).toBe("false");
      event.stopPropagation();
    });
    context.pointer("pointerdown", "touch");
    expect(context.button.getAttribute("aria-pressed")).toBe("true");
    expect(context.button.className).toBe("is-active");
    expect(context.ownerWindow.document.activeElement).toBe(context.button);
    context.button.dispatchEvent(new context.ownerWindow.MouseEvent("mouseover", { bubbles: true }));
    context.button.dispatchEvent(new context.ownerWindow.MouseEvent("mousemove", { bubbles: true }));
    expect(context.root.getAttribute("data-ui-hover")).toBe("false");
    context.pointer("pointermove", "mouse");
    expect(context.root.getAttribute("data-ui-hover")).toBe("true");
    context.pointer("pointerover", "pen");
    expect(context.root.getAttribute("data-ui-hover")).toBe("false");
  } finally { context.dispose(); await context.ownerWindow.happyDOM.abort(); }
});

test("hover ownership is per document and releases its listeners and original attribute", async () => {
  const first = fixture();
  const second = fixture();
  try {
    first.pointer("pointermove", "mouse");
    expect(second.root.getAttribute("data-ui-hover")).toBe("false");
    first.ownerWindow.dispatchEvent(new first.ownerWindow.Event("blur"));
    expect(first.root.getAttribute("data-ui-hover")).toBe("false");
    first.dispose();
    first.pointer("pointerdown", "mouse");
    expect(first.root.hasAttribute("data-ui-hover")).toBe(false);
    second.dispose();
    second.root.setAttribute("data-ui-hover", "saved");
    const dispose = installHoverInput(second.ownerWindow as unknown as globalThis.Window);
    second.pointer("pointerover", "mouse");
    dispose();
    expect(second.root.getAttribute("data-ui-hover")).toBe("saved");
  } finally { await first.ownerWindow.happyDOM.abort(); await second.ownerWindow.happyDOM.abort(); }
});
