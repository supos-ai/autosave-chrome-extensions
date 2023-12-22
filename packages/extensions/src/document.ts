import { messageAction, messageType } from "extensions-config";

import nextMessageFlow from "./utils/nextMessageFlow";

import * as db from "./utils/db";
import checkConnect from "./utils/checkConnect";

import type { MessageData } from "./interface";

import bindInstance from "./utils/bindRequestProxy";

// 防止被监控网站自己缓存fetch对象， 所以在资源加载后立即重写fetch方法
bindInstance(true);

const windowMessageHandler = (event: MessageEvent) => {
  if (event.source !== window) return;

  if (!event.data) return;

  if (event.data.type !== messageType.MESSAGE_TYPE) return;

  const { to, action, payload } = event.data as MessageData;

  let ePayload: any = null;

  if (to === "document") {
    if (action === messageAction.CHECK_CONNECT_POPUP) {
      const isConnected = checkConnect();
      ePayload = {
        isConnected,
        host: isConnected ? location.host : null,
      };
    }
  }

  const messageFlow = nextMessageFlow(event.data);

  if (messageFlow.to === "content") {
    window.postMessage({
      ...event.data,
      ...messageFlow,
      payload: {
        ...payload,
        ...ePayload,
      },
    });
  }
};

window.addEventListener("message", windowMessageHandler);

/**
 * 页面加载后检测是否是 supOS 网站， 并发送消息通知 service_worker
 */

const initAntMessage = () => {
  const style = document.createElement("style");
  style.id = "temp-message-style";
  style.innerHTML = `
    .ant-message {display:none !important}
  `;
  document.head.appendChild(style);
};

const autoSave = () => {
  try {
    initAntMessage();
    (window as any).editor.save();
  } catch (err) {
    console.log(err);
  }
};

let timer: NodeJS.Timeout = 0 as unknown as NodeJS.Timeout;

const isDesignPage = () => !!document.querySelector("canvas.editCanvas");

const initPageAutoSave = async () => {
  //  等待页面加载完成
  await new Promise((resolve) => setTimeout(resolve, 10 * 1000));

  if (!isDesignPage()) return;

  clearAutoSave();

  // timer = setInterval(autoSave, 10 * 1000);
};

const clearAutoSave = () => clearTimeout(timer);

const handleSupOSConnectOnWindowLoad = () => {
  const url = new URL(location.href);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  const isConnected = checkConnect();

  if (isConnected) {
    db.init();
    // initPageAutoSave();
  }
  bindInstance(isConnected);

  window.postMessage({
    type: messageType.MESSAGE_TYPE,
    action: messageAction.CHECK_CONNECT_ACTION,
    path: "document.content.service",
    from: "document",
    to: "content",
    payload: {
      isConnected,
      host: isConnected ? location.host : null,
    },
  });
};

window.addEventListener("load", handleSupOSConnectOnWindowLoad);

window.addEventListener("beforeunload", () => {
  clearAutoSave();
});
