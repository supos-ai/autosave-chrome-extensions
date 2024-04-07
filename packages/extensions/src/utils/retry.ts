const retry =
  <T extends (...args: any[]) => any>(handle: T, times = 3) =>
  (...args: any[]): ReturnType<T> =>
    handle(...args).catch((err: any) =>
      !times ? Promise.reject(err) : retry(handle)(...args)
    );

export default retry;
