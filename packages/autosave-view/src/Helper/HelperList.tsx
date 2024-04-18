import { Tabs, Space, message, List } from "antd";
import { useState, useRef } from "react";

import type { ColumnsType } from "antd/es/table";
import { CheckCircleTwoTone, CopyTwoTone } from "@ant-design/icons";

interface ColumnsData {
  title: string;
  content: string;
}

const NameList = () => {
  const [selectedData, setSelectedData] = useState<ColumnsData | null>(null);

  const handleView = (record: ColumnsData) => {
    setSelectedData(record);
  };
  const destroyMsgRef = useRef<any>(null);
  const Lists = (
    <div style={{ height: "calc(100vh - 102px)", overflow: "auto" }}>
      <List
        itemLayout="horizontal"
        dataSource={[
          {
            title: "Ant Design Title wegwej1",
            content: "xxx",
          },
          {
            title: "Ant Design Title 2",
            content: "xxx",
          },
          {
            title: "Ant Design Title 3",
            content: "xxx",
          },
          {
            title: "Ant Design Title 4",
            content: "xxx",
          },
          {
            title: "Ant Design Title 1",
            content: "xxx",
          },
          {
            title: "Ant Design Title 2",
            content: "xxx",
          },
          {
            title: "Ant Design Title 3",
            content: "xxx",
          },
          {
            title: "Ant Design Title 4",
            content: "xxx",
          },
          {
            title: "Ant Design Title 1",
            content: "xxx",
          },
          {
            title: "Ant Design Title 2",
            content: "xxx",
          },
          {
            title: "Ant Design Title 3",
            content: "xxx",
          },
          {
            title: "Ant Design Title 4",
            content: "xxx",
          },
          {
            title: "Ant Design Title 1",
            content: "xxx",
          },
          {
            title: "Ant Design Title 2",
            content: "xxx",
          },
          {
            title: "Ant Design Title 3",
            content: "xxx",
          },
          {
            title: "Ant Design Title 4",
            content: "xxx",
          },
          {
            title: "Ant Design Title 1",
            content: "xxx",
          },
          {
            title: "Ant Design Title 2",
            content: "xxx",
          },
          {
            title: "Ant Design Title 3",
            content: "xxx",
          },
          {
            title: "Ant Design Title 4",
            content: "xxx",
          },
          {
            title: "Ant Design Title 1",
            content: "xxx",
          },
          {
            title: "Ant Design Title 2",
            content: "xxx",
          },
          {
            title: "Ant Design Title 3",
            content: "xxx",
          },
          {
            title: "Ant Design Title 4",
            content: "xxx",
          },
        ]}
        renderItem={(item) => (
          <List.Item
            actions={[
              selectedData && item.title === selectedData.title ? (
                selectedData.content.trim() ? (
                  <span className="action-icon" onClick={() => copy(item)}>
                    <CopyTwoTone style={{ fontSize: 20 }} />
                  </span>
                ) : (
                  <CheckCircleTwoTone style={{ fontSize: 22 }} />
                )
              ) : (
                <Space size="middle">
                  <span
                    className="show-code-button"
                    onClick={() => handleView(item)}
                  >
                    查看
                  </span>
                </Space>
              ),
            ]}
          >
            <List.Item.Meta title={item.title} />
          </List.Item>
        )}
      />
    </div>
  );
  const copy = (record: ColumnsData) => {
    const textarea = document.createElement("textarea");

    textarea.style.width = "0px";
    textarea.style.height = "0px";
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";

    document.body.appendChild(textarea);
    textarea.value = record.content;
    textarea.select();

    document.execCommand("copy");
    textarea.parentElement?.removeChild(textarea);

    destroyMsgRef.current && destroyMsgRef.current();
    destroyMsgRef.current = message.success("复制成功");
  };

  const column: ColumnsType<ColumnsData> = [
    {
      title: "name",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (name) => <div className="cell-content">{name}</div>,
    },
    {
      title: "模板",
      key: "content",
      ellipsis: true,
      width: "16%",
      align: "center",
      render: (_, record) =>
        selectedData && record.title === selectedData.title ? (
          selectedData.content.trim() ? (
            <span className="action-icon" onClick={() => copy(record)}>
              <CopyTwoTone style={{ fontSize: 20 }} />
            </span>
          ) : (
            <CheckCircleTwoTone style={{ fontSize: 22 }} />
          )
        ) : (
          <Space size="middle">
            <span
              className="show-code-button"
              onClick={() => handleView(record)}
            >
              查看
            </span>
          </Space>
        ),
    },
  ];

  return (
    <div style={{ marginRight: 10 }}>
      {/* <Table
        className="view-table-content"
        columns={column}
        dataSource={[{ title: "1", content: "wefw" }]}
        pagination={false}
        scroll={{ y: "calc(100vh - 320px)" }}
      /> */}
      <Tabs
        type="card"
        items={[
          {
            label: `Tab $1`,
            key: "Tab $1",
            children: Lists,
          },
          {
            label: `Tab $1`,
            key: "Tab $2",
            children: Lists,
          },
          {
            label: `Tab $1`,
            key: "Tab $3",
            children: <div>wefwef</div>,
          },
        ]}
      />
    </div>
  );
};

export default NameList;
