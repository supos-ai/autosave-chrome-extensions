export default (): Promise<boolean> => {
  const win = (window as any).top || (window as any);
  const html = document.querySelector("html");
  let timer: number;
  let timer1: NodeJS.Timeout;
  let isConnect: boolean = false;
  const detect = (resolve: (value: boolean | PromiseLike<boolean>) => void) => {
    try {
      isConnect =
        !!win.SUPOS ||
        html!.innerHTML.includes("supOS frontend") ||
        html!.innerHTML.includes("suposTicketForFrontend");
    } catch {}

    if (isConnect) {
      resolve(isConnect);
      clearTimeout(timer1);
      return;
    }
    timer = requestAnimationFrame(() => detect(resolve));
  };

  return new Promise((resolve) => {
    timer1 = setTimeout(
      () => {
        cancelAnimationFrame(timer);
        resolve(isConnect);
      },

      10 * 1000
    );
    detect(resolve);
  });
};
