import s from "./index.module.less";
import EmptyImg from "@/assets/emptyImg.svg";

const Page = ({
  style = {}
}) => {
  return (
    <div
      className={s.empty}
      style={{ ...style }}
    >
      <div>
        <img src={EmptyImg} alt="" />
        <span>
          暂无模型
        </span>
      </div>
    </div>
  );
}

export default Page;
