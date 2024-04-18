import Splitter from "./Splitter";
import Panel from "./Panel";

type SplitterType = typeof Splitter & {
  Panel: typeof Panel;
};

const ExportSplitter = Splitter as SplitterType;

ExportSplitter.Panel = Panel;

export default ExportSplitter;

export { Panel };
