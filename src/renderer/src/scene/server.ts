import axios from '@/utils/network';

const isUser = process.env.RENDERER_VITE_ALL_APP_TYPE === 'user'
/**
 * 获取资源下载包信息
 * @param params 
 * @returns 
 */
 export const get_resource_package_info = (params: any) => {
  const url = isUser ? '/v1/user_client/asset/model/resource_package_info' : '/v1/management_client/asset/model/resource_package_info'
  return axios.post(url, params)
}

export const account_info = (params: any) => {
  return axios.post('/v1/management_client/account_info', params)
}

// 模型列表
export const modelList = (params: any) => {
  const url = isUser ? 'user_client' : 'management_client'
  const d = isUser ? {
    keyword: params.keyword,
    page: params.page,
    size: params.size,
    category_id: params.category_ids?.[0],
    style_id: params.model_style_ids,
    brand_id: params.brand_ids,
    software_id: params.software_ids?.[0],
    renderer_id: params.renderer_ids?.[0],
    usage_scenario_id: params.usage_scenario_ids,
  } : params
  return axios.post(`/v1/${url}/asset/model`, d)
}

// 获取列表筛选项
export const getFilterConfig = () => {
  return axios.get(process.env.RENDERER_VITE_API_CONFIG_URL, {
    baseURL: '',
    getAll: true,
  })
}

// 获取模型详情
export const getModelInfo = (params: any) => {
  const url = isUser ? 'user_client/asset/model/detail' : 'management_client/asset/model/info'
  return axios.post(`/v1/${url}`, {
    [isUser ? 'identity' : 'id']: params.id
  })
}

// 获取审核模型详情
export const getAuditModelInfo = (params: any) => {
  return axios.post(`/v1/management_client/asset/audit/model/info`, params)
}

// 审核模型
export const setModelEdit = (params: any) => {
  return axios.post('/v1/management_client/asset/audit/model/resource/audit', params)
}

export const updataAuditInfo = (params: any) => {
  return axios.post('/v1/management_client/asset/audit/model/update', params)
}

// 登录接口
export const login = async (params: any) => {
  const url = isUser ? 'user_client' : 'management_client'
  return axios.post(`/v1/${url}/login`, {
    ...params
  })
}

export const get_recharge_suite = async () => {
  return axios.post('/v1/public/get_recharge_suite', {}, {
    portType: 'user',
  })
}

export const get_task_code = async (params: any) => {
  return axios.post('/v1/user_client/recharge/get_task_code', params, {
    portType: 'user',
  })
}

// 获取购买状态
export const shopState = async (params: any) => {
  return axios.post('/v1/user_client/purchase/state', params, {
    portType: 'user',
  })
}

// 支付code
export function pay_task_code(params: any) {
  return axios.post('/v1/user_client/purchase/pay_task_code', params, {
    portType: 'user',
  })
}

// 购买资源
export function purchase_asset(params: any) {
  return axios.post('/v1/user_client/purchase/purchase_asset', params, {
    portType: 'user',
  })
}

// 获取当前余额和抵扣券
export function current_currency() {
  return axios.post('/v1/user_client/purchase/current_currency', {}, {
    portType: 'user',
  })
}

// 获取购买定价信息
export function charge_info(params: any) {
  return axios.post('/v1/user_client/purchase/charge_info', params, {
    portType: 'user',
  })
}

// 以图搜图
export function model_image_search(params: any) {
  return axios.post('/v1/asset/model_image_search', params)
}



// 获取上传凭证
export function get_upload_policy(params: any) {
  return axios.post('/v1/management_client/common/get_upload_policy', params)
}
// 请求文件解密
export function resource_decrypt(params: any) {
  return axios.post('/v1/management_client/common/resource_decrypt', params)
}
// 请求文件解密
export function resource_decrypt_result(params: any) {
  return axios.post('/v1/management_client/common/resource_decrypt_result', params)
}
// 请求文件解密
export function get_upload({ url, params, headers, callback, other }: any) {
  return axios.post(url, params, {
    headers,
    ...{
      isPayload: false,
      isBaseURL: false,
      ...other,
    },
    onUploadProgress: (progressEvent) => {
      const { loaded, total } = progressEvent;
      const progress = Math.round((loaded / total) * 100);
      callback(progress)
    },
  })
}