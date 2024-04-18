import { Tooltip, Row, Col, Switch } from "antd";

import { QuestionCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

import { requestConfigChange } from "../../service";

const ExamModeConfig: React.FC = () => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(["oodmHelper"], (result) => {
      const { oodmHelper } = result;
      setChecked(Boolean(oodmHelper.checked));
    });
  }, [setChecked]);

  // const isApproval = window.se
  const onSwitch = (checked: boolean) => {
    requestConfigChange({
      type: "oodmHelper",
      config: {
        checked,
      },
    });

    setChecked(checked);
  };

  return (
    <Row className="config-row">
      <Col span={20}>
        <span className="config-title">对象模型辅助工具</span>
        <Tooltip
          placement="top"
          title="开启此功能在对象模型的服务/属性页面，会出现提示信息的按钮，帮助快速实现服务或订阅功能。"
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
