import { messageAction, messageType } from "extensions-config";

import nextMessageFlow from "../utils/nextMessageFlow";

let popupConfig: {
  popupWindow: chrome.windows.Window | null;
  fromTabId: number | undefined;
} = {
  popupWindow: null,
  fromTabId: -1,
};
const createWindow = async () => {
  return await chrome.windows.create({
    url: "app/index.html",
    type: "panel",
    width: 1400,
    height: 840,
    top: 100,
    left: 150,
  });
};
const createPopupWindow = async (currentTab: chrome.tabs.Tab) => {
  if (currentTab) {
    popupConfig.fromTabId = currentTab.id;
  }
  if (popupConfig.popupWindow) {
    destroyPopUpWindow();
  }
  popupConfig.popupWindow = await createWindow();
};

const getPopupWindow = () => popupConfig;

const destroyPopUpWindow = () => {
  chrome.windows.remove(popupConfig.popupWindow?.id!);
};

import type { MessageData } from "../interface";

const setIconWithConnectStatus = (isConnected: boolean, tabId?: number) => {
  if (isConnected) {
    chrome.action.setIcon({ path: "icons/128a.png", tabId });
  } else {
    chrome.action.setIcon({ path: "icons/128.png", tabId });
  }
};

const handlerChromeMessage = async (
  props: MessageData,
  sender: chrome.runtime.MessageSender
) => {
  const { type } = props;

  if (type !== messageType.MESSAGE_TYPE) return;

  const { action, payload, from, to } = props;

  if (to === "service") {
    if (action === messageAction.CHECK_CONNECT_ACTION) {
      setIconWithConnectStatus(payload.isConnected, sender.tab?.id);
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
      });
    } catch (err) {
      console.error(`[ ${messageFlow.from} =>  ${messageFlow.to}]`, err);
    }
  }

  if (messageFlow.to === "popup") {
    chrome.runtime.sendMessage({
      ...props,
      ...messageFlow,
    });
  }

  /**
   * CHECK_CONNECT
   * 1.修改 icon
   * 2.通知 popup 连接状态以及 host 等信息
   *
   * 想要知道消息从哪个 tabId 发送过来的，可以使用 sender.tab.id
   */
  // if (
  //   chromeActionType === actionType.CHECK_CONNECT &&
  //   chromeMessageType === messageType.CONTENT_TO_SERVICE
  // ) {
  //   setIconWithConnectStatus(payload.isConnected, sender.tab?.id);
  // }

  // if (
  //   chromeActionType === actionType.CHECK_CONNECT_POPUP &&
  //   chromeMessageType === messageType.CONTENT_TO_SERVICE
  // ) {
  //   const { popupWindow } = getPopupWindow();
  //   noticeConnectStatusToPopup(popupWindow, payload);
  // }

  // if (
  //   chromeActionType === actionType.REQUEST_DATA_COUNT &&
  //   chromeMessageType === messageType.CONTENT_TO_SERVICE
  // ) {
  //   const { popupWindow } = getPopupWindow();
  //   noticeTotalCountToPopup(popupWindow, payload);
  // }

  // /**
  //  * popup => service => content => document => content => service => popup
  //  */
  // if (
  //   chromeActionType === actionType.CHECK_CONNECT_POPUP &&
  //   chromeMessageType === messageType.POPUP_TO_SERVICE
  // ) {
  //   const { fromTabId } = getPopupWindow();

  //   requestPopUpConnect(fromTabId!);
  // }

  // if (
  //   chromeActionType === actionType.REQUEST_DATA_COUNT &&
  //   chromeMessageType === messageType.POPUP_TO_SERVICE
  // ) {
  //   const { fromTabId } = getPopupWindow();

  //   requestDataCount(fromTabId!);
  // }
};

// const handlerOnTabActivated = async (activeInfo: chrome.tabs.TabActiveInfo) => {
//   const tabId = activeInfo.tabId;

//   // Send a message to the content script of the activated tab
//   const activeTab = await chrome.tabs.get(tabId);

//   console.log(activeTab, "activeTab");
//   if (
//     !activeTab.url?.startsWith("http") &&
//     !activeTab.url?.startsWith("https") &&
//     !activeTab.pendingUrl?.startsWith("http") &&
//     !activeTab.pendingUrl?.startsWith("https")
//   ) {
//     setIconWithConnectStatus(false);
//     return;
//   }

//   requestSupOSConnect(tabId);
// };

const handlerOnActionClick = async () => {
  /**
   * 获取点击时当前窗口的 activeTab
   *
   * 使插件和窗口绑定
   */
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];

  createPopupWindow(currentTab);
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.create({
    url: "app/guide.html",
  });
});

const handlerOnTabRemove = (
  tabId: number,
  removeInfo: chrome.tabs.TabRemoveInfo
) => {
  const { fromTabId } = getPopupWindow();

  if (fromTabId === tabId) {
    destroyPopUpWindow();

    popupConfig = {
      popupWindow: null,
      fromTabId: -1,
    };
  }
};
export default () => {
  chrome.tabs.onRemoved.addListener(handlerOnTabRemove);
  // chrome.tabs.onActivated.addListener(handlerOnTabActivated);
  chrome.runtime.onMessage.addListener(handlerChromeMessage);
  chrome.action.onClicked.addListener(handlerOnActionClick);
};
