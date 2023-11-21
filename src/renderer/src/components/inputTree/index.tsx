import { useState, useContext } from 'react';
import {
  Input,
  Form
} from 'antd';
import {
  SearchOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import Icon from '@/components/icon'
import { indexContext } from '@/scene/Index/index';

import s from "./index.module.less";
import Trees from "./Tree";

const page = ({
  treeData,
  fieldNames = {
    title: 'name',
    key: 'id',
    children: 'children'
  },
}: any) => {
  const {
    searchImg,
    getSearchImg
  }: any = useContext(indexContext)

  const IInput = ({ value, onChange }: any) => {
    const [val, setValue] = useState(value)
    return <div className={s.inputBox}>
      <div className={s.prefix}>
        {
          searchImg ? (
            <div className={s.searchImg} onClick={(e) => {
              e.stopPropagation()
              e.preventDefault();
            }}>
              <img src={searchImg} />
              <em onClick={(e) => {
                onChange?.('')
              }}>
                <Icon size={11} type='icon-yichuyixiazaired' />
              </em>
            </div>
          ) : <SearchOutlined />
        }
      </div>
      <Input
        placeholder="输入ID/名称/标签"
        className={s.input}
        value={val}
        onBlur={e => {
          onChange?.(e.target.value)
        }}
        onPressEnter={(e: any) => {
          console.log(e.target.value, 'e.target.value');
          onChange?.(e.target.value)
        }}
        onChange={e => {
          setValue(e.target.value)
        }}
      />
      <div className={s.suffix}>
        <div className={s['upload-wrap']}>
          <input type="file" className={s['upload-pic']} onChange={e => {
            getSearchImg(e?.target?.files?.[0])
          }} />
          <CameraOutlined style={{ fontSize: 16 }} />
        </div>
      </div>
    </div>
  }

  return (
    <div className={s.inputTree}>
      <div id='paste'>
        <Form.Item
          noStyle
          name='keyword'
        >
          <IInput />
        </Form.Item>
      </div>
      <Form.Item
        noStyle
        name='category_ids'
      >
        <Trees treeData={treeData} fieldNames={fieldNames} />
      </Form.Item>
    </div>
  );
}

export default page;
