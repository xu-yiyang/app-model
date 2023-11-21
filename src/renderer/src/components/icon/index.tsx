import { createFromIconfontCN } from '@ant-design/icons';

export const MyIcon = createFromIconfontCN({
  scriptUrl: [
    'https://at.alicdn.com/t/c/font_4058995_h6oqizp28k.js', // 渲染器图标库 https://www.iconfont.cn/manage/index?manage_type=myprojects&projectId=4058995&keyword=&project_type=&page=
    'https://at.alicdn.com/t/c/font_4182458_64ttxlipizo.js' // 客户端图标库 https://www.iconfont.cn/manage/index?manage_type=myprojects&projectId=4182458
  ], // 在 iconfont.cn 上生成 
});

export default function icon({
  size = 24,
  type,
}: any) {
  return (
    <MyIcon type={type} style={{ fontSize: size }} />
    // <svg
    //   aria-hidden="true"
    //   style={{
    //     width: size,
    //     height: size,
    //   }}
    // >
    //   <use xlinkHref={`#${type}`} />
    // </svg>
  )
}