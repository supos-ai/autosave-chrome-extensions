import { fetchProxy, originFetch, XHRProxy, originXHR, initDB } from "proxy";

import { DOCUMENT_TO_CONTENT, CONTENT_TO_DOCUMENT } from "./utils/messageType";

import { CHECK_CONNECT } from "./utils/actionType";

import type { MessageProps } from "./utils/interface";

//  初始化数据ku

initDB();

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

const checkSuposConnect = () => {
  const win = (window as any).top || (window as any);
  return win.SUPOS !== undefined && win.SUPOS !== null;
};

const handleSuposConnect = () => {
  const isConnected = checkSuposConnect();

  bindInstance(isConnected);

  window.postMessage(
    {
      messageType: DOCUMENT_TO_CONTENT,
      actionType: CHECK_CONNECT,
      payload: {
        isConnected,
      },
    },
    "*"
  );
};
const windowMessageHandler = (event: MessageEvent) => {
  if (event.source === window && event.data) {
    const { actionType, messageType } = event.data as MessageProps;
    if (actionType === CHECK_CONNECT && messageType === CONTENT_TO_DOCUMENT) {
      handleSuposConnect();
    }
  }
};

window.addEventListener("message", windowMessageHandler);
