import {
  Space,
} from 'antd';
import Icon from '@/components/icon'

export default {
  isShowRecommendation: false, // 是否显示推荐模块
  btnIcon: 'icon-chulishenhe', // 底部按钮图标，icon-gouwuche
  moduleSelect: [ // 左侧模块切换选项
    {
      key: 0,
      label: (
        <Space>
          <Icon size={12} type='icon-chulishenhe' />
          处理审核
        </Space>
      ),
    },
    {
      key: 1,
      label: (
        <Space>
          <Icon size={12} type='icon-chulikesu' />
          处理客诉
        </Space>
      ),
    },
  ]
}
