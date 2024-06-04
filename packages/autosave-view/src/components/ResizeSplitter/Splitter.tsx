import React, {
  useRef,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import ContextProvider, { ContextValues } from "./context";
import Divider from "./Divider";

import "./index.css";

type ResizeSplitterProps = ContextValues & {
  children?: React.ReactNode;
  className?: string;
  min?: number;
};

export type ResizeProps = {
  left: number;
  top: number;
  index: number;
};

const ResizeSplitter: React.FC<ResizeSplitterProps> = (props) => {
  const {
    prefixCls = "autosave",
    direction: thatDirection = "horizontal",
    className,
    children: thatChildren,
    min = 10,
  } = props;

  const [panelsGrow, setPanelsGrow] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  
  const direction =
    thatDirection !== "horizontal" && thatDirection !== "vertical"
      ? "horizontal"
      : thatDirection;

  let children: React.ReactElement[] = useMemo(() => {
    return React.Children.toArray(thatChildren).filter((child, i) => {
      return (
        React.isValidElement(child) &&
        (child.type as any).__AUTOSAVE_SPLITTER_PANEL__
      );
    }) as React.ReactElement[];
  }, [thatChildren]);

  useEffect(() => {
    setPanelsGrow(new Array(children.length).fill(1));
  }, [children.length]);

  const onResize = useCallback(
    (props: ResizeProps) => {
      const { left, top, index } = props;
      let axisWidth = 0;
      let dividerOffsetSize = 0
      

      if (direction === "horizontal") {
        axisWidth = containerRef.current!.scrollWidth;
        dividerOffsetSize = left;
      } else {
        axisWidth = containerRef.current!.scrollHeight;
        dividerOffsetSize = top;

      }


      setPanelsGrow((grows) => {
        const totalWeight = grows.reduce((sum, w) => (sum += w), 0);
        const weightSize = grows.map(
          (grow) => axisWidth * (grow / totalWeight)
        );
        const dividerBehindSize = weightSize
          .slice(0, index + 1)
          .reduce((sum, w) => (sum += w), 0);

        const dx = dividerOffsetSize - dividerBehindSize;
        if (
          weightSize[index] + dx <= min ||
          weightSize[index + 1] + -dx <= min
        ) {
          return grows;
        }

        weightSize[index] += dx;
        weightSize[index + 1] += -dx;

        const max = Math.max.apply(this, weightSize);
        const newGrows = weightSize.map((s) => s / max);

        return newGrows;
      });
    },
    [setPanelsGrow, direction, min]
  );

  let renderChildren: React.ReactElement[] = [];

  React.Children.forEach(children, (child, index) => {
    const flex = {
      grow: panelsGrow[index],
      shrink: 1,
      basis: 0,
    };
    if (index !== children.length - 1) {
      renderChildren = renderChildren.concat([
        <child.type
          {...child.props}
          flex={flex}
          key={`splitter-panel-${index}`}
        />,
        <Divider
          key={`splitter-divider-${index}`}
          index={index}
          onResize={onResize}
          direction={direction}
          prefixCls={prefixCls}
        />,
      ]);
    } else {
      renderChildren = renderChildren.concat([
        <child.type
          {...child.props}
          flex={flex}
          key={`splitter-panel-${index}`}
        />,
      ]);
    }
  });

  return (
    <ContextProvider
      value={{
        prefixCls,
        direction,
        containerRef,
      }}
    >
      <div
        className={[
          `${prefixCls}-splitter-wrapper`,
          `${prefixCls}-splitter-${direction}`,
          className && `${prefixCls}-splitter-${className}`,
        ]
          .filter(Boolean)
          .join(" ")}
        draggable={false}
        ref={containerRef}
      >
        {renderChildren}
      </div>
    </ContextProvider>
  );
};

export default ResizeSplitter;
