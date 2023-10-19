import React, { useEffect, useState } from "react";
import { Layout, Input, Divider, Drawer, Tag, List } from "antd";

import { GithubOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import HistoryContent from "./HistoryContent";

import "./App.css";
import "prismjs/themes/prism.css";

const { Footer, Sider, Content } = Layout;

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
const App: React.FC = () => {
  const [open, setOpen] = useState(false);
  const drawerOpen = () => {
    setOpen(true);
  };
  const drawerClose = () => {
    setOpen(false);
  };

  return (
    <Layout className="layout">
      <Content className="content">
        <HistoryContent />
        <Drawer
          title="FAQ"
          placement="right"
          onClose={drawerClose}
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
        <QuestionCircleOutlined
          color="volcano"
          style={{ fontSize: 40, color: "#d4380d" }}
          className="faq-icon"
          onClick={drawerOpen}
        />
      </Footer>
    </Layout>
  );
};

export default App;
