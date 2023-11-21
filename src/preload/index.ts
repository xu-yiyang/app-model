import fs from 'fs'
import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { machineIdSync } from 'node-machine-id';
const crypto = require('crypto')
// import NodeRSA from 'node-rsa';
import SparkMD5 from "spark-md5";
const path = require('path');
const http = require('http');
// const encrypt = crypto.privateEncrypt(privateKey, Buffer.from(secret));
// const os = require('os');
// // 获取系统标识符
// const systemID = os.hostname();
// // 获取CPU核心数量
// const cpuCores = os.cpus().length;
// console.log('MD5:', md5(`${systemID}${cpuCores}`));

interface IApi {
  operationWindow: any; // 监听send事件，无返回值
  handleWindow: any; // 监听sendSync事件，有返回值
  machineId: any; // 获取设备id
  encrypt_content: any; //请求数据加密
  downloadProgress: any;
  is_resource_exist: any; // 检查该模型是否存在
  download_resource: any; // 下载模型
  setModelDownloadProgress: any; // 设置下载进度函数
  openModelPath: any; // 打开模型下载文件夹
  rmdirModelFile: any; // 删除模型文件夹
  updateHandle: ({ // 检查更新
    callback,
  }: {
    callback: Function,
  }) => any;
  startDragFile: ({
    model_identity,
    renderer_name,
    renderer_id,
    imgUrl,
  }: {
    model_identity,
    renderer_name,
    renderer_id,
    imgUrl,
  }) => any,
  getReplaceFile: ({ // 获取回传文件
    model_identity,
    renderer_name,
    renderer_id,
  }: {
    model_identity,
    renderer_name,
    renderer_id,
  }) => any,
  copePath: ({ // 复制路径
    model_identity,
    renderer_id,
  }: {
    model_identity,
    renderer_id,
  }) => any,
}
interface IDownload {
  taskid: string,
  packages: any,
}

/**
 * 节流
 * @param fn 函数
 * @param interval 间隔时间，毫秒
 */
function throttle(fn: Function, interval: number = 200): Function {
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

const operationWindow = (actionType, other = {}) => ipcRenderer.send('operation-window', actionType, other)
const syncOperationWindow = (actionType, other = {}) => ipcRenderer.sendSync('operation-window', actionType, other)
const handleWindow = (actionType, other = {}) => ipcRenderer.invoke('handle-window', actionType, other)

// console.log(path.parse(__dirname),'__dirname');
// console.log(syncOperationWindow('getPathExe'),'getPathExe');
// console.log(syncOperationWindow('getAppPath'),'getAppPath');
// console.log(path.parse(syncOperationWindow('getAppPath')),'getAppPath');
// console.log(path.dirname(__filename),222);
// console.log(syncOperationWindow('isPackaged'),'isPackaged');
// 获取下载目录
let downloadsUrl = '' // 软件安装目录下的/resources路径
let downloadsUrlModel = ''
const getDownloadsFolder = () => {
  // 文件下载存放位置
  let downloadsFolder = ''
  if(!syncOperationWindow('isPackaged')) {
    downloadsFolder = path.parse(__dirname).dir
  } else {
    downloadsFolder = path.parse(syncOperationWindow('getAppPath')).dir
  }
  // console.log('__dirname:', downloadsFolder, __filename, path.parse(__dirname), process.cwd())
  downloadsUrl = downloadsFolder
  downloadsUrlModel = path.join(downloadsFolder, 'model')
  return downloadsUrlModel
}

// 判断文件是否存在
const fileExists = (path: any) => {
  return new Promise((resolve) => {
    // 使用 fs.access 检查文件是否存在
    fs.access(path, fs.constants.F_OK, (err) => {
      if (err) {
        resolve(false); // 文件不存在，返回 false
      } else {
        resolve(true); // 文件存在，返回 true
      }
    });
  });
}

// 所有资源的字节总和
const total_size = (resources) => {
  const total_size = resources.reduce((pre, item) => {
    pre += item.size
    return pre
  }, 0)

  return total_size
}

// 计算下载进度
const countProgress = (received, total) => {
  var percentage = (received * 100) / total;
  // console.log(percentage + "% | " + received + " bytes out of " + total + " bytes.");
  return Math.round(percentage)
}

const md5 = (value: string) => {
  let spark = new SparkMD5(); //追加数组缓冲区。
  spark.append(value);
  return spark.end()
}

const splitString = (str: string, chunkSize: number) => {
  var chunks: string[] = [];
  for (var i = 0, len = str.length; i < len; i += chunkSize) {
    chunks.push(str.substring(i, i + chunkSize));
  }
  return chunks;
}

// 获取模型url地址
const getModelFileUrl = ({
  model_identity, // 模型id
  renderer_id, // 渲染器id
}) => {
  const downloadsFolderModel = downloadsUrlModel || getDownloadsFolder()
  const name = `${model_identity}_${renderer_id}`
  const url = path.join(downloadsFolderModel, name)
  return url
}

let modelDownloadProgress: any = null

const env: any = import.meta.env

const api: IApi = {
  operationWindow,
  handleWindow,
  machineId: machineIdSync(),
  setModelDownloadProgress: (callback) => {
    modelDownloadProgress = callback
  },
  encrypt_content: (body) => {
    return new Promise((resolve, rejects) => {
      fs.readFile(path.join(__dirname, `../../resources/pubkey/${env.MODE}-${env.RENDERER_VITE_ALL_APP_TYPE}-pubkey.pem`), 'utf8', (err, data) => {
        if (err) rejects(err);
        const encryptedData: string[] = []
        const encryptArr = splitString(body, 200)
        // 分段加密数据，以200个字段进行加密，避免数据过长导致rsa加密报错
        encryptArr.forEach(item => {
          encryptedData.push(crypto.publicEncrypt({
            key: data,
            padding: crypto.constants.RSA_PKCS1_PADDING
          }, Buffer.from(item)).toString('base64'));
        })
        console.log(body,'加密数据');
        // const encrypt = new NodeRSA(data);
        // encrypt.setOptions({ encryptionScheme: 'pkcs1' })
        // const encryptedData = encrypt.encrypt(body, 'base64');
        // const decrypt = new NodeRSA(privateKey);
        // decrypt.setOptions({ encryptionScheme: 'pkcs1' })
        // const decryptedData = decrypt.decrypt(encryptedData, 'utf8');
        // console.log('Decrypted Data:', encryptedData, decryptedData);
        resolve(encryptedData);
      });
    })
  },
  is_resource_exist: async (packages) => {
    const fileUrl = getModelFileUrl({
      model_identity: packages.model_identity,
      renderer_id: packages.renderer_id,
    })
    const url = path.join(fileUrl, `.${packages.model_identity}.json`)
    const exists = await fileExists(url)
    return exists
  },
  download_resource: ({
    taskid,
    packages,
  }: IDownload) => {
    const downloadsFolderModel = downloadsUrlModel || getDownloadsFolder()
    return new Promise(async (resolve, reject) => {
      const createModel = () => {
        const url = getModelFileUrl({
          model_identity: packages.model_identity,
          renderer_id: packages.renderer_id,
        })
        const jsonUrl = path.join(url, `.${packages.model_identity}.json`)
        fileExists(jsonUrl).then(exists2 => {
          if (exists2) {
            reject({
              message: '您已经下载过该模型'
            })
          } else {
            // 创建模型文件夹，以模型id为文件名
            fs.mkdir(url, () => {
              let all_size = total_size(packages?.resources)
              let downloaded_size = 0; // 接收到的字节总数

              packages?.resources?.forEach((item) => {
                // item: {
                //   "file_url": "http://1hmx-new-dev.cn-wlcb.ufileos.com/assets/50f9c75d16332c31c872a2cbd8b16671?UCloudPublicKey=TOKEN_22229ff5-e713-48a4-b085-4965f2b5c458&Expires=1697166688&Signature=biYuzPNEyTaURqcz8qLTXsCstBE=",
                //   "md5": "50f9c75d16332c31c872a2cbd8b16671",
                //   "name": "black_leather01_diffuse.jpg",
                //   "rela_path": "e04ee901-5e75-4fb4-aee8-3168a805f8e9/Chair/Maps/black_leather01_diffuse.jpg",
                //   "sha256": "2796b312c0f88bf0516077de756e6886e3921bea196d048ba9c3735e292efe13",
                //   "size": 992175
                // }
                const fileUrl = item.file_url;
                const filePath = path.join(url, item.name.replace(".max", ".one"))

                const file = fs.createWriteStream(filePath);

                const callback = throttle(function () {
                  modelDownloadProgress({
                    taskid,
                    percent: countProgress(downloaded_size, all_size),
                  })
                }, 1000)

                http.get(fileUrl, (response) => {
                  response.pipe(file);
                  response.on('data', (chunk) => {
                    downloaded_size += chunk.length
                    callback()
                  });
                  file.on('finish', () => {
                    file.close();
                    if (all_size === downloaded_size) {
                      // 创建下载文件清单，也用于判断模型是否下载完成
                      const createJson = fs.createWriteStream(jsonUrl);
                      createJson.write(JSON.stringify(packages?.resources), (err) => {
                        if(err) {
                          reject({
                            message: '写入失败'
                          })
                        } else {
                          createJson.close(); // 结束写入
                          resolve({
                            message: '文件下载完成'
                          })
                        }
                      });
                    }
                  });
                }).on('error', (err) => {
                  console.error('下载失败:', err.message);
                  reject({
                    message: '下载失败'
                  })
                });
              })
            })
          }
        })
      }
      const exists = await fileExists(downloadsFolderModel)
      // 先判断有没有model文件夹
      if (!exists) {
        // 创建model文件夹
        fs.mkdir(downloadsFolderModel, (err) => {
          if (!err) {
            createModel()
          } else {
            alert('请以管理员身份运行软件')
          }
        })
      } else {
        createModel()
      }
    })
  },
  startDragFile: ({
    model_identity,
    renderer_name,
    renderer_id,
    imgUrl,
  }) => {
    // 读取one.ds文件内容
    fs.readFile(path.join(__dirname, '../../resources/one/one.ds'), 'utf8', (_err, data) => {
      let lines: any = data.toString().split('\n'); // 将内容按行分割
      // 当前模型存储目录
      const url = getModelFileUrl({
        model_identity,
        renderer_id,
      })
      const downloadsFolder = downloadsUrl
      let oneUrl = path.join(downloadsFolder, `${md5(new Date().getTime() + '')}_${name}_one.ds`) // 设置.ds文件名
      let isOneDs = false // 是否存在one.ds文件

      const startFun = () => {
        operationWindow('startDragFile', {
          file: path.join(oneUrl),
          imgUrl,
        })
      }

      try {
        const files = fs.readdirSync(url); // 获取url文件夹下所有文件名
        files.forEach(function (file) {
          const fileUrl = path.join(url, file)
          if (file.endsWith('.one')) {
            // 替换第 2 和第 3 行的内容
            lines[1] = `  local itemPath = @"${fileUrl}"`
            lines[2] = `  local matrender = "${renderer_name}"`;
          }
        });

        try {
          const files2 = fs.readdirSync(downloadsFolder);
          files2.forEach(function (file) {
            const fileUrl = path.join(downloadsFolder, file)
            if (file.endsWith('_one.ds')) {
              isOneDs = true
              try {
                fs.renameSync(fileUrl, oneUrl) // 将one.ds重命名
                fs.writeFile(oneUrl, lines.join('\n'), 'utf8', () => {
                  startFun()
                }); // 将one的内容重写
              } catch (error) {
                console.log(error,'errorerror');
              }
            }
          });
        } catch (err) {
          console.error('无法读取文件夹2', err);
        }

        if(!isOneDs) {
          // 如果没有ds文件，及创建一个
          const oneDs = fs.createWriteStream(oneUrl);
          oneDs.write(lines.join('\n'), () => {
            oneDs.close(); // 结束写入
            startFun()
          });
        }
      } catch (err) {
        console.error('无法读取文件夹1', err);
      }
    });
  },
  getReplaceFile: async ({
    model_identity,
    renderer_name,
    renderer_id,
  }) => {
    return new Promise(async (resolve, rejects) => {
      const fileUrl = getModelFileUrl({
        model_identity,
        renderer_id,
      })
      const url = path.join(fileUrl, `${renderer_name}.zip`)
      const exists = await fileExists(url)
      if (exists) {
        fs.readFile(url, (err, data) => {
          if (err) {
            rejects({
              message: '读取文件失败',
              data: err,
            })
          };
          // 创建File对象
          const file = new File([data], `${renderer_name}.zip`, {
            type: 'application/zip',
          });
          // 使用File对象进行操作
          resolve(file)
        });
      } else {
        rejects({
          message: '文件不存在'
        })
      }
    })
  },
  copePath: ({
    model_identity,
    renderer_id,
  }) => {
    const url = getModelFileUrl({
      model_identity,
      renderer_id,
    })
    operationWindow('copyToClipboard', {
      text: url
    })
  },
  updateHandle: (callback: any) => {
    return ipcRenderer.on('update-available', callback)
  },
  downloadProgress: (callback: any) => {
    return ipcRenderer.on('download-progress', callback)
  },
  openModelPath: ({
    model_identity,
    renderer_id,
  }) => {
    const url = getModelFileUrl({
      model_identity,
      renderer_id,
    })
    operationWindow('openPath', { url })
  },
  rmdirModelFile: ({
    model_identity,
    renderer_id,
    callbackSuccess,
    callbackErr,
  }) => {
    const url = getModelFileUrl({
      model_identity,
      renderer_id,
    })
    // 删除文件夹
    fs.rmdir(url, { recursive: true }, (err) => {
      if (err) {
        callbackErr?.('本地模型删除失败')
        console.error('Error:', err);
      } else {
        callbackSuccess?.('本地模型删除成功');
      }
    });
  },
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
