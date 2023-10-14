import actionNames from "./actionNames";

import { cid } from "./utils";

export interface ScriptsDataProps {
  action: string;
  actionName: string;
  script: string;
  widgetName: string;
  widgetId: string;
  id: string;
  createAt: number;
}

const scriptsParse = async (
  payload: RequestInit | undefined
): Promise<ScriptsDataProps[]> => {
  const dataQueue: ScriptsDataProps[] = [];

  if (payload === undefined || payload.body===undefined) return dataQueue;

  const { body } = payload;

  const contextWrapper = JSON.parse(body as string);
  const contextData = JSON.parse(contextWrapper.context);

  // 画布事件
  const { a, d } = contextData.context.jsonData;

  if (a.actions && a.actions.length) {
    a.actions.forEach(
      ({ action, script }: { action: string; script: string }) => {
        dataQueue.push({
          action,
          actionName: !action
            ? "未选择交互事件"
            : actionNames[action as keyof typeof actionNames],
          script,
          widgetName: "layout",
          widgetId: a.layoutIndex,
          id: cid(),
          createAt: Date.now(),
        });
      }
    );
  }

  // 页面元素

  if (d && d.length) {
    for (let node of d) {
      const widgetName = node?.a?.widgetName;
      const id = node?.p?.tag;

      const actions = node?.a?.configs?.config?.actions;

      if (actions && actions.length) {
        actions.forEach(
          ({ action, script }: { action: string; script: string }) => {
            dataQueue.push({
              action,
              actionName: !action
                ? "未选择交互事件"
                : actionNames[action as keyof typeof actionNames],
              script,
              widgetName,
              widgetId: id,
              id: cid(),
              createAt: Date.now(),
            });
          }
        );
      }

      if (widgetName === "CustomComp") {
        const { sourcePath } = node?.a?.resource;

        if (sourcePath) {
          try {
            const script = await fetch(sourcePath).then((res) => res.text());
            dataQueue.push({
              action: "",
              actionName: "",
              script,
              widgetName,
              widgetId: id,
              id: cid(),
              createAt: Date.now(),
            });
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
  }

  return dataQueue;
};

export default scriptsParse;
