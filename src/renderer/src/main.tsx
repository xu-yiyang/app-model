import ReactDOM from "react-dom/client";
import { CreateAppRouter } from '@/components'
import { routesConfig } from './router-config'
import { openDevTools } from '@/windows/actions'
import "./styles.less";

import { ConfigProvider, message } from 'antd';
import zhCN from 'antd/locale/zh_CN';

// import { vconsole } from './vconsole';
const isVconsole = JSON.parse(localStorage.getItem('accountInfo') || `{}`).vconsole
if (isVconsole) {
  // vconsole(routesConfig, history)
  setTimeout(() => {
    openDevTools()
  }, 100)
}

message.config({
  maxCount: 1, // 最多同时显示1个message
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ConfigProvider
    locale={zhCN}
    theme={{
      token: {
        borderRadius: 2,
      },
      components: {
        Button: {
          colorPrimary: '#1890FF',
        },
        Cascader: {
          controlItemBgActive: '#1890FF',
          controlItemBgHover: '#202024',
          colorBgContainer: '#1890FF',
          colorBgContainerDisabled: '#1890FF',
          colorBorder: '#1890FF',
          colorHighlight: '#1890FF',
          colorPrimaryBorder: '#1890FF',
          colorPrimaryHover: '#1890FF',
        },
        Select: {
          controlItemBgActive: '#1890FF',
          controlItemBgHover: '#202024',
          colorBgContainer: '#1890FF',
          colorBgContainerDisabled: '#1890FF',
          colorBorder: '#1890FF',
          colorHighlight: '#1890FF',
          colorPrimaryBorder: '#1890FF',
          colorPrimaryHover: '#1890FF',
        }
      },
    }}
  >
    <CreateAppRouter routesConfig={routesConfig} />
  </ConfigProvider>
);
