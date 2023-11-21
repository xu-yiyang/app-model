import axios from 'axios'
import {
  message,
} from 'antd';
import { openLoginWin } from '@/windows/actions'

const ins: any = axios.create({
})

ins.interceptors.request.use(
  async (_axiosConfig: any) => {
    const axiosConfig = {
      isBaseURL: true, // 是否重定向
      isPayload: true, // 是否加密数据
      ..._axiosConfig,
    }
    const isUser = (axiosConfig.portType || process.env.RENDERER_VITE_ALL_APP_TYPE) === 'user' // 是否用户侧
    if (axiosConfig.isBaseURL) {
      axiosConfig.baseURL = isUser ? process.env.RENDERER_VITE_BASE_URL_USER : process.env.RENDERER_VITE_BASE_URL_ADMIN
    }
    const timestamp = new Date().getTime()
    const token = localStorage.getItem("token")
    const dataString = JSON.stringify(axiosConfig.data || {})
    if (axiosConfig.isPayload) {
      axiosConfig.headers = {
        ...axiosConfig.headers,
        'X-API': isUser ? 'ModelUserClient' : 'ModelManagementClient',
        'X-Version': 1,
        'X-Timestamp': timestamp,
        'X-Token': token || undefined,
      }
      const payload: string = await window.api.encrypt_content(dataString)
      axiosConfig.data = {
        payload
      }
    }
    return axiosConfig;
  },
  (error: any) => {
    console.log('request error', error);
  }
)

ins.interceptors.response.use(({ data, config }: any) => {
  if (data.code === 0) {
    if(config.url === '/v1/user_client/asset/model') {
      // 客户端和审核端的模型列表返回字段不一样，在这里做转化
      return {
        success: true,
        ...data,
        data: {
          ...data.data,
          models: data.data.records.map((_: any) => {
            return {
              ..._,
              id: _.identity,
              preview_img: _.cover_img,
              name: _.name,
            }
          })
        }
      }
    }
    return {
      ...data,
      success: true,
    }
  } else if (config.getAll) {
    return {
      success: true,
      data: data
    }
  } else if (data.code === 40002) {
    message.error('对不起，登录已过期，请重新登陆')
    openLoginWin()
  } else if(data.code === 40003) {
    message.error('对不起，您没有访问权限')
  }
  return {
    ...data,
    success: false,
  }
}, (error: any) => {
  if (error?.response?.status === 401) {
    message.error('对不起，登录已过期，请重新登陆')
    openLoginWin()
    return;
  }
  console.log(error, 'error');
  return {
    ...error,
    ...(error?.response?.data || {}),
    success: false,
  }
})

export default ins
