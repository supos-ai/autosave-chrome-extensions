import {
  Drawer,

} from "antd";

import React, {
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";


import { DrawerRefProps } from "./App";
import configs from './configs'

const ConfigsDrawer: React.ForwardRefExoticComponent<
  React.RefAttributes<DrawerRefProps>
> = forwardRef((props, ref) => {
  const [open, setOpen] = useState(false);

  const onClose = () => setOpen(false);
  const onOpen = () => setOpen(true);
  useImperativeHandle(
    ref,
    () => ({
      onClose,
      onOpen,
    }),
    []
  );



  return (
    <Drawer
      title="设置"
      placement="right"
      onClose={onClose}
      open={open}
      closeIcon={null}
      footer={<p>配置后刷新页面生效</p>}
    >
      {[...configs]}
    </Drawer>
  );
});

export default ConfigsDrawer;
