import type { MessageFlow } from "../interface";

export default (messageFlow: MessageFlow): MessageFlow => {
  const { path, from, to } = messageFlow;
  const nextPathStr = path.split(`${from}.${to}`).slice(-1)[0];
  const next = nextPathStr.split(".").filter(Boolean)[0];

  return {
    path,
    from: to,
    to: next,
  };
};
