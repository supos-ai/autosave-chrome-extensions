import { Tooltip, Row, Col, Switch } from "antd";

import { QuestionCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

import { requestConfigChange } from "../../service";

const ExpandMenuConfig: React.FC = () => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(["expandMenu"], (result) => {
      const { expandMenu } = result;
      setChecked(expandMenu.checked);
    });
  }, [setChecked]);

  const onSwitch = (checked: boolean) => {
    requestConfigChange({
      type: "expandMenu",
      config: {
        checked,
      },
    });

    setChecked(checked);
  };
  return (
    <Row className="config-row">
      <Col span={20}>
        <span className="config-title">禁止菜单折叠(仅v3.5有效)</span>
        <Tooltip
          placement="top"
          title={() => (
            <span>
              普通视图中的菜单，当一个菜单打开的时候，会收起其他的同级菜单，菜单过长的时候会滚动菜单不便查看，开启此功能会禁止同级菜单折叠。
              <br />
              <strong>在v4.0+平台使用虚拟列表，此配置不再有效。</strong>
            </span>
          )}
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

export default ExpandMenuConfig;
