import { messageAction, messageType, dbConfig } from "extensions-config";
import { dbClient } from "indexdb";

import nextMessageFlow from "./utils/nextMessageFlow";

import type { MessageData } from "./interface";

const appendDocument = () => {
  const script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", chrome.runtime.getURL("document.js"));
  document.documentElement.appendChild(script);
};

const handleDataCountRequest = async () => {
  const client = dbClient(dbConfig.DB_NAME, dbConfig.DB_VERSION);

  const scriptsRes = await client?.getCount(dbConfig.SCRIPTS_STORE_NAME);
  const servicesRes = await client?.getCount(dbConfig.SERVICE_STORE_NAME);

  const total = scriptsRes.target.result + servicesRes.target.result;

  return {
    response: {
      code: 1,
      total,
    },
  };
};

const handleServiceDataRequest = async (payload: any) => {
  const client = dbClient(dbConfig.DB_NAME, dbConfig.DB_VERSION);

  const { start, end, sourceId } = payload;

  return await client.get(dbConfig.SERVICE_STORE_NAME, (store) => {
    const createAtIndex = store.index("createAtIndex");
    const request = createAtIndex.openCursor(IDBKeyRange.bound(start, end));
    let result: any[] = [];

    return new Promise((resolve, reject) => {
      request.onsuccess = (e) => {
        const cursor = (e?.target as any).result;
        if (cursor) {
          const data = cursor.value;
          if (
            sourceId !== undefined &&
            data.serviceName &&
            !data.serviceName.includes(sourceId) &&
            data.serviceId &&
            !data.serviceId.includes(sourceId)
          ) {
            cursor.continue();
            return;
          }
          result.push(data);
          cursor.continue();
        } else {
          resolve({
            response: {
              code: 1,
              data: result,
            },
          });
        }
      };
      request.onerror = reject;
    });
  });
};

const handleScriptDataRequest = async (payload: any) => {
  const client = dbClient(dbConfig.DB_NAME, dbConfig.DB_VERSION);

  const { start, end, sourceId } = payload;

  return await client.get(dbConfig.SCRIPTS_STORE_NAME, (store) => {
    const createAtIndex = store.index("createAtIndex");
    const request = createAtIndex.openCursor(IDBKeyRange.bound(start, end));
    let result: any[] = [];

    return new Promise((resolve, reject) => {
      request.onsuccess = (e) => {
        const cursor = (e?.target as any).result;
        if (cursor) {
          const data = cursor.value;
          if (
            sourceId !== undefined &&
            data.widgetId &&
            !data.widgetId.includes(sourceId)
          ) {
            cursor.continue();
            return;
          }
          result.push(data);
          cursor.continue();
        } else {
          resolve({
            response: {
              code: 1,
              data: result,
            },
          });
        }
      };
      request.onerror = reject;
    });
  });
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
      console.log(ePayload)
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
