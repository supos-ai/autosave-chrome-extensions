import React, { useEffect, useState } from "react";
import { Layout, Input, Divider, Drawer, Tag, List } from "antd";

import { GithubOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import HistoryTable from "./HistoryTable";

import "./App.css";

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
        <div className="resize-content">
          <div className="left" style={{ flex: 1 }}>
            <HistoryTable />
          </div>
          {/* <Divider className="resize-divider" type="vertical" />
          <div className="right" style={{ flex: 1 }}>
            right
          </div> */}
        </div>
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

        <QuestionCircleOutlined
          color="volcano"
          style={{ fontSize: 40, color: "#d4380d" }}
          className="faq-icon"
          onClick={drawerOpen}
        />
      </Content>

      <Footer className="footer">
        <div className="content">
          💖 sunzhiqi@live.com &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <Tag
            icon={<GithubOutlined />}
            color="#55acee"
            onClick={() => window.open("/")}
          >
            Github
          </Tag>
        </div>
      </Footer>
    </Layout>
  );
};

export default App;
