import { Tooltip, Row, Col, Switch } from "antd";

import {
  QuestionCircleOutlined,
  StrikethroughOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";

import { requestConfigChange } from "../service";

const ExamModeConfig: React.FC = () => {
  const [checked, setChecked] = useState(false);
  const [isApprovalMode, setApprovalMode] = useState(false);
  const timer = useRef<NodeJS.Timeout>();
  const count = useRef<number>(0);

  useEffect(() => {
    chrome.storage.local.get(["examMode"], (result) => {
      const { examMode } = result;
      setChecked(Boolean(examMode.checked));
      setApprovalMode(Boolean(examMode.approvalMode));
    });
  }, [setChecked]);

  // const isApproval = window.se
  const onSwitch = (checked: boolean) => {
    requestConfigChange({
      type: "examMode",
      config: {
        checked,
        approvalMode: false,
      },
    });

    setChecked(checked);
    !checked && setApprovalMode(checked);
  };

  const onApprovalModeCheck = () => {
    clearTimeout(timer.current);
    count.current = 0;

    timer.current = setTimeout(() => {
      if (count.current === 7) {
        if (!checked) return;
        requestConfigChange({
          type: "examMode",
          config: {
            checked,
            approvalMode: !isApprovalMode,
          },
        });
        setApprovalMode(!isApprovalMode);
      }

      count.current = 0;
    }, 2000);
  };

  const onTitleClick = () => {
    count.current += 1;
  };

  return (
    <Row className="config-row">
      <Col span={20}>
        <span className="config-title" onClick={onTitleClick}>
          考试模式
        </span>
        <Tooltip
          placement="top"
          title="参加评级考试的同学请开启此配置,在组态期刷新页面后图标变为红色表示考试模式生效。"
        >
          <QuestionCircleOutlined style={{ marginLeft: 10 }} />
        </Tooltip>
      </Col>
      <Col span={3}>
        <Switch onChange={onSwitch} checked={checked} />
      </Col>
      <Col span={1}>
        <StrikethroughOutlined
          style={{ marginLeft: 10, color: isApprovalMode ? "green" : "black" }}
          onClick={onApprovalModeCheck}
        />
      </Col>
    </Row>
  );
};

export default ExamModeConfig;
