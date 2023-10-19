/**
 * 不需要主动去检测supOS 网站， 在 document 监听 onload 事件，由 document.js 主动发送消息给 service_worker
 */

// const checkConnectOnInit = (timeout: number = 1000) => {
//   let timer: { current: NodeJS.Timeout } = {
//     current: 0 as unknown as NodeJS.Timeout,
//   };
//   let current = Date.now();

//   const clearTimer = () => {
//     clearInterval(timer.current);
//   };

//   timer.current = setInterval(async () => {
//     if (Date.now() - current >= 20 * 1000) {
//       clearTimer();
//       return;
//     }
//     const tabs = await chrome.tabs.query({
//       active: true,
//       currentWindow: true,
//     });
//     if (tabs.length > 0) {
//       const currentTab = tabs[0];
//       try {
//         await chrome.tabs.sendMessage(currentTab.id!, {
//           messageType: SERVICE_TO_CONTENT,
//           actionType: CHECK_CONNECT,
//         });
//       } catch {
//         chrome.action.setIcon({ path: "icons/128.png" });
//       }
//     }
//   }, timeout);

//   return clearTimer;
// };
// let clearTimer: VoidFunction;

// chrome.webNavigation.onDOMContentLoaded.addListener(
//   function (details) {
//     if (details.frameId === 0) {
//       clearTimer = checkConnectOnInit();
//     }
//   },
//   { url: [{ schemes: ["http", "https"] }] }
// );

// chrome.runtime.onInstalled.addListener(() => {
//   chrome.tabs.create({
//     url: "views/guide.html",
//   });
// });
