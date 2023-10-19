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
  const store = db.collection(dbConfig.SCRIPTS_STORE_NAME);
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

  const store = db.collection(dbConfig.SERVICE_STORE_NAME);

  const data = await store.find({
    cursor: {
      index: "createAtIndex",
      bound: [start, end],
    },
    filter: [
      () => !sourceId,
      (data: any) =>
        !!sourceId &&
        data.serviceName &&
        data.serviceName.includes(sourceId) &&
        data.serviceId &&
        data.serviceId.includes(sourceId),
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

  const store = db.collection(dbConfig.SCRIPTS_STORE_NAME);

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

const chromeMessageHandler = async (props: MessageData) => {
  const { type } = props;

  if (type !== messageType.MESSAGE_TYPE) return;

  const { action, payload, from, to } = props;

  let ePayload: any;
  if (to === "content") {
    if (action === messageAction.REQUEST_DATA_COUNT) {
      ePayload = await handleDataCountRequest();
    } else if (action === messageAction.REQUEST_SERVICE_DATA) {
      ePayload = await handleServiceDataRequest(payload);
    } else if (action === messageAction.REQUEST_SCRIPT_DATA) {
      ePayload = await handleScriptDataRequest(payload);
    }
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
    chrome.runtime.sendMessage({
      ...props,
      ...messageFlow,
      payload: {
        ...payload,
        ...ePayload,
      },
    });
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

appendDocument();

chrome.runtime.onMessage.addListener(chromeMessageHandler);
window.addEventListener("message", windowMessageHandler);
