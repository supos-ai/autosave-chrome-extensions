import { useCallback, useEffect, useRef, memo, useState } from "react";
import { ResizeProps } from "./Splitter";

type DividerProps = {
  index: number;
  onResize?: (pos: ResizeProps) => void;
  prefixCls?: string;
  direction?: "vertical" | "horizontal";
};

const Divider: React.FC<DividerProps> = (props) => {
  const canResize = useRef(false);
  const { index, onResize, direction, prefixCls } = props;

  const posRef = useRef({
    left: 0,
    top: 0,
    x: 0,
    y: 0,
  });

  const dividerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      canResize.current = true;

      posRef.current = {
        left: dividerRef.current!.offsetLeft,
        top: dividerRef.current!.offsetTop,
        x: e.pageX,
        y: e.pageY,
      };
      // document.addEventListener("pointermove", onPointerMove);
      // document.addEventListener("pointerup", onPointerup);
    };
    const onPointerMove = (e: MouseEvent) => {
      if (!canResize.current) return;

      onResize &&
        onResize({
          left: posRef.current.left + (e.pageX - posRef.current.x),
          top: posRef.current.top + (e.pageY - posRef.current.y),
          index,
        });
    };

    const onPointerup = () => {
      canResize.current = false;

      posRef.current = {
        left: 0,
        top: 0,
        x: 0,
        y: 0,
      };

      // document.removeEventListener("pointermove", onPointerMove);
      // document.removeEventListener("pointerup", onPointerup);
    };

    dividerRef.current?.addEventListener("mousedown", onPointerDown);
    document.addEventListener("mousemove", onPointerMove);
    document.addEventListener("mouseup", onPointerup);
    window.addEventListener("blur", onPointerup);
  }, [dividerRef, canResize, index, onResize]);

  return (
    <div
      className={[
        `${prefixCls}-splitter-divider`,
        `${prefixCls}-splitter-divider-${direction}`,
      ].join(" ")}
      ref={dividerRef}
      // onPointerDown={onPointerDown}
    >
      <div className="divider-line" />
    </div>
  );
};

export default memo(Divider);
