import { fetchProxy as fetchProxyInter, originFetch } from "./fetchProxy";
import { XHRProxy as XHRProxyInter, originXHR } from "./xhrProxy";
import { suposInterceptor } from "./suposInterceptor";

const fetchProxy = fetchProxyInter as unknown as typeof fetch;
const XHRProxy = XHRProxyInter as unknown as typeof XMLHttpRequest;

fetchProxyInter._beforeInterceptor(suposInterceptor);

XHRProxyInter._beforeInterceptor(suposInterceptor);

export { fetchProxy, originFetch, XHRProxy, originXHR };
