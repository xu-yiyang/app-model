import { useState, useContext } from 'react'
import type { MenuProps } from 'antd';
import {
  Button,
  Checkbox,
  Input,
  Form,
  message,
  Upload,
  Tooltip,
  Space,
  Dropdown,
} from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  SwapOutlined,
  UnlockOutlined,
  LockOutlined,
} from '@ant-design/icons';
import s from "./index.module.less";
import RenderItem from '../../RightFooter/renderItem'
import { indexContext } from '@/scene/Index/index';
import { uploadFile } from '@/utils'
import {
  get_upload
} from '@/scene/server';
import Icon from '@/components/icon'

const Page = ({
  item,
  curInfo,
  onAudit,
}: any) => {
  const {
    progressObj, // 当前选择的渲染器数据
  }: any = useContext(indexContext)
  const progress = progressObj?.[item.resource_id]
  const list = ['approve', 'reject']
  const [type, setType] = useState('approve')
  const [isLock, setIsLock] = useState(false) // 是否被挂起，挂起后不能操作
  const [isDisabled, setDisabled] = useState(false)
  const [isSign, setIsSign] = useState(false)
  const [form] = Form.useForm();
  const onSubmit = (bool = true) => {
    form.validateFields().then((values) => {
      if (bool) {
        if(!values.is_new_file_key && type === 'approve' && !values.new_file_key) {
          return message.error('请先回传文件')
        }
        if(!values.reject_reason && type === 'reject') {
          return message.error('请先填写拒绝理由')
        }
      }
      setIsSign(!isSign)
      delete values.is_new_file_key
      onAudit({
        resource_id: item.resource_id,
        action: type,
        new_file_key: values?.new_file_key || undefined,
        renderer_name: item.renderer_name,
        ...values,
      }, !isSign)
    })
  }

  const [loading, setLoading] = useState(false)
  const [fileList, setFileList] = useState<any>([])
  // const [key, setKey] = useState('')
  // const [uploadProps, setUploadProps] = useState<any>({})
  // const props: any = {
  //   ...uploadProps,
  //   fileList,
  //   onChange: ({ file, fileList: newFileList }: any) => {
  //     if(file?.status) {
  //       setFileList(newFileList);
  //     }
  //     if(file?.status === "done") {
  //       form.setFieldValue('new_file_key', key)
  //     } else {
  //       form.setFieldValue('new_file_key', '')
  //     }
  //   },
  //   beforeUpload: (file: any) => {
  //     const types = [
  //       'application/zip',
  //       'application/x-7z-compressed',
  //       'application/x-rar',
  //       'application/x-zip-compressed',
  //       'zip',
  //       'rar',
  //       '7z',
  //     ]
  //     const type = file?.name?.split?.('.').pop()
  //     if (!types.includes(type)) {
  //       message.error('只能上传zip/rar/7z格式的压缩包')
  //       return false
  //     } else if (file.size / 1024 / 1024 > 500) {
  //       message.error('大小不超过500MB')
  //       return false
  //     }
  //     return new Promise((resolve, _reject) => {
  //       setLoading(true)
  //       uploadFile({
  //         file,
  //         cat: 'model',
  //         isImg: false,
  //         type: 'upload'
  //       }).then(async (res: any) => {
  //         await setUploadProps({
  //           action: res.uploadUrl,
  //           headers: res.headers,
  //           data: res.data,
  //         })
  //         setTimeout(() => {
  //           setKey(res.filename)
  //           setLoading(false)
  //           resolve(true)
  //         }, 100)
  //       }).catch(() => setLoading(false))
  //     })
  //   }
  // };
  const onFile = async () => {
    setLoading(true)
    window.api.getReplaceFile({
      model_identity: curInfo?.identity,
      renderer_name: item.renderer_name,
      renderer_id: item.renderer_id,
    }).then(file => {
      uploadFile({
        file,
        cat: 'model',
        isImg: false,
        type: 'upload'
      }).then(async (res: any) => {
        const filename = res.filename
        const newFileItem = {
          uid: filename,
          name: file.name,
          status: 'uploading',
          percent: 0,
        }
        setFileList([newFileItem]);
        let formData = new FormData()
        formData.append('file', file)
        formData.append('Authorization', res.authorization)
        formData.append('FileName', filename)
        formData.append('Content-Type', file.type)
        await get_upload({
          url: res.uploadUrl,
          params: formData,
          headers: res.headers,
          callback: (progress) => {
            const d = {...newFileItem}
            d.percent = progress
            if (progress === 100) {
              d.status = 'done'
              form.setFieldValue('new_file_key', filename)
            }
            setFileList([d]);
          }
        })
        setLoading(false)
      }).catch(() => setLoading(false))
    }).catch((err) => {
      setLoading(false)
      message.error(err.message)
    })
  }

  const items: MenuProps['items'] = [
    {
      key: '2',
      label: '与挂起的审核互换',
      icon: <Icon size={20} type='icon-renderer-Overall' />,
      children: [
        {
          key: '2-1',
          label: '3rd menu item',
          icon: <Icon size={24} type={item.renderer_icon} />
        },
        {
          key: '2-2',
          label: '4th menu item',
          icon: <Icon size={24} type={item.renderer_icon} />
        },
      ],
    },
    { 
      key: '3',
      label: 'disabled sub menu',
      icon: <Icon size={24} type={item.renderer_icon} />
    },
  ];

  return (
    <li className={s.audItem}>
      <Form form={form}>
        <div className={s.head}>
          <RenderItem
            item={item}
            key={item.resource_id}
            model_identity={curInfo?.identity}
            isShowTag={false}
            childrenLeft={(
              <Space>
                <Dropdown menu={{ items }} placement='topCenter'>
                  <SwapOutlined />
                </Dropdown>
                <span className={s.lock} onClick={() => {
                  setIsLock(!isLock)
                }}>
                  <Tooltip title='【挂起操作】用户实际上传的模型渲染器版本与当前审核面板上的不符。标记暂缓后，其他待审渲染器的切换按钮可选到被挂起的渲染器并与之替换。'>
                    {
                      isLock ? <LockOutlined /> : <UnlockOutlined />
                    }
                  </Tooltip>
                </span>
              </Space>
            )}
          />
        </div>
        {progress?.isDown && !isLock && <div className={s.context}>
          <div className={s.contextLeft}>
            {
              list.map(item => {
                return <em
                  className={`${type === item ? s.cur : ''}`}
                  key={item}
                  onClick={() => {
                    setType(item)
                    onSubmit(false)
                  }}
                >
                  {
                    item === 'approve' ? (
                      <Space>
                        <CheckCircleFilled style={{ color: '#67C036' }} />
                        通过
                      </Space>
                    ) : (
                      <Space>
                        <CloseCircleFilled style={{ color: '#EB3C34' }} />
                        拒绝
                      </Space>
                    )
                  }
                </em>
              })
            }
          </div>
          <div className={s.contextRight}>
            <div className={isSign ? 'disabled' : ''}>
              {
                type === 'approve' ? (
                  <div className={s.uplodaBox}>
                    <Form.Item
                      name="new_file_key"
                      noStyle
                    >
                      <Upload
                        fileList={fileList}
                        onRemove={() => {
                          setFileList([]);
                        }}
                      >
                        {fileList.length >= 1 ? null : (
                          <Button
                            disabled={isDisabled || loading}
                            type="primary"
                            size='small'
                            loading={loading}
                            onClick={async (e) => {
                              e.stopPropagation()
                              onFile()
                              // window.api.copePath({
                              //   model_identity: curInfo?.identity
                              // })
                              // message.success('文件路径已复制至剪切板，请粘帖路径跳转并上传。')
                            }}
                          >
                            回传文件
                          </Button>
                        )}
                      </Upload>
                    </Form.Item>
                    <div className={s.checkbox}>
                      <Form.Item
                        name="is_new_file_key"
                        valuePropName="checked"
                        noStyle
                        initialValue={false}
                      >
                        <Checkbox onChange={e => {
                          setDisabled(e.target.checked)
                        }}>无需回传</Checkbox>
                      </Form.Item>
                    </div>
                  </div>
                ) : (
                  <div className={s.textArea}>
                    <Form.Item
                      name="reject_reason"
                      noStyle
                      initialValue=''
                    >
                      <Input.TextArea style={{ resize: 'none' }} bordered autoSize={false} placeholder='请填写拒绝理由' />
                    </Form.Item>
                  </div>
                )
              }
            </div>
            <Button type="primary" onClick={() => {
              onSubmit()
            }}>{isSign ? '取消' : '标记'}{type === 'approve' ? '通过' : '拒绝'}</Button>
          </div>
        </div>}
      </Form>
    </li>
  );
}

export default Page;
