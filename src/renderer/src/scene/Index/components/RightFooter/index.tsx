import { useRef, useState, useContext, useEffect } from 'react'
import {
  Avatar,
  Space,
  Descriptions,
  Tooltip
} from 'antd';
import {
  StarOutlined,
} from '@ant-design/icons';
import { ConfigContext } from '@/utils'
import { indexContext } from '@/scene/Index/index';
import s from "./index.module.less";
import Icon from '@/components/icon'

import AvatarImg from '@/assets/avatar.svg'

import RenderItem from './renderItem'

const Page = ({
  curInfo,
  onAuditOpen,
  auditData,
}: any) => {
  const context: any = useContext(ConfigContext);
  const {
    onPaymentOpen, // 打开支付窗口
    updataDownState,
    curRenderers,
    upDataInfo,
  }: any = useContext(indexContext)
  const [hideTagsCount, setHideTagsCount] = useState(0) // 隐藏的tag数量
  const [hideTags, setHideTags] = useState<string[]>([]) // 隐藏的tag内容

  const auditList = auditData?.resources || []

  const emun: any = {
    triangle: '三角面',
    quad: '四角面'
  }
  const emun2: any = {
    high_realism: {
      label: '高度写实',
      value: 'high_realism',
    },
    realism: {
      label: '写实',
      value: 'realism',
    },
    half_realism: {
      label: '半写实',
      value: 'half_realism',
    },
  }

  const footerTags = useRef<any>(null) // 列表容器dom

  const onSetTags = (isFirst = false) => {
    const containerWidth = footerTags?.current?.offsetWidth;
    const tags = Array.from(footerTags?.current?.querySelectorAll?.('span') || []);
    let totalTagsWidth = 40;
    let hideTagsCount = 0;
    let hideTags: string[] = []

    tags.forEach((tag: any) => {
      if (isFirst) {
        tag.widthNum = tag.offsetWidth
      }
      // console.log(tag.widthNum, tag.offsetWidth, 'tag.offsetWidth');
      totalTagsWidth += tag.widthNum;
      if (totalTagsWidth > containerWidth) {
        hideTags.push(tag.innerHTML)
        tag.style.display = 'none';
        hideTagsCount++;
      } else {
        tag.style.display = 'inline-block';
      }
    });
    // console.log(totalTagsWidth, containerWidth,'containerWidth');
    setHideTagsCount(hideTagsCount)
    setHideTags(hideTags)
  }

  useEffect(() => {
    if (curInfo?.tags?.length) {
      setHideTagsCount(0)
      setHideTags([])
      onSetTags(true)
      window.addEventListener('resize', () => onSetTags(), false);
    }
  }, [curInfo?.tags])

  return (
    <footer className={s.footer}>
      <div className={s.footerL}>
        <div className={s.info}>
          <div className={s.main}>
            <Space className={s.block}>
              <span className={s.title}>{curInfo?.name} (ID:{curInfo?.identity})</span>
              <StarOutlined />
            </Space>
            <div className={`${s.block} ${s.context}`}>
              <Avatar className={s.avatar} size={23} src={AvatarImg} />
              <span className={s.name}>{curInfo?.user_nickname}</span>
              <time>于 {curInfo?.create_time?.split(' ')?.[0]} 上传</time>
              <div className={s.tags} ref={footerTags}>
                {
                  curInfo?.tags?.map((item: string, index: number) => {
                    return <span key={`${curInfo?.identity}_${item}_${index}`}>{item}</span>
                  })
                }
                {hideTagsCount && <Tooltip title={hideTags.join('; ')}>
                  <span className={s.more}>
                    +{hideTagsCount}
                  </span>
                </Tooltip> || ''}
              </div>
            </div>
          </div>
          <div className={s.price}>
            <span>
              <em>￥</em>
              <i>{auditData?.charge ?? '--'}</i>
            </span>
            {!auditData?.purchased && <div className={s.shopBtn} onClick={() => {
              if(process.env.RENDERER_VITE_ALL_APP_TYPE === 'user') {
                onPaymentOpen({
                  itemDetail: curInfo,
                  resources: auditList?.find((item: any) => item.title === curRenderers.renderder_name) || null,
                  updataDownState,
                  downSuccess: () => {
                    // onClick?.(true)
                    upDataInfo()
                  }
                })
              } else {
                onAuditOpen()
              }
            }}>
              <Icon size={20} type={context?.btnIcon} />
            </div>}
          </div>
        </div>

        <div className={s.descriptions}>
          <Descriptions
            size='small'
            contentStyle={{ color: '#949494' }}
            labelStyle={{ color: 'white' }}
            column={{ xl: 4,  md: 3 }}
          >
            <Descriptions.Item label="模型分类">{curInfo?.cate?.map((_: any) => _.title)?.join('/')}</Descriptions.Item>
            <Descriptions.Item label="应用场景">{curInfo?.usage_scenario?.title || '--'}</Descriptions.Item>
            <Descriptions.Item label="布线方式">{emun[curInfo?.wiring] || '--'}</Descriptions.Item>
            <Descriptions.Item label="模型材质">{curInfo?.maps ? '有' : '无'}</Descriptions.Item>
            <Descriptions.Item label="模型风格">{curInfo?.style?.title || '--'}</Descriptions.Item>
            <Descriptions.Item label="家具品牌">{curInfo?.brand?.title || '--'}</Descriptions.Item>
            <Descriptions.Item label="写实程度">{emun2[curInfo?.rendering_level]?.label || '--'}</Descriptions.Item>
            <Descriptions.Item label="UVW贴图">{curInfo?.uvw_maps ? '有' : '无'}</Descriptions.Item>
          </Descriptions>
        </div>
      </div>
      
      {auditList.length && <div className={s.footerR}>
        <ul>
          {
            auditList.map((item: any) => {
              return <li key={item.resource_id}>
                <RenderItem
                  item={item}
                  model_identity={curInfo?.identity}
                  purchased={auditData?.purchased}
                />
              </li>
            })
          }
        </ul>
        <div className={s.preview}>
          <img src={curInfo.previews?.[0]?.preview} />
        </div>
      </div> || ''}
    </footer>
  );
}

export default Page;
