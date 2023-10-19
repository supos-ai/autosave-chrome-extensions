export default () => {
  try {
    const win = (window as any).top || (window as any);
    return win.SUPOS !== undefined && win.SUPOS !== null;
  } catch {
    return false;
  }
};
