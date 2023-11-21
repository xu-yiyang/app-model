import { useContext } from "react";
import {
  Space,
  Form
} from 'antd';
import Select from "@/components/select";
import s from "./index.module.less";
import OperatButton from "@/components/operatButton";
import { indexContext } from '@/scene/Index/index';


const Page = ({
}: any) => {
  const {
    filterConfig,
  }: any = useContext(indexContext)
  const { style, brand, usage_scenario } = filterConfig

  return (
    <header className={s.top}>
      <Space className={s.selects} wrap>
        <Form.Item noStyle name='model_style_ids'>
          <Select label='模型风格' options={style?.list} fieldNames={['name', 'id']} />
        </Form.Item>
        <Form.Item noStyle name='brand_ids'>
          <Select label='家具品牌' options={brand?.list} fieldNames={['name', 'id']} />
        </Form.Item>
        <Form.Item noStyle name='usage_scenario_ids'>
          <Select label='应用场景' options={usage_scenario?.list} fieldNames={['name', 'id']} />
        </Form.Item>
        {/* <Select label='颜色' /> */}
      </Space>
      <OperatButton />
    </header>
  );
}

export default Page;
