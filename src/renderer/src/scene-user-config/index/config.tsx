import {
  Space,
} from 'antd';
import Icon from '@/components/icon'

export default {
  isShowRecommendation: true, // 是否显示推荐模块
  btnIcon: 'icon-gouwuche', // 底部按钮图标
  moduleSelect: [ // 左侧模块切换选项
    {
      key: 0,
      label: (
        <Space>
          <Icon size={14} type='icon-yunduan' />
          云端
        </Space>
      ),
    },
    {
      key: 1,
      label: (
        <Space>
          <Icon size={12} type='icon-yixiazai1' />
          已下载
        </Space>
      ),
    },
    {
      key: 2,
      label: (
        <Space>
          <Icon size={14} type='icon-shoucang' />
          收藏
        </Space>
      ),
    },
  ]
}
