import { Tooltip, Row, Col, Switch } from "antd";

import { QuestionCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

import { requestConfigChange } from "../service";

const ExamModeConfig: React.FC = () => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(["examMode"], (result) => {
      const { examMode } = result;
      setChecked(examMode.checked);
    });
  }, [setChecked]);

  const onSwitch = (checked: boolean) => {
    requestConfigChange({
      type: "examMode",
      config: {
        checked,
      },
    });

    setChecked(checked);
  };
  return (
    <Row className="config-row">
      <Col span={20}>
        <span className="config-title">考试模式</span>
        <Tooltip
          placement="top"
          title="参加评级考试的同学请开启此配置,在组态期刷新页面后图标变为红色表示考试模式生效。"
        >
          <QuestionCircleOutlined style={{ marginLeft: 10 }} />
        </Tooltip>
      </Col>
      <Col span={4}>
        <Switch onChange={onSwitch} checked={checked} />
      </Col>
    </Row>
  );
};

export default ExamModeConfig;
