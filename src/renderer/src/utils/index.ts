import React from 'react';
import { loadable } from '@/components';
import {
  get_resource_package_info,
  get_upload_policy,
  resource_decrypt,
  resource_decrypt_result,
  get_upload
} from '@/scene/server';
import { message } from 'antd';
import tool from '@/utils/md5.js'

export const ConfigContext = React.createContext({});

// 判断是否对象
export const isObject = (value: any) => {
  if ((Object.prototype.toString.call(value) === '[object Object]')) {
    return true
  }
  return false
}

// 判断是否数组
export const isArray = (value: any) => {
  if ((Object.prototype.toString.call(value) === '[object Array]')) {
    return true
  }
  return false
}

// 判断是否字符串
export const isString = (value: any) => {
  if ((Object.prototype.toString.call(value) === '[object String]')) {
    return true
  }
  return false
}

/**
 * 防抖函数
 * @param func 防抖的function
 * @param delay 防抖延迟
 */
export const debounce = (func: Function, delay: number): Function => {
  let timer: any;
  return function (this: any, ...args: any) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

/**
 * 节流
 * @param fn 函数
 * @param interval 间隔时间，毫秒
 */
export function throttle(fn: Function, interval: number = 200): Function {
  let flag = false;
  return function (...args: any): void {
    if (!flag) {
      flag = true;
      setTimeout(() => {
        flag = false;
        fn.call(null, ...args); // this 报语法错误，先用 null
      }, interval);
    }
  };
}

// 获取配置组件
export const getComponentConfig = (module: any) => {
  if (isString(module) || (isObject(module) && !module.componentConfig)) {
    return loadable(
      () =>
        Promise.all([
          import(`@/scene/index`),
          import(`@/scene/${module.componentName || module}/index.tsx`),
        ]).then(([index, components]) => {
          return index.default(components.default)
        }).catch(err => {
          console.error(err, 'getComponentConfig');
        })
    )
  } else if (isObject(module)) {
    const name = `scene-${process.env.RENDERER_VITE_ALL_APP_TYPE || 'admin'}-config`
    return loadable(
      () =>
        Promise.all([
          import(`@/scene/index`), // 主文件
          import(`@/scene/${module.componentName}/index.tsx`),
          import(`@/scene-default-config/${module.componentConfig}/config.tsx`), // 默认配置文件
          import(`@/${name}/${module.componentConfig}/config.tsx`),
        ]).then(([index, components, defaultConfig, componentsConfig]) => {
          return index.default(components.default, {
            ...defaultConfig.default,
            ...componentsConfig.default,
          })
        }).catch(err => {
          console.error(err, 'getComponentConfig');
        })
    )
  }
}

/**
 * 下载模型
 * @param model_identity 模型id
 * @param resources 当前渲染器
 * @param callback 下载完成回调
 */
export const downFun = (model_identity: any, resources: any, callback?: any) => {
  const { resource_id, renderer_id } = resources
  get_resource_package_info({ 'asset_resource_id': resource_id }).then(async (res: any) => {
    if(res.success) {
      // {
      //   "model_identity": "5336214397",
      //   "resource_id": "8229c8c5bee54161a88692bfc66e21cc",
      //   "resources": [
      //     {
      //       "file_url": "http://1hmx-new-dev.cn-wlcb.ufileos.com/assets/6d17d40c60fb3853e9316a2c86675e54?UCloudPublicKey=TOKEN_22229ff5-e713-48a4-b085-4965f2b5c458&Expires=1697181545&Signature=eujGg/pJBpx1klbZVZU3URRo5Xc=",
      //       "md5": "6d17d40c60fb3853e9316a2c86675e54",
      //       "name": "Soft Velvet Stool (14_V-ray).max",
      //       "rela_path": "fc97bedc-2021-4dee-b27c-965eb65b457c/Soft Velvet Stool (14_V-ray).max",
      //       "sha256": "357a44dd311ee41be26eb0059b02b14f55ff2679e1f9c0dfb4a4d36bd7cb3f9f",
      //       "size": 4018176
      //     },
      //   ],
      //     "renderer_name": "Vray"
      // }
      window.api.download_resource({
        'taskid': resource_id,
        'packages': {
          model_identity,
          resources: res.data,
          renderer_id,
        }
      }).then(() => {
        console.log('全部下载完成');
        callback?.()
      }).catch(err => {
        message.error(err.message)
      })
    } else {
      message.error(res.msg)
    }
  })
}

// 生成本地预览图
export const getObjectURL = (file: any) => {
  var url: any = null
  if (window.createObjectURL !== undefined) {
    // basic
    url = window.createObjectURL(file)
  } else if (window.URL !== undefined) {
    // mozilla(firefox)
    url = window.URL.createObjectURL(file)
  } else if (window.webkitURL !== undefined) {
    // webkit or chrome
    url = window.webkitURL.createObjectURL(file)
  }
  return url
}
  
// 解密图片
export const decryptImg = async ({
  upload_url,
  cat,
  resolve,
  reject
}: any) => {
  const res = await resource_decrypt({
    key: upload_url, // 云存储中的文件路径
    cat: cat === 'encrypted_headimg' ? cat : undefined
  })
  if (res.success) {
    const f = async () => {
      const res2 = await resource_decrypt_result({
        task_id: res.data.task_id // 云存储中的文件路径
      })
      if (res2.success) {
        if (!res2.data) {
          // 轮询解状态
          setTimeout(f, 2000)
        } else {
          // 有数据，解析成功
          const d = res2.data
          resolve({
            preview: d.preview || d.url,
            path: d.current_path
          })
        }
      } else {
        // 解析失败
        message.error(res2.message)
        reject(res2)
      }
    }
    f()
  } else {
    message.error(res.message)
    reject(res)
  }
}


export const isFileImage = (file: any) => {
  const n = file.name.split('.').pop().toLocaleLowerCase()
  if (file?.type?.match(/^image\//) && ['png', 'jpg', 'jpeg'].includes(n)) {
    return true
  } else {
    message.error('请上传jpg/jpeg/png的图片')
    return false
  }
}

export function uploadFile({
  file,
  cat = 'img',
  isImg = true, // 上传的是否是图片
  type = '', // 上传类型，文件通过upload上传
}: any) {
  return new Promise((resolve, reject) => {
    const name = file.name.split('.').pop().toLocaleLowerCase()
    let decrypt = false // 是否是加密文件
    if(isImg) {
      if (isFileImage(file)) {
        // isLoadImg.value = true
      } else {
        reject('请上传jpg/jpeg/png的图片')
        return
      }
    }
    const fun = () => {
      tool.md5(file).then((md5Value) => {
        get_upload_policy({
          cat,
          md5_sum: md5Value,
          upload_method: 'POST',
          file_suffix: name,
          content_type: file.type,
        }).then((res: any) => {
          if (res.success) {
            if(type !== 'upload') {
              let formData = new FormData()
              formData.append('file', file)
              formData.append('Authorization', res.data.authorization)
              formData.append('FileName', res.data.filename)
              formData.append('Content-Type', file.type)
              get_upload({
                url: res.data.upload_url,
                params: formData,
                headers: {
                  'Content-MD5': md5Value,
                }
              }).then((res) => {
                // isLoadImg.value = false
                if (decrypt) {
                  decryptImg({
                    upload_url: res.data.filename,
                    cat,
                    resolve,
                    reject
                  })
                } else {
                  resolve({
                    preview: getObjectURL(file),
                    path: res.data.filename
                  })
                }
              })
            } else {
              resolve({
                filename: res.data.filename,
                uploadUrl: res.data.upload_url,
                authorization: res.data.authorization,
                data: {
                  'Content-Type': file.type,
                  'Authorization': res.data.authorization,
                  'FileName': res.data.filename,
                },
                headers: {
                  'Content-MD5': md5Value,
                }
              })
            }
          } else {
            // isLoadImg.value = false
            message.error(res.message)
            reject(res)
          }
        })
      }).catch((err) => {
        // 处理异常
        // isLoadImg.value = false
        console.error(err)
        reject(err)
      })
    }
    const reader: any = new FileReader()
    reader.readAsArrayBuffer(file);
    reader.onloadend = async (res: any) => {
      var byts = new Uint8Array(reader.result);
      const d = [byts[0].toString(16), byts[1].toString(16)].join('')
      decrypt = ['887d', '877d', '847d'].includes(d)
      fun()
    }
  })
};