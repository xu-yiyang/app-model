import { useState, useContext } from 'react'
import { Progress, Tooltip, Dropdown } from 'antd';
import { minimizeWin } from '@/windows/actions'
import {
  CloudOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import Icon from '@/components/icon'

import s from "./index.module.less";
import { downFun } from '@/utils';
import { indexContext } from '@/scene/Index/index';

const Page = ({
  item,
  imgUrl,
  isCur = false,
  title = '',
  onClick,
  resources, // 当前渲染器数据
  seizeASeat = false, // 是否输出占位标签，作用用于多行列表两端对齐，最后一行不对齐
  isShop = true, // 是否购买
  model_identity = '', // 模型id
  openPreview
}: any) => {
  const {
    onPaymentOpen, // 打开支付窗口
    progressObj, // 下载进度数据
    updataDownState,
    curRenderers, // 当前选择的渲染器数据
  }: any = useContext(indexContext)

  const progress = progressObj?.[resources?.resource_id]

  const items: any = [
    {
      label: '打开文件所在目录',
    },
  ];

  const DonClick: any = ({ key }) => {
    window.api.openModelPath({
      model_identity,
      renderer_id: resources.renderer_id,
    })
  };

  return (<>
    {!seizeASeat ? <Dropdown
      menu={{ items, onClick: DonClick }}
      arrow
      trigger={['contextMenu']}
      placement='topCenter'
      disabled={!progress?.isDown}
    ><div
      className={`imgItem ${s.imgItem} ${isCur ? s.cur : ''}`}
      style={{ backgroundImage: `url(${imgUrl})` }}
      draggable={progress?.isDown}
      onDragStart={(event) => {
        event.preventDefault()
        if (resources) {
          window.api.startDragFile({
            model_identity: model_identity,
            renderer_name: resources.renderer_name,
            renderer_id: resources.renderer_id,
            imgUrl: imgUrl,
          })
        }
      }}
      onDragLeave={(event) => {
        event.preventDefault()
        setTimeout(() => {
          minimizeWin()
        }, 100)
      }}
      onClick={() => {
        onClick?.()
      }}
      onDoubleClick={() => {
        openPreview(imgUrl)
      }}
    >
      <div className={s.icons} onClick={(e) => {
        e.stopPropagation()
      }}>
        {
          !isShop ? (
            <>
              {
                resources ? <span
                  className={s.right}
                  onClick={() => {
                    onPaymentOpen({
                      itemDetail: item,
                      resources: resources,
                      updataDownState,
                      downSuccess: () => {
                        onClick?.(true)
                      }
                    })
                  }}
                >
                  <Icon size={14} type='icon-gouwuche' />
                </span> : <span
                  className={`${s.right} ${s.noDown}`}
                >
                  <Icon size={14} type='icon-gouwuche' />
                </span>
              }
            </>
          ) : <>
            {
              !progress?.isDown ? (
                <>
                  {
                    resources ? <span className={`${s.left} ${s.blocks}`}>
                      {
                        progress?.isProgress ? (
                          <Progress type="circle" percent={progress?.percent} size={20} />
                        ) : (
                          <>
                            <i className={s.noHover}><CloudOutlined /></i>
                            <i className={s.hover} onClick={() => {
                              downFun(model_identity, resources, () => {
                                onClick?.(true)
                              })
                            }}><VerticalAlignBottomOutlined /></i>
                          </>
                        )
                      }
                    </span> : <span className={`${s.left} ${s.noDown}`}>
                      <Tooltip title={`该模型暂不支持${curRenderers?.title}下载`}>
                        <i><Icon size={14} type='icon-bukexiazai1' /></i>
                      </Tooltip>
                    </span>
                  }
                </>
              ) : (
                <div
                  className={s.check}
                >
                  <Icon size={14} type='icon-yixiazai' />
                </div>
              )
            }
          </>
        }
      </div>

      {title && <div className={s.proTitle}>
        {title}
      </div>}
    </div></Dropdown> : <>
      <i className={s.i} />
      <i className={s.i} />
      <i className={s.i} />
      <i className={s.i} />
      <i className={s.i} />
      <i className={s.i} />
      <i className={s.i} />
      <i className={s.i} />
      <i className={s.i} />
      <i className={s.i} />
      <i className={s.i} />
      <i className={s.i} />
      <i className={s.i} />
      <i className={s.i} />
      <i className={s.i} />
      <i className={s.i} />
      <i className={s.i} />
      <i className={s.i} />
      <i className={s.i} />
      <i className={s.i} />
      <i className={s.i} />
      <i className={s.i} />
      <i className={s.i} />
      <i className={s.i} />
    </>}
  </>);
}

export default Page;
