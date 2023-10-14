import {
  CONTENT_TO_DOCUMENT,
  DOCUMENT_TO_CONTENT,
  CONTENT_TO_SERVICE,
  SERVICE_TO_CONTENT,
} from "./utils/messageType";

import { CHECK_CONNECT } from "./utils/actionType";

import type { MessageProps } from "./utils/interface";

const appendDocument = () => {
  const script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", chrome.runtime.getURL("document.js"));
  document.documentElement.appendChild(script);
};

const chromeMessageHandler = (request: MessageProps) => {
  const { actionType, messageType } = request;
  if (actionType === CHECK_CONNECT && messageType === SERVICE_TO_CONTENT) {
    window.postMessage(
      {
        messageType: CONTENT_TO_DOCUMENT,
        actionType: CHECK_CONNECT,
      },
      "*"
    );
  }
};

const reciveConectState = (payload: any) => {
  chrome.runtime.sendMessage({
    messageType: CONTENT_TO_SERVICE,
    actionType: CHECK_CONNECT,
    payload,
  });
};

const windowMessageHandler = (event: MessageEvent) => {
  if (event.source === window && event.data) {
    const { actionType, messageType, payload } = event.data as MessageProps;
    if (actionType === CHECK_CONNECT && messageType === DOCUMENT_TO_CONTENT) {
      reciveConectState(payload);
    }
  }
};

appendDocument();

chrome.runtime.onMessage.addListener(chromeMessageHandler);
window.addEventListener("message", windowMessageHandler);
