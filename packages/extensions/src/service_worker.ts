import { CONTENT_TO_SERVICE, SERVICE_TO_CONTENT } from "./utils/messageType";
import { CHECK_CONNECT } from "./utils/actionType";

import type { MessageProps } from "./utils/interface";

const checkConnectOnInit = (timeout: number = 1000) => {
  let timer: { current: NodeJS.Timeout } = {
    current: 0 as unknown as NodeJS.Timeout,
  };
  let current = Date.now();

  const clearTimer = () => {
    clearInterval(timer.current);
  };

  timer.current = setInterval(async () => {
    if (Date.now() - current >= 20 * 1000) {
      clearTimer();
      return;
    }
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tabs.length > 0) {
      const currentTab = tabs[0];
      try {
        await chrome.tabs.sendMessage(currentTab.id!, {
          messageType: SERVICE_TO_CONTENT,
          actionType: CHECK_CONNECT,
        });
      } catch {
        chrome.action.setIcon({ path: "icons/128.png" });
      }
    }
  }, timeout);

  return clearTimer;
};
let clearTimer: VoidFunction;

chrome.webNavigation.onDOMContentLoaded.addListener(
  function (details) {
    if (details.frameId === 0) {
      clearTimer = checkConnectOnInit();
    }
  },
  { url: [{ schemes: ["http", "https"] }] }
);

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.create({
    url: "views/guide.html",
  });
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tabId = activeInfo.tabId;
  // Send a message to the content script of the activated tab
  const activeTab = await chrome.tabs.get(tabId);

  if (
    !activeTab.url?.startsWith("http") &&
    !activeTab.url?.startsWith("https")
  ) {
    chrome.action.setIcon({ path: "icons/128.png" });
    return;
  }
  try {
    await chrome.tabs.sendMessage(tabId, {
      messageType: SERVICE_TO_CONTENT,
      actionType: CHECK_CONNECT,
    });
  } catch {
    chrome.action.setIcon({ path: "icons/128.png" });
  }
});

const handleReciveConnectState = (payload: any) => {
  const { isConnected } = payload;
  if (isConnected) {
    clearTimer && clearTimer();
    chrome.action.setIcon({ path: "icons/128a.png" });
  } else {
    chrome.action.setIcon({ path: "icons/128.png" });
  }
};

const chromeMessageHandler = (props: MessageProps) => {
  const { actionType, messageType, payload } = props;
  if (actionType === CHECK_CONNECT && messageType === CONTENT_TO_SERVICE) {
    handleReciveConnectState(payload);
  }
};

chrome.runtime.onMessage.addListener(chromeMessageHandler);
