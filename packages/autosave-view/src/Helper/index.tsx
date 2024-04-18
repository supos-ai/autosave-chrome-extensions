import { useParams } from "react-router-dom";
import { Layout, Tag } from "antd";
import Splitter, { Panel } from "../components/ResizeSplitter";
import NameList from "./HelperList";

const { Footer, Content } = Layout;

const Helper = () => {
  const { type } = useParams();

  return (
    <Layout className="layout">
      <Content className="content">
        <div className="content-box">
          <div className="resize-content">
            <Splitter min={300}>
              <Panel>
                <NameList />
              </Panel>
              <Panel>wef</Panel>
            </Splitter>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default Helper;
