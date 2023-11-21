import { useState, useContext } from "react";
import {
  Avatar,
  Dropdown,
  Space,
  Tabs,
  Tooltip,
  Badge,
} from 'antd';
import {
  MenuOutlined,
  DownOutlined,
  InfoCircleFilled,
  SwapOutlined,
} from '@ant-design/icons';
import Icon from '@/components/icon'
import type { MenuProps, TabsProps } from 'antd';
import { ConfigContext } from '@/utils'
import { indexContext } from '@/scene/Index/index';
import { openLoginWin, checkUpdate } from '@/windows/actions'
import InputTree from '@/components/inputTree'
import UpdateHandle from "@/components/updateHandle";

import AvatarImg from '@/assets/avatar.svg'

import s from "./index.module.less";

const Page = ({
  userInfo,
  onSwitchSoftwares
}: any) => {
  const {
    filterConfig,
  }: any = useContext(indexContext)
  const context: any = useContext(ConfigContext);

  const softwaresItem = filterConfig?.softwares?.softwaresItem

  const [portIndex, setProtIndex] = useState(0);

  const items: MenuProps['items'] = [
    {
      label: (
        <span className={s.dropdownMenu} onClick={() => {
        }}>
          设置
        </span>
      ),
      key: '0',
    },
    {
      label: (
        <span className={s.dropdownMenu} onClick={() => {
          checkUpdate()
        }}>
          检查更新
        </span>
      ),
      key: '1',
    },
    {
      label: (
        <span className={s.dropdownMenu} onClick={() => {
        }}>
          关于
        </span>
      ),
      key: '2',
    },
    {
      type: 'divider',
    },
    {
      label: (
        <span className={s.dropdownMenu} onClick={() => {
          openLoginWin()
        }}>
          退出
        </span>
      ),
      key: '3',
    },
  ];
  const items2: any = context?.moduleSelect || [];
  const tabsItems: TabsProps['items'] = [
    {
      key: '1',
      label: <div className={s.tabsMain}>
        <p>
          <Icon size={22} type='icon-modle' />
        </p>
        模型
      </div>,
    },
    {
      key: '2',
      label: <div className={s.tabsMain}>
        <p>
          <Icon size={22} type='icon-texture' />
        </p>
        材质
      </div>,
    },
  ];

  return (
    <div className={s.leftBox}>
      <div className={s.avatar}>
        <Avatar size={34} src={userInfo?.avatar || AvatarImg} style={{ backgroundColor: '#fff' }} />
        <span className={s.name}>
          {userInfo?.nickname}
        </span>
        <Dropdown trigger={['click']} menu={{ items }} className={s.dropdown} overlayClassName={s.dropdownOverlay}>
          <MenuOutlined />
        </Dropdown>
      </div>

      <div className={s.portCut}>
        <Dropdown
          overlayClassName={s.dropdownOverlay}
          trigger={['click']}
          menu={{
            items: items2,
            onClick: ({ key }) => {
              setProtIndex(Number(key))
            }
          }}
        >
          <div className={s.portCutBox}>
            {items2?.[portIndex]?.label}
            <DownOutlined style={{ fontSize: 12, marginLeft: 10 }} />
          </div>
        </Dropdown>
      </div>

      <div className={s.tabs}>
        <Tabs defaultActiveKey="1" items={tabsItems} onChange={(key: string) => {
          console.log(key);
        }} />

        <div className={s.tabsContainer}>
          <InputTree
            treeData={filterConfig?.category?.list || []}
          />
        </div>
      </div>
      
      <div className={s.model}>
        <h4 className={s.title}>
          模型格式
        </h4>
        <Dropdown
          trigger={['click']}
          overlayClassName={s.dropdownOverlay}
          menu={{
            items: filterConfig?.softwares?.list?.map((item: any, i: number) => {
              return {
                key: i,
                label: (
                  <div style={{ display: 'flex' }}>
                    <Icon size={20} type={item.icon} />
                    <i style={{ marginLeft: '5px' }}>{item.name}</i>
                  </div>
                ),
              }
            }),
            onClick: ({ key }) => {
              onSwitchSoftwares({ softwaresIndex: Number(key) })
            }
          }}
        >
          <div className={s.format}>
            {softwaresItem?.icon && <Icon size={24} type={softwaresItem?.icon} />}
            <i>{softwaresItem?.name}</i>
            <SwapOutlined style={{ fontSize: 12, transform: 'rotate(90deg)', marginLeft: 'auto' }} />
          </div>
        </Dropdown>
        <Space className={s.title}>
          默认渲染器
          <Tooltip title="模型宫格视图中模型预览图上展示的下载状态、导入操作(拖拽导入、点击导入)将以设定的默认渲染器为准。">
            <span><InfoCircleFilled /></span>
          </Tooltip>
        </Space>
        <ul className={s.rendererList}>
          {
            softwaresItem?.renderers?.map((item: any, index: number) =>{
              return <li
                key={item.value}
                className={softwaresItem.rendererIndex === index ? s.cur : ''}
                onClick={() => {
                  onSwitchSoftwares({ rendererIndex: index })
                }}
              >
                <Badge dot>
                  <Tooltip title={item.title}>
                    <div className={s.icon}>
                      <Icon size={18} type={item.icon} />
                    </div>
                  </Tooltip>
              </Badge>
            </li>})
          }
        </ul>
      </div>
      <UpdateHandle />
    </div>
  );
}

export default Page;
