import React, { CSSProperties } from "react";
import { useContext } from "./context";
type PanelProps = {
  children?: React.ReactNode;

  flex?: {
    grow: number;
    shrink: number;
    basis: number;
  };
};

const Panel: React.FC<PanelProps> & {
  __AUTOSAVE_SPLITTER_PANEL__: 1;
} = (props) => {
  const { prefixCls } = useContext();

  const { children, flex } = props;
  const style = Object.keys(flex!).reduce((s, k) => {
    s[`flex${k[0].toLocaleUpperCase()}${k.substring(1)}`] =
      flex![k as keyof typeof flex];
    return s;
  }, {} as any) as CSSProperties;

  return (
    <div
      className={[`${prefixCls}-splitter-panel`].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </div>
  );
};

Panel.__AUTOSAVE_SPLITTER_PANEL__ = 1;

export default Panel;
