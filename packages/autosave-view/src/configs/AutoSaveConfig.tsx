import { Tooltip, Row, Col, Switch, InputNumber } from "antd";

import { QuestionCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

import { requestConfigChange } from "../service";

const AutoSaveConfig: React.FC = () => {
  const [value, setValue] = useState(5);
  const [checked, setChecked] = useState(false);

  const onChange = (value: number | null) => {
    if (value == null) return;
    if (isNaN(value)) return;

    const delay = Math.min(Math.max(parseInt(String(value)), 1), 60);
    setValue(delay);
    requestConfigChange({
      type: "autosave",
      config: {
        delay,
        checked,
      },
    });
  };

  useEffect(() => {
    chrome.storage.local.get(["autosave"], (result) => {
      const { autosave } = result;
      setChecked(autosave.checked);
      setValue(autosave.delay);
    });
  }, [setChecked]);

  const onSwitch = (checked: boolean) => {
    requestConfigChange({
      type: "autosave",
      config: {
        delay: value,
        checked,
      },
    });

    setChecked(checked);
  };
  return (
    <Row className="config-row">
      <Col span={12}>
        <span className="config-title">自动保存</span>
        <Tooltip
          placement="top"
          title={
            <span>
              只在设计器组态页面生效，自动在指定时间间隔后保存页面数据。
              <br />
              <strong>
                v4.0+ 平台的保存功能会导致页面位置重置，不建议开启
              </strong>
            </span>
          }
        >
          <QuestionCircleOutlined style={{ marginLeft: 10 }} />
        </Tooltip>
      </Col>
      <Col span={8}>
        {checked && (
          <span className="ext-config-comp">
            <InputNumber
              value={value}
              style={{ width: 50 }}
              size="small"
              min={1}
              max={60}
              onChange={onChange}
            />
            &nbsp;&nbsp;<span>分钟</span>
          </span>
        )}
      </Col>
      <Col span={4}>
        <Switch onChange={onSwitch} checked={checked} />
      </Col>
    </Row>
  );
};

export default AutoSaveConfig;
