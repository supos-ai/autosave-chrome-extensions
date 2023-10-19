import type { Interceptor } from "./interface";

export const originFetch = window.fetch;

export const fetchProxy: {
  _beforeInterceptorQueue: Interceptor[];
  _beforeInterceptor: (interceptor: Interceptor) => void;
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
  return originFetch(...nextArgs)
};

fetchProxy._beforeInterceptorQueue = [];

fetchProxy._beforeInterceptor = (beforeInterceptor) => {
  fetchProxy._beforeInterceptorQueue.push(beforeInterceptor);
};
