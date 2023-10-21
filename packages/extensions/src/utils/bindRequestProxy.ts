import { fetchProxy, originFetch, XHRProxy, originXHR } from "./proxy/index";

const bindInstance = (isConnected: boolean | null) => {
  if (isConnected === null) return;
  if (isConnected) {
    window.fetch = fetchProxy;
    window.XMLHttpRequest = XHRProxy as typeof XMLHttpRequest;
  } else {
    window.fetch = originFetch;
    window.XMLHttpRequest = originXHR as typeof XMLHttpRequest;
  }
};

export default bindInstance;
