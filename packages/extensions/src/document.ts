import { messageAction, messageType } from "extensions-config";

import nextMessageFlow from "./utils/nextMessageFlow";

import * as db from "./utils/db";
import checkConnect from "./utils/checkConnect";

import type { MessageData, StatePromises } from "./interface";

import bindInstance from "./utils/bindRequestProxy";

import { injectFeature, featuresList } from "./features";

// 防止被监控网站自己缓存fetch对象， 所以在资源加载后立即重写fetch方法
bindInstance(true);

const statePromises: StatePromises = { load: Promise.resolve() };

const windowMessageHandler = async (event: MessageEvent) => {
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
    if (action === messageAction.CONFIG_CHANGE) {
      // injectFeature(payload, statePromises);
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

let timer: NodeJS.Timeout = 0 as unknown as NodeJS.Timeout;

const initConnectState = (isConnected: boolean | null) => {
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

const handleSupOSConnectOnWindowLoad = () => {
  const url = new URL(location.href);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  const isConnected = checkConnect();

  statePromises.load = statePromises.load.then(() =>
    Promise.resolve(isConnected)
  );

  if (isConnected) {
    db.init();
    injectFeature(
      featuresList.map((f) => ({ type: f })),
      statePromises
    );
  }
  bindInstance(isConnected);
  initConnectState(isConnected);
};

window.addEventListener("load", handleSupOSConnectOnWindowLoad);
