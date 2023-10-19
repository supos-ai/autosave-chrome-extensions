import type { Interceptor } from "./interface";

export const originXHR = window.XMLHttpRequest;

export class XHRProxy extends XMLHttpRequest {
  method: string = "GET";
  url: string | URL = "";

  body: Document | XMLHttpRequestBodyInit | null = null;

  static _beforeInterceptorQueue: Interceptor[] = [];

  constructor() {
    super();
    this.rewriteOpen();
    this.rewriteSend();
  }

  rewriteOpen() {
    const { open } = this;

    this.open = (
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null
    ) => {
      this.method = method;
      this.url = url;

      open.call(
        this,
        method,
        url,
        async !== undefined ? async : true,
        username,
        password
      );
    };
  }

  rewriteSend() {
    const { send } = this;
    this.send = (body?: Document | XMLHttpRequestBodyInit | null) => {
      if (body) {
        this.body = body;
      }

      let init: RequestInit = {
        body: body as unknown as BodyInit | null,
        method: this.method,
      };

      let nextArgs = [this.url, init] as Parameters<typeof fetch>;

      if (
        XHRProxy._beforeInterceptorQueue &&
        XHRProxy._beforeInterceptorQueue.length
      ) {
        for (let interceptor of XHRProxy._beforeInterceptorQueue) {
          nextArgs = interceptor(...nextArgs);
        }
      }

      send.call(this, body);
    };
  }

  static _beforeInterceptor = (beforeInterceptor: Interceptor) => {
    XHRProxy._beforeInterceptorQueue.push(beforeInterceptor);
  };
}
