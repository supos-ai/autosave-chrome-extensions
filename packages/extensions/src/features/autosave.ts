import { StatePromises } from "../interface";
const isDesignPage = () => !!document.querySelector("canvas.editCanvas");

const delay = (time: number = 1000) =>
  new Promise((resolve) => setTimeout(resolve, time));

const save = () => {
  if (typeof (window as any).editor?.save === "function") {
    (window as any).editor.save();
  } else if (typeof (window as any).COMPVIEW.editor.save === "function") {
    (window as any).COMPVIEW.editor.save();
  }
};

let timer: NodeJS.Timeout;
const inject = (
  config: Record<string, any> & {
    checked: boolean;
  }
) => {
  return delay(10 * 1000)
    .then(() => {
      if (!isDesignPage) return;

      const { delay = 5 } = config;

      clearInterval(timer);

      timer = setInterval(save, delay * 1000 * 60);
    })
    .catch(console.warn);
};

const unInject = (
  config: Record<string, any> & {
    checked: boolean;
  }
) => {
  return Promise.resolve().then(() => clearInterval(timer));
};

export { inject, unInject };
