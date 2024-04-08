import { messageAction, messageType } from "extensions-config";

import nextMessageFlow from "./utils/nextMessageFlow";

import type { MessageData } from "./interface";

let popupConfig: {
  popupWindow: chrome.windows.Window | null;
  fromTabId: number | undefined;
} = {
  popupWindow: null,
  fromTabId: -1,
};
const createWindow = async (hash = "") => {
  return await chrome.windows.create({
    url: `app/index.html${hash}`,
    type: "panel",
    width: 1400,
    height: 840,
    top: 100,
    left: 150,
  });
};

const getPopupWindow = () => popupConfig;
const resetPopupWindow = () => {
  popupConfig = {
    popupWindow: null,
    fromTabId: -1,
  };
};

const destroyPopUpWindow = async () => {
  try {
    await chrome.windows.remove(popupConfig.popupWindow?.id!);
  } catch {}
};

const setIconWithConnectStatus = (
  isConnected: boolean | null,
  tabId?: number
) => {
  if (isConnected == null) return;
  if (isConnected) {
    chrome.action.setIcon({ path: "icons/128a.png", tabId });
  } else {
    chrome.action.setIcon({ path: "icons/128.png", tabId });
  }
};

const setIconWithTestMode = (
  payload: { testMode: boolean; approvalMode: boolean },
  tabId?: number
) => {
  if (payload.approvalMode) {
    chrome.action.setIcon({ path: "icons/128g.png", tabId });
  } else if (payload.testMode) {
    chrome.action.setIcon({ path: "icons/128r.png", tabId });
  } else {
    chrome.action.setIcon({ path: "icons/128a.png", tabId });
  }
};

const handlerChromeMessage = async (
  props: MessageData,
  sender: chrome.runtime.MessageSender
) => {
  const { type } = props;
  if (type !== messageType.MESSAGE_TYPE) return;

  const { action, payload, from, to } = props;

  let ePayload: any;
  if (to === "service") {
    if (action === messageAction.CHECK_CONNECT_ACTION) {
      setIconWithConnectStatus(payload.isConnected, sender.tab?.id);
    } else if (action === messageAction.LONG_CONNECT_TO_POPUP) {
      const { fromTabId } = getPopupWindow();
      ePayload = {
        fromTabId,
      };
    } else if (action == messageAction.CONFIG_CHANGE) {
      await chrome.storage.local.set({ [payload.type]: payload.config });
    } else if (action === messageAction.CHECK_TEST_MODE) {
      setTimeout(() => setIconWithTestMode(payload, sender.tab?.id), 200);
    } else if (action === messageAction.POPUP_HELPER) {
      onPopupAction(payload.type);
    }
  }

  const messageFlow = nextMessageFlow(props);

  if (messageFlow.to === "content") {
    const { fromTabId, popupWindow } = getPopupWindow();

    if (popupWindow === null) return;
    try {
      await chrome.tabs.sendMessage(fromTabId!, {
        ...props,
        ...messageFlow,
        payload: {
          ...payload,
          ...ePayload,
        },
      });
    } catch (err) {
      console.debug(`[ ${messageFlow.from} =>  ${messageFlow.to}]`, err);
    }
  }

  if (messageFlow.to === "popup") {
    try {
      await chrome.runtime.sendMessage({
        ...props,
        ...messageFlow,
        payload: {
          ...payload,
          ...ePayload,
        },
      });
    } catch (err) {
      console.debug(`[ ${messageFlow.from} =>  ${messageFlow.to}]`, err);
    }
  }
};

const handlerOnActionClick = async () => {
  /**
   * 获取点击时当前窗口的 activeTab
   *
   * 使插件和窗口绑定
   */
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];

  if (currentTab) {
    popupConfig.fromTabId = currentTab.id;
  }
  if (popupConfig.popupWindow) {
    destroyPopUpWindow();
  }
  const popupWindow = await createWindow();

  popupConfig.popupWindow = popupWindow;

  // const popupTabs = popupWindow.tabs;
  // const popupTab = popupTabs?.[0];

  // createPopupMessageConnect(currentTab,popupTab);
};

const onPopupAction = async (type: string) => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];

  if (currentTab) {
    popupConfig.fromTabId = currentTab.id;
  }
  if (popupConfig.popupWindow) {
    destroyPopUpWindow();
  }
  const popupWindow = await createWindow(`#/${type}/`);

  popupConfig.popupWindow = popupWindow;
};

// chrome.runtime.onInstalled.addListener(() => {
//   chrome.tabs.create({
//     url: "app/guide.html",
//   });
// });

const handlerOnTabRemove = (
  tabId: number,
  removeInfo: chrome.tabs.TabRemoveInfo
) => {
  const { fromTabId } = getPopupWindow();

  if (fromTabId === tabId) {
    destroyPopUpWindow();
    resetPopupWindow();
  }

  if (popupConfig.popupWindow?.id === tabId) {
    resetPopupWindow();
  }
};
chrome.tabs.onRemoved.addListener(handlerOnTabRemove);
//   chrome.tabs.onActivated.addListener(handlerOnTabActivated);
chrome.runtime.onMessage.addListener(handlerChromeMessage);
chrome.action.onClicked.addListener(handlerOnActionClick);
