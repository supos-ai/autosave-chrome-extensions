import noop from "../../utils/noop";
import renderScriptsHelper from "./renderScriptsHelper";
const observe = () => {
  const url = window.location.href;

  if (!/\/static\/oodm-frontend\//.test(url)) return noop;

  const config = { attributes: true, childList: true, subtree: true };

  const handle: MutationCallback = (mutationsList, observer) => {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        const addNodes = mutation.addedNodes;
        if (addNodes.length) {
          for (let node of addNodes) {
            renderScriptsHelper(node);
          }
        }
      }
    }
  };
  const observer = new MutationObserver(handle);

  observer.observe(
    document.querySelector("#root") || document.querySelector("#supngin-root")!,
    config
  );
};

const inject = (
  config: Record<string, any> & {
    checked: boolean;
  }
) => {
  return Promise.resolve()
    .then(() => {
      const disconnect = observe();
    })
    .catch(console.warn);
};

const unInject = (
  config: Record<string, any> & {
    checked: boolean;
  }
) => {};

export { inject, unInject };
