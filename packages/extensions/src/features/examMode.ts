import { StatePromises } from "../interface";
import { messageAction, messageType } from "extensions-config";

import { Payload } from "./index";
import { featuresList } from "./index";

interface Init {
  (): void;
  __autosave_examMode__: boolean;
}

const initTestMode = async () => {
  window.postMessage({
    type: messageType.MESSAGE_TYPE,
    action: messageAction.CHECK_TEST_MODE,
    path: "document.content.service",
    from: "document",
    to: "content",
    payload: {
      testMode: /\/workflow\/Layout_/.test(location.href),
    },
  });

  const { instanceId } = await fetch(
    "/inter-api/supos-tenant-manager/v1/tenant",
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("ticket")}`,
      },
    }
  ).then<{ instanceId: number }>((res) => res.json());

  const bindHTEditorDm = (editor: any) => {
    setTimeout(() => {
      const add = editor.dm.add;

      if (!add.length) return;
      editor.dm.add = function autoRewriteAdd() {
        var node = arguments[0];

        node.setAttrObject({
          renderId: (+instanceId).toString(36),
          ...node.getAttrObject(),
        });
        return add.apply(this, arguments);
      };
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

const init: Init = () => {
  if (init.__autosave_examMode__) return;
  init.__autosave_examMode__ = true;

  initTestMode();
  window.addEventListener("hashchange", initTestMode);
};
init.__autosave_examMode__ = false;

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
      init();
    })
    .catch(console.warn);
};

const unInject = (
  config: Record<string, any> & {
    checked: boolean;
  },
  statePromises: StatePromises
) => {
  return Promise.resolve();
};

export { inject, unInject };
