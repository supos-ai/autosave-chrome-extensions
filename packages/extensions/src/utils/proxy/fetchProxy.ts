import type { BeforeInterceptor,AfterInterceptor } from "./interface";

export const originFetch = window.fetch;

export const fetchProxy: {
  _beforeInterceptorQueue: BeforeInterceptor[];
  _beforeInterceptor: (interceptor: BeforeInterceptor) => void;
  _afterInterceptorQueue: AfterInterceptor[];
  _afterInterceptor: (interceptor: AfterInterceptor) => void;
} = async (...args: Parameters<typeof fetch>): Promise<Response> => {
  let nextArgs = args;
  if (
    fetchProxy._beforeInterceptorQueue &&
    fetchProxy._beforeInterceptorQueue.length
  ) {
    for (let interceptor of fetchProxy._beforeInterceptorQueue) {
      nextArgs = interceptor(...nextArgs);
    }
  }

  let response = await originFetch(...nextArgs);

  if (
    fetchProxy._afterInterceptorQueue &&
    fetchProxy._afterInterceptorQueue.length
  ) {
    for (let interceptor of fetchProxy._afterInterceptorQueue) {
      response = interceptor(response);
    }
  }

  return response;
};

fetchProxy._beforeInterceptorQueue = [];

fetchProxy._beforeInterceptor = (beforeInterceptor) => {
  fetchProxy._beforeInterceptorQueue.push(beforeInterceptor);
};


fetchProxy._afterInterceptorQueue = [];

fetchProxy._afterInterceptor = (afterInterceptor) => {
  fetchProxy._afterInterceptorQueue.push(afterInterceptor);
};
