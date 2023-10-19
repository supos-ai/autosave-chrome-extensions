import {
  fetchProxy,
  originFetch,
  XHRProxy,
  originXHR,
} from "./utils/proxy/index";

import { messageAction, messageType } from "extensions-config";

import nextMessageFlow from "./utils/nextMessageFlow";

import * as db from "./utils/db";
import checkConnect from "./utils/checkConnect";

import type { MessageData } from "./interface";

const bindInstance = (isConnected: boolean) => {
  if (isConnected) {
    window.fetch = fetchProxy;
    window.XMLHttpRequest = XHRProxy as typeof XMLHttpRequest;
  } else {
    window.fetch = originFetch;
    window.XMLHttpRequest = originXHR as typeof XMLHttpRequest;
  }
};

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

const handleSupOSConnectOnWindowLoad = () => {
  const url = new URL(location.href);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  const isConnected = checkConnect();

  if (isConnected) db.init();
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
