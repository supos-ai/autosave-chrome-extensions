import { StatePromises } from "../interface";
import { Payload } from "./index";
import { featuresList } from "./index";
const isCurrentNode = (parent: HTMLElement) =>
  typeof parent.querySelector === "function" &&
  !!parent.querySelector('span[title="收藏夹"]');

let currentTarget: HTMLElement;

let isPropagation = false;
let isFindMenuRoot = false;

const map = new WeakMap();

const overwriteStyleSheet = () => {
  var style = document.createElement("style");
  document.head.appendChild(style);
  style.type = "text/css";
  const cssRules = `
  .autosave-ext-submenu-open .sup-menu {
    display:table !important;
  }
  .autosave-ext-submenu-close .sup-menu {
    display:none !important;
  }
  .autosave-ext-submenu-open .supicon {
    transform: rotateZ(90deg) !important;
  }
  .autosave-ext-submenu-close .supicon {
    transform: rotateZ(0) !important;
  }
  `;
  style.appendChild(document.createTextNode(cssRules));
};

const cleanCustomCLass = (node: HTMLElement) => {
  node.classList.remove("autosave-ext-submenu-close");
  node.classList.remove("autosave-ext-submenu-open");
};
const observeMenuList = (root: HTMLElement | null) => {
  if (!root) return;
  const config = {
    attributes: true,
    attributeOldValue: true,
    childList: true,
    subtree: true,
  };
  const handle: MutationCallback = (mutationsList, observer) => {
    for (let mutation of mutationsList) {
      const target = mutation.target as HTMLElement;
      const { oldValue } = mutation;

      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        // 内部状态改变会重写class
        // active状态的改变时候检查是否需要恢复自定义状态
        if (
          (!oldValue?.split(" ").includes("sup-menu-submenu-active") &&
            [...target.classList].includes("sup-menu-submenu-active")) ||
          (oldValue?.split(" ").includes("sup-menu-submenu-active") &&
            ![...target.classList].includes("sup-menu-submenu-active")) ||
          (!oldValue?.split(" ").includes("sup-menu-submenu-selected") &&
            [...target.classList].includes("sup-menu-submenu-selected")) ||
          (oldValue?.split(" ").includes("sup-menu-submenu-selected") &&
            ![...target.classList].includes("sup-menu-submenu-selected"))
        ) {
          if (map.get(target)) {
            target.classList.add("autosave-ext-submenu-open");
          } else {
            target.classList.add("autosave-ext-submenu-close");
          }

          // if ([...target.classList].includes("sup-menu-submenu-open")) {
          //   map.set(target, true);
          // }
        }

        // 无论打开或关闭只受自定义状态控制

        if (
          (!oldValue?.split(" ").includes("sup-menu-submenu-open") &&
            [...target.classList].includes("sup-menu-submenu-open")) ||
          (oldValue?.split(" ").includes("sup-menu-submenu-open") &&
            ![...target.classList].includes("sup-menu-submenu-open"))
        ) {
          cleanCustomCLass(target);
          if (target === currentTarget) {
            if (map.get(target)) {
              target.classList.add("autosave-ext-submenu-close");
              map.set(target, false);
            } else {
              target.classList.add("autosave-ext-submenu-open");
              map.set(target, true);
            }
          } else {
            if (map.get(target)) {
              target.classList.add("autosave-ext-submenu-open");
              map.set(target, true);
            } else {
              target.classList.add("autosave-ext-submenu-close");
              map.set(target, false);
            }
          }
        }
      }
      Promise.resolve().then(() => (isPropagation = false));
    }
  };
  const observer = new MutationObserver(handle);

  observer.observe(root, config);
};

const bind = (node: HTMLElement) => {
  if ([...node.classList].includes("sup-menu-item")) return;

  if ([...node.classList].includes("sup-menu-submenu-open")) {
    map.set(node, true);
  } else {
    map.set(node, false);
  }
  node.addEventListener("click", function () {
    if (isPropagation) return;
    isPropagation = true;
    currentTarget = node;
  });
};

const deepBind = (node: HTMLElement) => {
  if (
    node.tagName &&
    node.tagName.toLowerCase() === "li" &&
    node.getAttribute("role") === "menuitem"
  ) {
    bind(node as HTMLElement);
    node = node.lastChild as HTMLElement;
  }

  if (
    node.tagName &&
    node.tagName.toLowerCase() === "ul" &&
    node.getAttribute("role") === "menu"
  ) {
    const children = node.childNodes;
    if (children.length) {
      children.forEach((node) => deepBind(node as HTMLElement));
    }
  }
};

const observeMenu = () => {
  let timer: NodeJS.Timeout;
  const root = document.querySelector("#root")!;
  const config = { attributes: true, childList: true, subtree: true };

  const handle: MutationCallback = (mutationsList, observer) => {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        const addNodes = mutation.addedNodes;
        if (addNodes.length) {
          for (let node of addNodes) {
            deepBind(node as HTMLElement);
            if (!isFindMenuRoot && isCurrentNode(node as HTMLElement)) {
              // clearTimeout(timer);
              // observer.disconnect();
              isFindMenuRoot = true;
              const root = node.parentElement;
              observeMenuList(root);
            }
          }
        }
      }
    }
  };
  const observer = new MutationObserver(handle);

  observer.observe(root, config);

  // timer = setTimeout(() => observer.disconnect(), 30 * 1000);
};

let timer: NodeJS.Timeout;
const inject = (
  config: Record<string, any> & {
    checked: boolean;
  },
  statePromises: StatePromises
) => {
  return statePromises.load
    .then((isConnected) => {
      if (!isConnected) return;
      overwriteStyleSheet();
      observeMenu();
    })
    .catch(console.warn);
};

const unInject = (
  config: Record<string, any> & {
    checked: boolean;
  },
  statePromises: StatePromises
) => {
  return Promise.resolve().then(() => clearInterval(timer));
};

export { inject, unInject };
