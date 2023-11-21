import { Component } from 'react';
import { ConfigContext } from '@/utils';

const indexScene = (Components: any, componentsConfig: any) => {
  return class Index extends Component {
    render() {
      if (process.env.RENDERER_VITE_ENV === 'production') {
        // 线上版本禁止右键功能
        window.addEventListener("contextmenu", (e) => e.preventDefault(), false);
      }
      
      return (
        <ConfigContext.Provider value={componentsConfig}>
          <Components />
        </ConfigContext.Provider>
      );
    }
  }
}

const index = (Components?: any, componentsConfig?: any) => {
  return indexScene(Components, componentsConfig)
}

export default index