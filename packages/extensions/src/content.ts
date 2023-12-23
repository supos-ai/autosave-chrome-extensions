import { messageAction, messageType, dbConfig } from "extensions-config";
import { Client } from "indexdb";

import nextMessageFlow from "./utils/nextMessageFlow";

import type { MessageData } from "./interface";

const appendDocument = () => {
  const script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", chrome.runtime.getURL("document.js"));
  document.documentElement.appendChild(script);
};

const handleDataCountRequest = async () => {
  const db = new Client(dbConfig.DB_NAME, dbConfig.DB_VERSION);
  const store = await db.collection(dbConfig.SCRIPTS_STORE_NAME);
  // const scriptsRes = (await client?.getCount(
  //   dbConfig.SCRIPTS_STORE_NAME
  // )) as any;
  // const servicesRes = (await client?.getCount(
  //   dbConfig.SERVICE_STORE_NAME
  // )) as any;

  // const total = scriptsRes.target.result + servicesRes.target.result;

  // return {
  //   response: {
  //     code: 1,
  //     total,
  //   },
  // };
};

const handleServiceDataRequest = async (payload: any) => {
  const { start, end, sourceId } = payload;

  const db = new Client(dbConfig.DB_NAME, dbConfig.DB_VERSION);

  const store = await db.collection(dbConfig.SERVICE_STORE_NAME);

  const data = await store.find({
    cursor: {
      index: "createAtIndex",
      bound: [start, end],
    },
    filter: [
      () => !sourceId,
      (data: any) =>
        !!sourceId &&
        ((data.serviceName && data.serviceName.includes(sourceId)) ||
          (data.serviceId && data.serviceId.includes(sourceId))),
    ],
  });
  return {
    response: {
      code: 1,
      data,
    },
  };
};

const handleScriptDataRequest = async (payload: any) => {
  const { start, end, sourceId } = payload;

  const db = new Client(dbConfig.DB_NAME, dbConfig.DB_VERSION);

  const store = await db.collection(dbConfig.SCRIPTS_STORE_NAME);

  const data = await store.find({
    cursor: {
      index: "createAtIndex",
      bound: [start, end],
    },
    filter: [
      () => !sourceId,
      (data: any) =>
        !!sourceId && data.widgetId && data.widgetId.includes(sourceId),
    ],
  });

  return {
    response: {
      code: 1,
      data,
    },
  };
};

// const handleLongMessageConnectToPopup = (payload: {
//   popupTab: chrome.tabs.Tab;
// }) => {
//   const { popupTab } = payload;

//   console.log("content 接收到")

//   chrome.runtime.onConnect.addListener(function(port) {
//     console.assert(port.name);
//     port.onMessage.addListener(function(msg) {

//       console.log(msg,"knockknock");
//       // if (msg.joke === "Knock knock")
//       //   port.postMessage({question: "Who's there?"});
//       // else if (msg.answer === "Madame")
//       //   port.postMessage({question: "Madame who?"});
//       // else if (msg.answer === "Madame... Bovary")
//       //   port.postMessage({question: "I don't get it."});
//     });
//   });
// };

const chromeMessageHandler = async (props: MessageData) => {
  const { type } = props;

  if (type !== messageType.MESSAGE_TYPE) return;

  const { action, payload, from, to } = props;

  let ePayload: any;
  if (to === "content") {
  }

  const messageFlow = nextMessageFlow(props);

  if (messageFlow.to === "document") {
    window.postMessage({
      ...props,
      ...messageFlow,
      payload: {
        ...payload,
        ...ePayload,
      },
    });
  }

  if (messageFlow.to === "service") {
    try {
      chrome.runtime.sendMessage({
        ...props,
        ...messageFlow,
        payload: {
          ...payload,
          ...ePayload,
        },
      });
    } catch (err) {
      console.debug(`[ ${messageFlow.from} =>  ${messageFlow.to}]`, props, err);
    }
  }
};
const windowMessageHandler = async (event: MessageEvent) => {
  // 来自其他窗口的消息忽略
  if (event.source !== window) return;

  if (!event.data) return;

  if (event.data.type !== messageType.MESSAGE_TYPE) return;

  const messageFlow = nextMessageFlow(event.data);

  try {
    await chrome.runtime.sendMessage({
      ...event.data,
      ...messageFlow,
    });
  } catch (err) {
    console.debug(
      `[ ${messageFlow.from} =>  ${messageFlow.to}]`,
      event.data,
      err
    );
  }
};

const popupMessageHandle = (port: chrome.runtime.Port) => {
  port.onMessage.addListener(async (msg) => {
    if (port.name !== messageAction.LONG_CONNECT_TO_POPUP) return;

    const { action, payload } = msg;
    let ePayload: any;
    if (action === messageAction.REQUEST_SERVICE_DATA) {
      ePayload = await handleServiceDataRequest(payload);
    } else if (action === messageAction.REQUEST_SCRIPT_DATA) {
      ePayload = await handleScriptDataRequest(payload);
    }
    port.postMessage({
      ...msg,
      payload: {
        ...payload,
        ...ePayload,
      },
    });
  });
};


appendDocument();
chrome.runtime.onConnect.addListener(popupMessageHandle);
chrome.runtime.onMessage.addListener(chromeMessageHandler);
window.addEventListener("message", windowMessageHandler);
