import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { messageAction } from "extensions-config";
import Prism from "prismjs";

import type { MessageData } from "./service";

import {
  Table,
  Row,
  Col,
  Select,
  Form,
  Input,
  Button,
  Divider,
  DatePicker,
  Alert,
  message,
  Space,
  ConfigProvider,
  Empty,
} from "antd";
import { CheckCircleTwoTone, CopyTwoTone } from "@ant-design/icons";

import {
  receiveMessage,
  requestConnectStatus,
  requestDataCount,
  requestServiceData,
  requestScriptData,
  requestLongMessageConnect,
  establishLongMessageConnect,
} from "./service";

import type { ColumnsType } from "antd/es/table";

interface ColumnsData {
  serviceName: string;
  serviceId: string;
  widgetId: string;
  actionName: string;
  widgetName: string;
  createAt: number;
  script: string;
  id: string;
}

type FieldType = {
  type?: string;
  sourceId?: string;
  timeRange: [string, string];
};
const { RangePicker } = DatePicker;
const formItemLayout = {
  labelCol: { lg: 8, sm: 6, xs: 6 },
  wrapperCol: { lg: 16, xs: 18 },
};
const buttonItemLayout = {
  wrapperCol: { lg: { offset: 8 }, xs: { offset: 6 } },
};
const HistoryTable: React.FC = () => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const destroyMsgRef = useRef<any>(null);
  const messagePort = useRef<chrome.runtime.Port>();
  const [connectInfo, setConnectInfo] = useState({
    isConnected: false,
    host: null,
  });

  const [dataType, setDataType] = useState("service");
  const [tableData, setTableData] = useState([]);
  const [selectedData, setSelectedData] = useState<ColumnsData | null>(null);

  const typeValue = Form.useWatch("type", form);

  useEffect(() => {
    const longMessageConnectHandler = (msg: any) => {
      const { action, payload } = msg;
      if (action === messageAction.REQUEST_SCRIPT_DATA) {
        setDataType("script");

        const { response } = payload;

        if (response && response.code === 1) {
          setTableData(
            response.data.map((item: any) => ({ ...item, key: item.id }))
          );
        }
      } else if (action === messageAction.REQUEST_SERVICE_DATA) {
        setDataType("service");

        const { response } = payload;

        if (response && response.code === 1) {
          setTableData(
            response.data.map((item: any) => ({ ...item, key: item.id }))
          );
        }
      }

      setSelectedData(null);
      setLoading(false);
    };

    receiveMessage((request: MessageData) => {
      if (request.action === messageAction.CHECK_CONNECT_POPUP) {
        setConnectInfo(request.payload);
      }

      if (request.action === messageAction.LONG_CONNECT_TO_POPUP) {
        const { fromTabId } = request.payload;
        if (messagePort.current || !fromTabId) return;

        messagePort.current = establishLongMessageConnect(
          fromTabId,
          longMessageConnectHandler
        );
      }
    });
    requestConnectStatus();
  }, [setSelectedData, setLoading, receiveMessage]);

  useEffect(() => {
    if (!connectInfo.isConnected) return;
    requestLongMessageConnect();
  }, [connectInfo]);

  const onFinish = async (values: any) => {
    const { timeRange, type, sourceId } = values;
    let [start, end] = timeRange;
    start = dayjs(
      `${start.format("YYYY-MM-DD")} 00:00:00`,
      "YYYY-MM-DD HH:mm:ss"
    ).valueOf();
    end = dayjs(
      `${end.format("YYYY-MM-DD")} 23:59:59`,
      "YYYY-MM-DD HH:mm:ss"
    ).valueOf();

    const payload = {
      type,
      sourceId,
      start,
      end,
    };

    if (!connectInfo.isConnected) {
      destroyMsgRef.current && destroyMsgRef.current();
      destroyMsgRef.current = message.info("请连接至 supOS 平台");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 5000);
    if (type === "service") {
      requestServiceData(messagePort.current, payload);
    }
    if (type === "script") {
      requestScriptData(messagePort.current, payload);
    }
  };
  const onTypeChange = () => {
    form.setFieldsValue({ sourceId: "" });
  };

  const handleView = (record: ColumnsData) => {
    setSelectedData(record);
  };

  const copy = (record: ColumnsData) => {
    const textarea = document.createElement("textarea");

    textarea.style.width = "0px";
    textarea.style.height = "0px";
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";

    document.body.appendChild(textarea);
    textarea.value = record.script;
    textarea.select();

    document.execCommand("copy");
    textarea.parentElement?.removeChild(textarea);

    destroyMsgRef.current && destroyMsgRef.current();
    destroyMsgRef.current = message.success("复制成功");
  };

  const commonColumn: ColumnsType<ColumnsData> = [
    {
      title: "日期",
      dataIndex: "createAt",
      key: "createAt",
      render: (createAt) => dayjs(createAt).format("YYYY-MM-DD HH:mm:ss"),
      width: "28%",
      ellipsis: true,
    },
    {
      title: "代码",
      key: "code",
      ellipsis: true,
      width: "16%",
      align: "center",
      render: (_, record) =>
        selectedData && record.id === selectedData.id ? (
          selectedData.script.trim() ? (
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
  const serviceColumn: ColumnsType<ColumnsData> = [
    {
      title: "服务(订阅) 名称",
      dataIndex: "serviceName",
      key: "serviceName",
      width: "28%",
      ellipsis: true,
      render: (serviceName) => (
        <div className="cell-content">{serviceName}</div>
      ),
    },
    {
      title: "服务(订阅) 别名",
      dataIndex: "serviceId",
      key: "serviceId",
      width: "28%",
      ellipsis: true,
    },
    ...commonColumn,
  ];

  const scriptColumn: ColumnsType<ColumnsData> = [
    {
      title: "组件ID",
      dataIndex: "widgetId",
      key: "widgetId",
      width: "28%",
      ellipsis: true,
      render: (widgetId) => <div className="cell-content">{widgetId}</div>,
    },
    {
      title: "动作",
      dataIndex: "actionName",
      key: "actionName",
      width: "28%",
      ellipsis: true,
      render: (actionName, record) => (
        <div className="cell-content">{actionName || record.widgetName}</div>
      ),
    },
    ...commonColumn,
  ];
  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            cellPaddingInline: 12,
            cellPaddingBlock: 12,
          },
        },
      }}
    >
      <div className="content-box">
        <div className="search">
          <Alert
            message={
              connectInfo.isConnected ? `连接至 ${connectInfo.host}` : "未连接"
            }
            type={connectInfo.isConnected ? "success" : "info"}
            showIcon
          />
          <Form
            form={form}
            style={{
              maxWidth: "none",
              padding: 20,
            }}
            initialValues={{ remember: true }}
            layout="inline"
            {...formItemLayout}
            onFinish={onFinish}
            // onFinishFailed={onFinishFailed}
          >
            <Row
              gutter={[0, 16]}
              style={{ width: "100%" }}
              className="form-search-row"
            >
              <Col lg={7} md={12} xs={24}>
                <Form.Item<FieldType>
                  label={
                    <span style={{ width: "80px", textAlign: "right" }}>
                      类型
                    </span>
                  }
                  name="type"
                  initialValue="service"
                >
                  <Select style={{ width: "100%" }} onChange={onTypeChange}>
                    <Select.Option value="service">服务 / 订阅</Select.Option>
                    <Select.Option value="script">页面脚本</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col lg={7} md={12} xs={24}>
                <Form.Item<FieldType>
                  label={
                    <span style={{ width: "80px", textAlign: "right" }}>
                      {typeValue === "service" ? "名称 / 别名" : "组件ID"}
                    </span>
                  }
                  name="sourceId"
                >
                  <Input style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col lg={10} md={12} xs={24}>
                <Form.Item<FieldType>
                  label={
                    <span style={{ width: "80px", textAlign: "right" }}>
                      时间范围
                    </span>
                  }
                  initialValue={[dayjs().subtract(3, "day"), dayjs()]}
                  name="timeRange"
                >
                  <RangePicker
                    style={{ width: "100%" }}
                    allowClear={false}
                    format={"YYYY-MM-DD"}
                  />
                </Form.Item>
              </Col>
              <Col lg={{ offset: 14, span: 10 }} md={12} xs={24}>
                <Form.Item {...buttonItemLayout}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ width: "100%" }}
                    loading={loading}
                  >
                    查询
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>

        <div className="resize-content">
          <div className="left" style={{ width: "50%" }}>
            <Table
              className="view-table-content"
              columns={dataType === "service" ? serviceColumn : scriptColumn}
              dataSource={tableData}
              pagination={false}
              scroll={{ y: "calc(100vh - 320px)" }}
            />
          </div>
          <Divider className="resize-divider" type="vertical" />
          <div className="right" style={{ width: "50%" }}>
            {!selectedData && (
              <div className="code-box-empty">
                <Empty description={false} />
              </div>
            )}
            {selectedData && !selectedData.script.trim() && (
              <div className="code-box-empty">
                <Empty
                  description={<span style={{ color: "#787878" }}>无记录</span>}
                />
              </div>
            )}
            {selectedData && selectedData.script.trim() && (
              <div className="code-box">
                <pre>
                  <code
                    className="language-javascript"
                    dangerouslySetInnerHTML={{
                      __html: Prism.highlight(
                        selectedData.script,
                        Prism.languages.javascript,
                        "javascript"
                      ),
                    }}
                  ></code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default HistoryTable;
