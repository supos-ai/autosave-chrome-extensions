import { messageAction, messageType } from "extensions-config";
import { MessageData } from "../interface";

import {
  inject as autosaveInject,
  unInject as unInjectAutosave,
} from "./autosave";

import {
  inject as expandMenuInject,
  unInject as expandMenuUnInject,
} from "./expandMenu";

import {
  inject as examModeInject,
  unInject as examModeUnInject,
} from "./examMode";

const featuresList = ["autosave", "expandMenu", "examMode"] as const;

export type Payload<T> = {
  type: T;
  config?: Record<string, any> & { checked: boolean };
};

type InjectFunction = (
  payloads: Record<string, any> & {
    checked: boolean;
  }
) => Promise<any>;

const featuresMap: Record<(typeof featuresList)[number], InjectFunction[]> = {
  autosave: [autosaveInject, unInjectAutosave],
  expandMenu: [expandMenuInject, expandMenuUnInject],
  examMode: [examModeInject, examModeUnInject],
};

const injectFeature = (
  payloads: Payload<(typeof featuresList)[number]>[] = []
) => {
  // 请求storage中的配置项

  if (payloads.every((payload) => !payload.config)) {
    const handle = (event: MessageEvent) => {
      if (event.source !== window) return;

      if (!event.data) return;

      if (event.data.type !== messageType.MESSAGE_TYPE) return;

      const { to, action, payload: storage } = event.data as MessageData;

      if (
        to === "document" &&
        action === messageAction.REQUEST_CONFIG_STORAGE
      ) {
        payloads.forEach((payload) => {
          const { type } = payload;
          const config = storage[type];
          if (!config) return;

          const { checked } = config;
          (checked ? featuresMap[type][0] : featuresMap[type][1])(config);
        });

        window.removeEventListener("message", handle);
      }
    };

    window.addEventListener("message", handle);

    window.postMessage({
      type: messageType.MESSAGE_TYPE,
      action: messageAction.REQUEST_CONFIG_STORAGE,
      path: "document.content.document",
      from: "document",
      to: "content",
      payload: payloads.map(({ type }) => type),
    });
  } else {
    payloads.forEach((payload) => {
      const { config, type } = payload;

      if (!config) return;

      const { checked } = config;

      (checked ? featuresMap[type][0] : featuresMap[type][1])(config);
    });
  }
};

export { injectFeature, featuresList };
