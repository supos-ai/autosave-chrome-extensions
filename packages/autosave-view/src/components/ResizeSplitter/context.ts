import React, { useContext as useReactContext } from "react";

export type ContextValues = {
  prefixCls?: string;
  direction?: "vertical" | "horizontal";
  containerRef?: React.MutableRefObject<HTMLElement | null>;
};

const context = React.createContext<ContextValues>(null!);

export default context.Provider;

export const useContext = () => useReactContext(context);
