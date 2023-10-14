import React, { useEffect, useRef, useState } from "react";
import { dbClient } from "indexdb";
import dayjs from "dayjs";

import {
  Table,
  Row,
  Col,
  Select,
  Form,
  Input,
  Button,
  Space,
  DatePicker,
} from "antd";

const DB_NAME = "SupOS";
const DB_VERSION = 222;

const client = dbClient(DB_NAME, DB_VERSION);

console.log(client);

interface DataProps {
  action: string;
  actionName: string;
  script: string;
  widgetName: string;
  widgetId: string;
  id: string;
  type: string;
  createAt: number;
}

// client.add("supos_scripts_record", {
//   id:"002",
//   type: "layout",
//   action: null,
//   actionName: "未选择交互事件",
//   script: "",
//   widgetName: "LabelCtrl",
//   createAt: Date.now(),
//   widgetId: "xxc",
// });

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

  const typeValue = Form.useWatch("type", form);

  const onFinish = async (values: any) => {
    const STORE_NAME = "supos_scripts_record";

    const { timeRange, type, widgetId } = values;
    let [start, end] = timeRange;
    start = dayjs(
      `${start.format("YYYY-MM-DD")} 00:00:00`,
      "YYYY-MM-DD HH:mm:ss"
    ).valueOf();
    end = dayjs(
      `${end.format("YYYY-MM-DD")} 23:59:59`,
      "YYYY-MM-DD HH:mm:ss"
    ).valueOf();
    console.log(start, end);

    client.get("supos_scripts_record", (store) => {
      const typeIndex = store.index("typeIndex");
      const widgetIdIndex = store.index("widgetIdIndex");
      const createAtIndex = store.index("createAtIndex");

      const request = createAtIndex.openCursor(IDBKeyRange.bound(start, end));
      let result: DataProps[] = [];

      request.onsuccess = function (e) {
        const cursor = (e?.target as any).result;

        if (cursor) {
          const data = cursor.value;
          // if (data.uid.includes(queryUid)) {
          //   results.push(data);
          // }

          if (data.type !== type) {
            cursor.continue();
            return;
          }

          if (widgetId !== undefined && !data.widgetId.includes(widgetId)) {
            cursor.continue();
            return;
          }

          result.push(data);
          cursor.continue();
        } else {
          console.log("根据名称查询结果:", result);
        }
      };
    });
  };

  const onTypeChange = () => {
    form.setFieldsValue({ sourceId: "" });
  };

  return (
    <>
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
                <span style={{ width: "80px", textAlign: "right" }}>类型</span>
              }
              name="type"
              initialValue="service"
            >
              <Select style={{ width: "100%" }} onChange={onTypeChange}>
                <Select.Option value="service">服务 / 订阅</Select.Option>
                <Select.Option value="layout">页面脚本</Select.Option>
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
              initialValue={[dayjs().subtract(1, "month"), dayjs()]}
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
              >
                查询
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Table />
    </>
  );
};

export default HistoryTable;
