import { useContext } from 'react'
import {
  Tag,
  Tooltip,
  Progress,
  Popconfirm,
  message,
} from 'antd';
import {
  CloudOutlined,
} from '@ant-design/icons';
import s from "./index.module.less";
import Icon from '@/components/icon'
import { auditStateEnum } from '@/utils/enum'
import { downFun } from '@/utils'

import { indexContext } from '@/scene/Index/index';

const Page = ({
  item,
  model_identity, // 模型id
  isShowTag = true, // 是否展示审核状态
  purchased = true, // 是否已购买模型
  childrenLeft = '', //左侧自定义内容
}: any) => {
  const state = auditStateEnum[item.state]
  const {
    progressObj, // 下载进度数据
    setProgressObj,
  }: any = useContext(indexContext)
  const progress = progressObj?.[item?.resource_id]

  const confirm: any = (e: React.MouseEvent<HTMLElement>) => {
    console.log(e, model_identity, item);
    window.api?.rmdirModelFile?.({
      model_identity,
      renderer_id: item.renderer_id,
      callbackSuccess: (msg) => {
        message.success(msg)
        setProgressObj({
          ...progressObj,
          [item.resource_id]: {
            isDown: false, // 是否下载
            isProgress: false, // 是否正在下载
            percent: 0 // 下载进度
          }
        })
      },
      callbackErr: (msg) => {
        message.error(msg)
      },
    })
  };

  return <div className={s.renderItem}>
  <div className={s.left}>  
    <Icon size={24} type={item.renderer_icon} />
    <Tooltip title={item.renderer_name || item.renderder_name}>
      <span className={s.title}>{item.renderer_name || item.renderder_name}</span>
    </Tooltip>
    {childrenLeft}
  </div>
  <div className={s.right}>
    {item.file_size && <i>{parseFloat((item.file_size / 1024 / 1024).toFixed(2))}MB</i>}
    {state && isShowTag && <Tag color={state.color} className={s.tag}>{state.label}</Tag>}
    {purchased && <div className={s.icon}>
      {
        progress?.isDown ? (
          <>
            <span className={s.success}><Icon size={18} type='icon-yixiazai' /></span>
            <span className={s.close}>
              <Popconfirm
                title="确定删除下载到本地的模型吗?"
                onConfirm={() => {
                  confirm()
                }}
                okText="Yes"
                cancelText="No"
              >
                <div>
                  <Icon size={18} type='icon-yichuyixiazai' />
                </div>
              </Popconfirm>
            </span>
          </>
        ) : (
          <>
            {
              progress?.isProgress ? (
                <Progress type="circle" percent={progress?.percent} size={18} />
              ) : (
                <>
                  <CloudOutlined className={s.down} onClick={() => {
                    downFun(model_identity, item)
                  }} />
                </>
              )
            }
          </>
        )
      }
    </div>}
  </div>
</div>;
}

export default Page;
