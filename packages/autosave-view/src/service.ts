import { messageAction, messageType } from "extensions-config";

export interface MessageData {
  type: keyof typeof messageType;
  action: keyof typeof messageAction;
  path: string;
  from: string;
  to: string;
  payload: any;
}
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

const requestServiceData = (payload: any) => {
  chrome.runtime.sendMessage({
    type: messageType.MESSAGE_TYPE,
    action: messageAction.REQUEST_SERVICE_DATA,
    path: "popup.service.content.service.popup",
    from: "popup",
    to: "service",
    payload,
  });
};

const requestScriptData = (payload: any) => {
  chrome.runtime.sendMessage({
    type: messageType.MESSAGE_TYPE,
    action: messageAction.REQUEST_SCRIPT_DATA,
    path: "popup.service.content.service.popup",
    from: "popup",
    to: "service",
    payload,
  });
};

export {
  receiveMessage,
  requestConnectStatus,
  requestDataCount,
  requestServiceData,
  requestScriptData,
};
