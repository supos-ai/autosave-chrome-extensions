export const getPageId = () => {
  const url = new URL(location.href);
  const pageId = url.hash.split("/").pop();
  return pageId;
};
export const noop = () => {};
export const encode = (n: string) => Number(n).toString(36);
export const decode = (n: string) => {
  try {
    return parseInt(n, 36);
  } catch {
    return false;
  }
};

export type CheckStatus = {
  unknownInstanceId: boolean;
  unMatchInstanceId: boolean;
};

export const filterUnsafeNode = (nodes: any[], instanceId: string) => {
  return nodes.filter((node) => {
    let checkStatus = {
      unknownInstanceId: false,
      unMatchInstanceId: false,
    };
    if (node.a.renderId === encode("1000000000000000")) {
      checkStatus.unknownInstanceId = true;
    }

    if (node.a.renderId !== encode(instanceId)) {
      checkStatus.unMatchInstanceId = true;
    }
    node.checkStatus = checkStatus;
    return Object.keys(checkStatus).some(
      (k) => checkStatus[k as keyof typeof checkStatus]
    );
  });
};

export const mergePageInfo = (pageInfo: any, layoutInfo: any) => {
  const root = document.querySelector("#root");
  const type = layoutInfo.layoutNodes[0].type; // 2 自由  0 流式

  if (!root) return;
  const { width, height } = pageInfo;

  const clientWidth = root?.clientWidth || 1;
  const clientHeight = root?.clientHeight || 1;

  let dh = 0;
  let dw = 0;
  let radioX = 1;
  let radioY = 1;

  if (type == 2) {
    if (width / height <= clientWidth / clientHeight) {
      radioX = radioY = clientHeight / height;
      dw = (clientWidth - radioX * width) / 2;
    } else {
      radioX = radioY = clientWidth / width;
      dh = (clientHeight - radioX * height) / 2;
    }
  }

  if (type == 0) {
    radioX = clientWidth / width;
    radioY = clientHeight / height;
  }

  return {
    width,
    height,
    clientWidth,
    clientHeight,
    radioX,
    radioY,
    dw,
    dh,
    dx: 0,
    dy: 0,
    type,
  };
};

export const renderUnsafeInformation = (
  nodes: (Record<string, any> & { checkStatus: CheckStatus })[],
  pageInfo: any
) => {
  const nodesMap = new Map();

  const createBox = (node: HTMLElement) => {
    const box = document.createElement("div");
    const style = `${node.getAttribute(
      "style"
    )}border:2px solid red;pointer-events:none;`;
    box.style.cssText = style;

    return box;
  };

  const createLabel = (node: any) => {
    const label = document.createElement("span");
    label.style.cssText =
      "background:rgba(255,0,0,0.7);color:#fff;white-space: nowrap;";
    label.innerHTML = `${node.p.tag || node.p.displayName} / ${
      !node.a.renderId || !decode(node.a.renderId)
        ? "无实例ID"
        : decode(node.a.renderId)
    }`;

    return label;
  };

  const mount = (el: HTMLElement, node: any) => {
    if (!el) return () => {};
    const box = createBox(el);
    const label = createLabel(node);
    box.appendChild(label);

    const ht =
      document.querySelector("#htruntimelayout") ||
      document.querySelector("#appPreviewWrapper canvas")?.parentElement;

    if (ht) ht.appendChild(box);
    return () => box.parentElement?.removeChild(box);
  };

  const pelMount = (el: HTMLElement, node: any) => {
    const { position, width = 1, height = 1 } = node.p;
    if (!position) return () => {};
    const box = document.createElement("div");
    let left;
    let top;
    if (pageInfo.type == 2) {
      left =
        (position.x - width / 2) * pageInfo.radioX + pageInfo.dw + pageInfo.dx;
      top =
        (position.y - height / 2) * pageInfo.radioY + pageInfo.dh + pageInfo.dy;
    }
    if (pageInfo.type == 0) {
      left = (position.x - width / 2) * pageInfo.radioX + pageInfo.dx;
      top = (position.y - height / 2) * pageInfo.radioY + pageInfo.dy;
    }

    box.style.cssText = `position: absolute; width: ${width}px; height: ${height}px; left:${left}px;top:${top}px;border: 2px solid red;`;

    const label = createLabel(node);
    box.appendChild(label);
    const ht =
      document.querySelector("#htruntimelayout") ||
      document.querySelector("#appPreviewWrapper canvas")?.parentElement;

    if (ht) ht.appendChild(box);
    return () => box.parentElement?.removeChild(box);
  };
  nodes.forEach((node) => {
    if (node.checkStatus.unMatchInstanceId) {
      // 图元
      if (node.s) {
        node.mountAutosaveMask = pelMount;
      } else {
        node.mountAutosaveMask = mount;
      }
      node.unMountAutosaveMask = () => {};
      nodesMap.set(node.p.tag || node.p.displayName, node);
    }
  });

  const config = {
    childList: true,
    subtree: true,
    attributes: true,
  };

  const handleEvent = () => {
    const ht =
      document.querySelector("#htruntimelayout") ||
      document.querySelector("#appPreviewWrapper canvas")?.parentElement;

    if (!ht) return;
    if (handleEvent.isInit) return;
    handleEvent.isInit = true;

    const pointer = {
      beginMove: false,
      pageX: 0,
      pageY: 0,
      dx: 0,
      dy: 0,
    };

    const pointermove = (_e: Event) => {
      if (!pointer.beginMove) return;

      const e = _e as PointerEvent;
      pageInfo.dx = pointer.dx + e.pageX - pointer.pageX;
      pageInfo.dy = pointer.dy + e.pageY - pointer.pageY;

      for (const [k, node] of nodesMap.entries()) {
        if (node.s && node.p.displayName) {
          node.unMountAutosaveMask();
          node.unMountAutosaveMask = node.mountAutosaveMask(null, node);
        }
      }
    };

    const pointerup = (_e: Event) => {
      pointer.beginMove = false;
      pointer.pageX = 0;
      pointer.pageY = 0;

      pointer.dx = pageInfo.dx;
      pointer.dy = pageInfo.dy;

      ht.removeEventListener("pointermove", pointermove);
      ht.removeEventListener("pointerup", pointerup);
    };

    const pointerDown = (_e: Event) => {
      const e = _e as PointerEvent;
      pointer.beginMove = true;
      pointer.pageX = e.pageX;
      pointer.pageY = e.pageY;

      ht.addEventListener("pointermove", pointermove);
      ht.addEventListener("pointerup", pointerup);
    };

    ht.addEventListener("pointerdown", pointerDown);
  };

  handleEvent.isInit = false;

  const root = document.querySelector("#root")!;
  const handle: MutationCallback = (mutationsList, observer) => {
    for (let mutation of mutationsList) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "style"
      ) {
        const target = mutation.target as HTMLElement;

        if (
          target.getAttribute("id") &&
          nodesMap.has(target.getAttribute("id"))
        ) {
          handleEvent();
          const node = nodesMap.get(target.getAttribute("id"));
          node.unMountAutosaveMask();
          node.unMountAutosaveMask = node.mountAutosaveMask(target, node);
        }

        if (target.tagName.toLowerCase() === "canvas") {
          handleEvent();

          for (const [k, node] of nodesMap.entries()) {
            if (node.s && node.p.displayName) {
              node.unMountAutosaveMask();
              node.unMountAutosaveMask = node.mountAutosaveMask(target, node);
            }
          }
        }
      }
    }
  };
  const observer = new MutationObserver(handle);

  observer.observe(root, config);
};
