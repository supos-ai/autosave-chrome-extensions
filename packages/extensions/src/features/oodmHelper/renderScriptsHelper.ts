import { messageAction, messageType } from "extensions-config";

import { createPopupButton } from "./utils";

const renderScriptsHelper = (_node: Node) => {
  if (_node.nodeType !== 1) return;

  const node = _node as HTMLElement;

  if (node.tagName.toLowerCase() !== "div") return;
  //   node.classList && [...node.classList].includes("ace_editor")

  let editor: HTMLElement | null;
  if ((editor = node.querySelector(".ace_editor"))) {
    if ((editor as any).__renderScriptsHelper__) return;
    (editor as any).__renderScriptsHelper__ = true;

    const button = createPopupButton();

    button.addEventListener("click", () => {
      window.postMessage({
        type: messageType.MESSAGE_TYPE,
        action: messageAction.POPUP_HELPER,
        path: "document.content.service",
        from: "document",
        to: "content",
        payload: {
          type: "service",
        },
      });
    });
    editor.appendChild(button);
  }
};

export default renderScriptsHelper;
