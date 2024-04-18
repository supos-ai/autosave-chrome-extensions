import { messageAction, messageType } from "extensions-config";
import {
  getPageId,
  filterUnsafeNode,
  encode,
  decode,
  renderUnsafeInformation,
  mergePageInfo,
  noop,
} from "./utils";

import retry from "../../utils/retry";
interface Init {
  (
    config: Record<string, any> & {
      checked: boolean;
    }
  ): void;
  __autosave_examMode__: boolean;
}

const getInstanceId = () => fetch("/inter-api/supos-tenant-manager/v1/tenant", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("ticket")}`,
  },
})
  .then((res) => res.json())
  .catch(() => ({ instanceId: "1000000000000000" }));

const fetchPage = retry(
  (): Promise<any> =>
    fetch(`/api/compose/manage/pages/${getPageId()}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("ticket")}`,
      },
    }).then((res) => res.json())
);

let unMutationCodeBox = noop;

const detectCodeBox = () => {
  const config = {
    childList: true,
    subtree: true,
  };
  const handle: MutationCallback = (mutationsList, observer) => {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        const addNodes = mutation.addedNodes;
        if (addNodes.length) {
          for (let node of addNodes) {
            if (
              (node as HTMLElement).tagName &&
              (node as HTMLElement).tagName.toLowerCase() === "div" &&
              (node as HTMLElement).querySelector(
                "div[data-mode-id='plaintext']"
              )
            ) {
              let el = (node as HTMLElement).querySelector(
                "div[data-mode-id='plaintext']"
              )!.nextElementSibling;

              while (el) {
                const t = el.nextElementSibling;
                el.parentElement?.removeChild(el);
                el = t;
              }
            }
          }
        }
      }
    }
  };
  const observer = new MutationObserver(handle);

  observer.observe(document.querySelector("#root")!, config);

  return () => observer.disconnect();
};

const initTestMode = async () => {
  const { instanceId } = await getInstanceId();

  // const bindHTEditorDm = (editor: any) => {
  //   const { dm, add } = editor;
  //   if (dm.isAutosaveProxy) return;

  //   const overwriteAdd = (...args: any[]) => {
  //     var node = args[0];

  //     node.setAttrObject({
  //       renderId: encode(instanceId),
  //       ...node.getAttrObject(),
  //     });
  //     return add.apply(editor.dm, args);
  //   };

  //   const handle: ProxyHandler<any> = {
  //     get(target, prop, receiver) {
  //       if (prop === "add") {
  //         return overwriteAdd;
  //       }
  //       if (prop === "isAutosaveProxy") {
  //         return true;
  //       }
  //       return Reflect.get(target, prop, receiver);
  //     },
  //   };
  //   const proxyDm = new Proxy(editor.dm, handle);

  //   Object.defineProperty(editor, "dm", {
  //     get: function () {
  //       return proxyDm;
  //     },
  //   });
  // };

  const bindHTEditorDm = (editor: any) => {
    const { add } = editor.dm;
    if (add.isAutosaveInject) return;

    const overwriteAdd = (...args: any[]) => {
      var node = args[0];

      node.setAttrObject({
        renderId: encode(instanceId),
        ...node.getAttrObject(),
      });
      return add.apply(editor.dm, args);
    };
    overwriteAdd.isAutosaveInject = true;

    setTimeout(() => {
      editor.dm.add = overwriteAdd;
    }, 2000);
  };

  const testEditor = () => {
    if ((window as any).editor) {
      bindHTEditorDm((window as any).editor);
      return;
    } else if ((window as any).COMPVIEW?.editor) {
      bindHTEditorDm((window as any).COMPVIEW?.editor);
      return;
    }
    requestAnimationFrame(testEditor);
  };
  testEditor();
};

const initApprovalMode = async (
  config: Record<string, any> & {
    checked: boolean;
  }
) => {
  try {
    const { layouts, layout } = await fetchPage();
    const [page] = layouts;

    const { context: contextString } = page;
    const context = JSON.parse(contextString);

    const layoutInfo = JSON.parse(layout);

    const { d: nodes, a: pageInfo } = context.context.jsonData;

    const mergedPageInfo = mergePageInfo(pageInfo, layoutInfo);

    if (!mergedPageInfo) return;

    const { instanceId } = await getInstanceId();
    const unsafeNodes = filterUnsafeNode(nodes, instanceId);
    renderUnsafeInformation(unsafeNodes, mergedPageInfo);
  } catch (err) {
    console.log(err);
  }
};

const handleHashChange = (
  config: Record<string, any> & {
    checked: boolean;
  }
) => {
  const testMode = /\/workflow\/Layout_/.test(location.href);
  const approvalMode =
    /\/runtime-fullscreen\/runtime-fullscreen/.test(location.href) ||
    /\/preview\/workflow\//.test(location.href);

  const payload = {
    testMode,
    approvalMode: approvalMode && config.approvalMode,
  };

  window.postMessage({
    type: messageType.MESSAGE_TYPE,
    action: messageAction.CHECK_TEST_MODE,
    path: "document.content.service",
    from: "document",
    to: "content",
    payload,
  });

  return payload;
};

const init: Init = (config) => {
  if (init.__autosave_examMode__) return;
  init.__autosave_examMode__ = true;

  const load = () => {
    const { testMode, approvalMode } = handleHashChange(config);
    testMode ? (unMutationCodeBox = detectCodeBox()) : unMutationCodeBox();
    testMode && initTestMode();
    approvalMode && initApprovalMode(config);
  };
  load();
  window.addEventListener("hashchange", load);
};
init.__autosave_examMode__ = false;

let timer: NodeJS.Timeout;
const inject = (
  config: Record<string, any> & {
    checked: boolean;
  }
) => {
  return Promise.resolve()
    .then(() => {
      init(config);
    })
    .catch(console.warn);
};

const unInject = (
  config: Record<string, any> & {
    checked: boolean;
  }
) => {
  return Promise.resolve();
};

export { inject, unInject };
