import React, { useCallback, useEffect, useState } from "react";
import { Layout, Input, Divider, Drawer, Tag, List } from "antd";

import {
  GithubOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import HistoryContent from "./HistoryContent";
import FaqDrawer from "./FaqDrawer";
import ConfigsDrawer from "./ConfigsDrawer";

import "./App.css";
import "prismjs/themes/prism.css";

const { Footer, Sider, Content } = Layout;

export type DrawerRefProps = {
  onClose: () => void;
  onOpen: () => void;
};

const App: React.FC = () => {
  const faqRef = React.useRef<DrawerRefProps>(null);
  const configsRef = React.useRef<DrawerRefProps>(null);

  return (
    <Layout className="layout">
      <Content className="content">
        <HistoryContent />
        <FaqDrawer ref={faqRef} />
        <ConfigsDrawer ref={configsRef} />
      </Content>

      <Footer className="footer">
        <div className="content">
          💖 sunzhiqi@live.com &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <Tag
            icon={<GithubOutlined />}
            color="#55acee"
            onClick={() =>
              window.open(
                "https://github.com/supos-ai/autosave-chrome-extensions"
              )
            }
          >
            Github
          </Tag>
        </div>
        <SettingOutlined
          className="setting-icon"
          onClick={() => configsRef.current?.onOpen()}
        />
        <QuestionCircleOutlined
          className="faq-icon"
          onClick={() => {
            faqRef.current?.onOpen();
          }}
        />
      </Footer>
    </Layout>
  );
};

export default App;
