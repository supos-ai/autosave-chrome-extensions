import { messageAction, messageType } from "extensions-config";

/**
 * 如果传入 tabId，会指定当前 tab 页的图标， 其他页面图标不会跟随一起改变
 * @param isConnected
 * @param tabId
 */
const setIconWithConnectStatus = (isConnected: boolean, tabId?: number) => {
  if (isConnected) {
    chrome.action.setIcon({ path: "icons/128a.png", tabId });
  } else {
    chrome.action.setIcon({ path: "icons/128.png", tabId });
  }
};
const noticeConnectStatusToPopup = async (
  popupWindow: chrome.windows.Window | null,
  payload: any
) => {
  if (popupWindow === null) return;
  const activeTab = popupWindow.tabs?.[0];
  if (activeTab === undefined) return;

  try {
    await chrome.runtime.sendMessage({
      messageType: messageType.SERVICE_TO_POPUP,
      actionType: messageAction.CHECK_CONNECT_POPUP,
      payload,
    });
  } catch (err) {
    console.error("[ noticeConnectStatusToPopup ]", err);
  }
};

const noticeTotalCountToPopup = async (
  popupWindow: chrome.windows.Window | null,
  payload: any
) => {
  if (popupWindow === null) return;
  const activeTab = popupWindow.tabs?.[0];
  if (activeTab === undefined) return;

  try {
    await chrome.tabs.sendMessage(activeTab.id!, {
      messageType: messageType.SERVICE_TO_POPUP,
      actionType: messageAction.REQUEST_DATA_COUNT,
      payload,
    });
  } catch (err) {
    console.error("[ noticeTotalCountToPopup ]", err);
  }
};

const requestSupOSConnect = async (tabId: number) => {
  try {
    await chrome.tabs.sendMessage(tabId, {
      messageType: messageType.SERVICE_TO_CONTENT,
      actionType: messageAction.CHECK_CONNECT,
    });
  } catch (err) {
    console.log(err);
  }
};

const requestPopUpConnect = async (tabId: number) => {
  try {
    await chrome.tabs.sendMessage(tabId, {
      messageType: messageType.SERVICE_TO_CONTENT,
      actionType: messageAction.CHECK_CONNECT_POPUP,
    });
  } catch (err) {
    console.log(err);
  }
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

let popupConfig: {
  popupWindow: chrome.windows.Window | null;
  fromTabId: number | undefined;
} = {
  popupWindow: null,
  fromTabId: -1,
};

const createPopupWindow = async (currentTab: chrome.tabs.Tab) => {
  let innerPopupWindow = null;
  if (popupConfig.popupWindow === null) {
    innerPopupWindow = await createWindow();
  } else {
    await new Promise((resolve) => {
      chrome.windows.getAll(async (windows) => {
        if (
          windows.some(({ id: wid }) => wid === popupConfig.popupWindow?.id)
        ) {
          await chrome.windows.update(popupConfig.popupWindow?.id!, {
            focused: true,
          });
        } else {
          innerPopupWindow = await createWindow();
        }
        resolve(true);
      });
    });
  }

  popupConfig = {
    popupWindow: innerPopupWindow,
    fromTabId: currentTab.id,
  };
};

const getPopupWindow = () => popupConfig;

const destroyPopUpWindow = () => {
  chrome.windows.remove(popupConfig.popupWindow?.id!);
};

const requestDataCount = async (tabId: number) => {
  await chrome.tabs.sendMessage(tabId, {
    messageType: messageType.SERVICE_TO_CONTENT,
    actionType: messageAction.REQUEST_DATA_COUNT,
  });
};

export {
  setIconWithConnectStatus,
  noticeConnectStatusToPopup,
  requestPopUpConnect,
  requestSupOSConnect,
  createPopupWindow,
  getPopupWindow,
  destroyPopUpWindow,
  requestDataCount,
  noticeTotalCountToPopup,
};
