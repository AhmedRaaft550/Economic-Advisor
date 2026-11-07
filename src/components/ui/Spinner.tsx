import { Spin } from "antd";

const Spinner = ({ size = "small" }: { size: "small" | "large" }) => {
  return <Spin size={size} />;
};

export default Spinner;
