import { messageAction, messageType } from "extensions-config";

export interface MessageData {
  type: keyof typeof messageType;
  action: keyof typeof messageAction;
  path: string;
  from: string;
  to: string;
  payload: any;
}

const requestLongMessageConnect = () => {
  chrome.runtime.sendMessage({
    type: messageType.MESSAGE_TYPE,
    action: messageAction.LONG_CONNECT_TO_POPUP,
    path: "popup.service.popup",
    from: "popup",
    to: "service",
  });
};

const establishLongMessageConnect = (
  tabId: number,
  callback: (message: any, port: chrome.runtime.Port) => void
) => {
  const port = chrome.tabs.connect(tabId!, {
    name: messageAction.LONG_CONNECT_TO_POPUP,
  });

  port.onMessage.addListener(callback);
  return port;
};

const receiveMessage = (callback: (payload: any) => void) => {
  chrome.runtime.onMessage.addListener((request: MessageData) => {
    const { type, to } = request;
    if (type !== messageType.MESSAGE_TYPE) return;

    if (to === "popup") {
      callback(request);
    }
  });
};

const requestConnectStatus = () => {
  chrome.runtime.sendMessage({
    type: messageType.MESSAGE_TYPE,
    action: messageAction.CHECK_CONNECT_POPUP,
    path: "popup.service.content.document.content.service.popup",
    from: "popup",
    to: "service",
  });
};

const requestDataCount = () => {
  chrome.runtime.sendMessage({
    type: messageType.MESSAGE_TYPE,
    action: messageAction.REQUEST_DATA_COUNT,
    path: "popup.service.content.service.popup",
    from: "popup",
    to: "service",
  });
};

const requestServiceData = (port: chrome.runtime.Port | void, payload: any) => {
  if (!port) return;

  port.postMessage({
    type: messageType.MESSAGE_TYPE,
    action: messageAction.REQUEST_SERVICE_DATA,
    payload,
  });
};

const requestScriptData = (port: chrome.runtime.Port | void, payload: any) => {
  if (!port) return;

  port.postMessage({
    type: messageType.MESSAGE_TYPE,
    action: messageAction.REQUEST_SCRIPT_DATA,
    payload,
  });
};

const requestConfigChange = (payload:any) => {
  chrome.runtime.sendMessage({
    type: messageType.MESSAGE_TYPE,
    action: messageAction.CONFIG_CHANGE,
    path: "popup.service.content.document",
    from: "popup",
    to: "service",
    payload
  });
}

export {
  receiveMessage,
  requestConnectStatus,
  requestDataCount,
  requestServiceData,
  requestScriptData,
  requestLongMessageConnect,
  establishLongMessageConnect,
  requestConfigChange
};
