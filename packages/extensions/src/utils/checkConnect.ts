export default () => {
  try {
    const win = (window as any).top || (window as any);
    const html = document.querySelector("html");
    return (
      win.SUPOS &&
      html!.innerHTML.includes("supOS frontend") &&
      html!.innerHTML.includes("suposTicketForFrontend")
    );
  } catch {
    return null;
  }
};
