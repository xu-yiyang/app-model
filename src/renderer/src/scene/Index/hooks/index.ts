import { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react'
import { get_upload_policy, getFilterConfig, modelList, model_image_search } from "@/scene/server";
import { Form, message } from 'antd'
import tool from '@/utils/md5.js'
import { isFileImage } from '@/utils'

interface DownloadProgress {
  taskid: string
  model_identity: string
  resource_id: string
  percent: number
}

export const useIndex = () => {
  const [form] = Form.useForm();
  const [curInfo, setCurInfo] = useState<any>(null); // 当前选择的模型详情数据
  const [loadingFooter, setLoadingFooter] = useState(false); // 底部loading
  const [loadingCenter, setLoadingCenter] = useState(false); // 列表loading
  const [userInfo, setInfo] = useState({}) // 用户信息
  const [list, setList] = useState<any[]>([]);
  const [listTotal, setListTotal] = useState(0); // 模型总数
  const [searchImg, setSearchImgS] = useState(''); // 搜索图片
  const searchImgRef = useRef(searchImg); // 搜索图片
  const setSearchImg = (val: string) => {
    setSearchImgS(val)
    searchImgRef.current = val
  }
  const [page, setPageData] = useState({
    page: 1,
    size: 60,
  }); // 分页数据
  
  // 筛选项配置项
  const [filterConfig, setFilterConfig] = useState<any>({
    category: {
      title: '家居分类',
      list: [],
      key: 'category',
    },
    brand: {
      title: '家具品牌',
      list: [],
      key: 'brand',
    },
    softwares: {
      title: '软件平台',
      list: [],
      key: 'softwares',
      softwaresItem: {}, // 当前选择的模型格式数据
    },
    usage_scenario: {
      title: '应用场景',
      list: [],
      key: 'usage_scenario',
    },
    style: {
      title: '模型风格',
      list: [],
      key: 'style',
    },
  })

  const softwaresItem = filterConfig?.softwares?.softwaresItem
  // 当前选择的默认渲染器
  const curRenderers = softwaresItem?.renderers?.[softwaresItem?.rendererIndex] || null

  // 当前审核数据
  const auditData = curInfo?.resources?.find((item: any) => {
    return (item.software_id === softwaresItem?.id) || (item.software_name === softwaresItem?.name)
  })

  // 获取子组件的方法
  const childCenterRef = useRef<any>(null);
  const upDataInfo = async () => {
    childCenterRef.current.modelInfo()
  }

  // 当前下载进度
  const [progressObj, setProgressObj] = useState<any>({})
  useEffect(() => {
    window.api.setModelDownloadProgress((data) => {
      if (data) {
        const obj: any = { ...progressObj }
        const is = data?.percent === 100
        obj[data.taskid] = {
          isDown: is, // 是否下载
          isProgress: !is, // 是否正在下载
          percent: data?.percent // 下载进度
        }
        setProgressObj(obj)
      }
    })
  }, [progressObj])

  /**
   * params：自定义参数
   * isScroll：是否滚动加载
   */
  const getModelList = useCallback(async (params = {}, isScroll = false) => {
    if(searchImgRef.current) {
      const res = await model_image_search({
        url: searchImgRef.current
      })
      if(res.success) {
        setList(res.data.records)
      }
    } else {
      const p = {...page}
      if(isScroll) {
        p.page += 1
      } else {
        p.page = 1
        document.getElementById('centerL')?.scrollTo(0, 0) // 将滚动条置顶
      }
      setPageData(p)
      const cur = filterConfig?.softwares?.softwaresItem
      const curRenderers = cur?.renderers?.[cur?.rendererIndex] || null
      const res: any = await modelList({
        ...p,
        ...form.getFieldsValue(),
        ...params,
        software_ids: [cur?.id],
        renderer_ids: [curRenderers.value],
        sub_state: ["pending"] 
      })
      if (res.success) {
        let arr: any = []
        if (isScroll) {
          // 是否滚动加载
          arr = [...list, ...res.data.models]
        } else {
          arr = res.data.models
        }
        setList(arr)
        setListTotal(res.data.total)

        const obj = {...progressObj}
        arr.map(async (item: any, i1: number) => {
          item?.resources?.forEach(async (_: any, i2: number) => {
            const is_exist = await window.api.is_resource_exist({ model_identity: item.identity, renderer_id: _.renderer_id })
            obj[_.resource_id] = {
              isDown: is_exist, // 是否以下载
              isProgress: false, // 是否正在下载
              percent: 0 // 下载进度
            }
            if((i1 === arr.length - 1) && (i2 === item?.resources.length - 1)) {
              setProgressObj(obj)
            }
          })
        })
      } else {
        setListTotal(0)
      }
      return res?.data?.models || []
    }
  }, [list, searchImg, progressObj])

  useEffect(() => {
    // 获取筛选项配置信息
    const getConfigList = async () => {
      const res: any = await getFilterConfig()
      if(res.success) {
        const config: any = { ...filterConfig }
        Object.keys(res.data).forEach(key => {
          if (key === 'softwares') {
            config[key].softwaresItem = {
              ...res.data[key]?.[0],
              rendererIndex: 0
            }
          }
          if (config[key]) {
            config[key].list = res.data[key]
          }
        })
        setFilterConfig(config)
      }
    }
    // 计算当前一屏能加载多少个模型个数
    const getSize = () => {
      const rightDom = document.getElementById('rightDom')
      const p = page
      if (rightDom) {
        const clientWidth = rightDom.clientWidth // 容器宽度
        const clientHeight = rightDom.clientHeight // 容器高度 - RightTop头部高度
        const carNum = Math.trunc(clientWidth / 102) // 一排的卡片个数
        const listContainerWidth = clientWidth / carNum // 每个卡片的宽度
        const wNum = Math.trunc(clientWidth / listContainerWidth);
        const hNum = Math.trunc(clientHeight / listContainerWidth);
        p.size = wNum * hNum
        setPageData(p)
      }
      return p
    }
    // 获取用户信息
    const onAccountInfo = async () => {
      // const res: any = await account_info({})
      // if (res.success) {
      //   setInfo(res.data)
      // }
      const info = JSON.parse(localStorage.getItem('accountInfo') || '{}')
      setInfo(info)
    }
    onAccountInfo()
    getConfigList().then(() => {
      const p = getSize()
      window.addEventListener('resize', () => getSize(), false);
      getModelList(p)
    })
  }, [])

  const getSearchImg = (file: any) => {
    // 检查文件类型，确保是图片
    if(!file) return;
    const name = file.name.split('.').pop().toLocaleLowerCase()
    if (!isFileImage(file)) {
      return message.error('请上传jpg/jpeg/png的图片')
    }
    form.resetFields() // 图片筛选后清空筛选项
    setLoadingCenter(true)
    tool.md5(file).then((md5Value) => {
      get_upload_policy({
        cat: 'piece',
        md5_sum: md5Value,
        upload_method: 'POST',
        file_suffix: name,
        content_type: file.type,
      }).then((res: any) => {
        setLoadingCenter(false)
        if (res.success) {
          setSearchImg(res.data.upload_url)
          getModelList({}, true)
        } else {
          message.error(res.message)
        }
      })
    }).catch((err) => {
      // 处理异常
      setLoadingCenter(false)
      console.error(err)
    })
  }

  const countRef = useRef<any>(null);
  useLayoutEffect(() => {
    // 图片粘贴搜索
    document.getElementById('paste')?.addEventListener("paste", (event) => {
      if (event.clipboardData && !event.clipboardData.getData("text/plain")) {
        const file = event.clipboardData.files[0]
        getSearchImg(file)
      }
    });

    // 图片拖拽搜索
    const dropzone = document.getElementById('dropzone');
    if(dropzone) {
      dropzone.addEventListener('dragover', function (e) {
        // 元素上移动
        e.preventDefault();
      });

      dropzone.addEventListener('dragenter', function (e) {
        // 移到元素上触发
        e.preventDefault();
        countRef.current = e.target;
        dropzone.classList.add('activity')
      });

      dropzone.addEventListener('dragleave', function (e) {
        // 离开元素上触发
        e.preventDefault();
        if(countRef.current === e.target){
          dropzone.classList.remove('activity')
        }
      });

      dropzone.addEventListener('drop', function (e) {
        // 元素上释放
        e.preventDefault();
        dropzone.classList.remove('activity')
        // 获取拖拽的文件
        const file = e?.dataTransfer?.files[0];
        file && getSearchImg(file)
      });
    }
  }, [])

  return {
    form,
    userInfo,
    setCurInfo,
    getModelList,
    filterConfig,
    setFilterConfig,
    list,
    setLoadingFooter,
    childCenterRef,
    curRenderers,
    progressObj,
    setProgressObj,
    curInfo,
    loadingFooter,
    loadingCenter,
    auditData,
    upDataInfo,
    setList,
    listTotal,
    searchImg,
    setSearchImg,
    getSearchImg,
  }
};
