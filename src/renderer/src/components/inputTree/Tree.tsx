import {
  Tree,
} from 'antd';

import s from "./index.module.less";

const page = ({
  onChange,
  treeData,
  fieldNames
}: any) => {
  const newTreeData: any = [
    {
      "id": 'all',
      "name": "全部",
      "parent_id": null,
      "children": []
    },
    ...treeData
  ]
  return (
    <Tree.DirectoryTree
      defaultSelectedKeys={['all']}
      rootClassName={s.tree}
      showIcon={false}
      treeData={newTreeData}
      expandAction='doubleClick'
      fieldNames={fieldNames}
      onSelect={(selectedKeys, e) => {
        if(selectedKeys?.[0] === 'all') {
          onChange([])
          return 
        }
        if (e.node.children && e.selected && process.env.RENDERER_VITE_ALL_APP_TYPE !== 'user') {
          // 用户端只需要当前的类id
          onChange(e.node.children.map((_: any) => _.id))
        } else {
          onChange(selectedKeys)
        }
      }}
    />
  );
}

export default page;
