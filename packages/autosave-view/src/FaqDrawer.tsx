import { Layout, Input, Divider, Drawer, Tag, List } from "antd";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import {DrawerRefProps} from './App'

const faqData = [
  {
    title: "数据保存在哪里？",
    description: (
      <div>
        <strong>IndexedDB</strong>, 通过F12打开开发者工具,点击
        <strong> 应用/application </strong>标签, 在存储菜单中找到 IndexedDB,
        数据库的名字为 <strong> SupOS </strong>,
        如果点击删除数据库数据将会丢失,并在下一次载入的时候新建数据库。
      </div>
    ),
    avatar: "🍕",
  },
];


const FaqDrawer: React.ForwardRefExoticComponent<React.RefAttributes<DrawerRefProps>> = forwardRef((props, ref) => {
  const [open, setOpen] = useState(false);

  const onClose = () => setOpen(false);
  const onOpen = () => setOpen(true);
  useImperativeHandle(
    ref,
    () => ({
      onClose,
      onOpen
    }),
    []
  );

  return (
    <Drawer
      title="FAQ"
      placement="right"
      onClose={onClose}
      open={open}
      closeIcon={null}
    >
      <List
        itemLayout="horizontal"
        dataSource={faqData}
        renderItem={(item, index) => (
          <List.Item>
            <List.Item.Meta
              avatar={item.avatar}
              title={item.title}
              description={item.description}
            />
          </List.Item>
        )}
      />
    </Drawer>
  );
});

export default FaqDrawer;
