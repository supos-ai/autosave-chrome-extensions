import { dbClient } from "indexdb";
import interceptorList from "./interceptorList";

import scriptsParse from "./scriptsParse";
import serviceParse from "./serviceParse";
import * as config from "./config";

import type { ScriptsDataProps } from "./scriptsParse";
import type { ServiceDataProps } from "./serviceParse";

export const propsHandler = (...args: Parameters<typeof fetch>) => {
  const [input, init] = args;
  let url = "";

  if (typeof input === "string") {
    url = input;
  }
  if (input instanceof URL) {
    url = input.href;
  }
  for (let i = 0; i < interceptorList.length; i++) {
    const { type, reg, method } = interceptorList[i];

    if (url.match(reg) && method.includes(init?.method?.toUpperCase() as any)) {
      return {
        type,
        payload: init,
      };
    }
  }
};

const client = dbClient(config.DB_NAME, config.DB_VERSION);

const saveScripts = (dataQueue: ScriptsDataProps[]) => {
  dataQueue.forEach(async (data) => {
    try {
      await client.add(config.SCRIPTS_STORE_NAME, data);
    } catch (err) {
      console.error(err);
    }
  });
};
const saveService = (dataQueue: ServiceDataProps[]) => {
  dataQueue.forEach(async (data) => {
    try {
      await client.add(config.SERVICE_STORE_NAME, data);
    } catch (err) {
      console.debug(err);
    }
  });
};

const handleContent = async ({
  type,
  payload,
}: {
  type: "service" | "layout";
  payload: RequestInit | undefined;
}) => {
  if (type === "layout") {
    const dataQueue = await scriptsParse(payload);

    saveScripts(dataQueue);
  }

  if (type === "service") {
    const dataQueue = serviceParse(payload);
    console.log(dataQueue);
    saveService(dataQueue);
  }
};

export const suposInterceptor = (...args: Parameters<typeof fetch>) => {
  const requestProps = propsHandler(...args);
  if (requestProps !== undefined) {
    handleContent(requestProps);
  }

  return args;
};
