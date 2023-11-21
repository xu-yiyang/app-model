import { useEffect, useState, useContext } from 'react'
import {
  Modal,
  Form,
  Select,
  message,
  Row,
  Col,
  Input,
  Radio,
  Button,
  Cascader,
} from 'antd';
import {
  ToTopOutlined,
} from '@ant-design/icons';
import UploadImg from "./uploadImg";
import s from "./index.module.less";
import AudItem from './audItem'
import Icon from '@/components/icon'
import { indexContext } from '@/scene/Index/index';
import { updataAuditInfo, getAuditModelInfo, setModelEdit } from "@/scene/server";

const Page = ({
  open,
  onCancel,
  auditData,
  curInfo,
  upDataInfo,
  auditAllSuccess,
}: any) => {
  const {
    filterConfig, // 当前选择的渲染器数据
  }: any = useContext(indexContext)
  const [auditList, setAuditList] = useState<any[]>([])
  const [submitLoading, setSubmitLoading] = useState(false)
  const list = auditData?.resources?.filter((_: any) => _.state === 'pending') || []
  const [form] = Form.useForm();
  const softwaresItem = filterConfig?.softwares?.softwaresItem
  const onSubmit = (callback?: Function, callback2?: Function) => {
    form.validateFields().then(async (values) => {
      callback2?.(true)
      const res = await updataAuditInfo({
        ...values,
        asset_id: curInfo.id,
        software_id: softwaresItem.id,
        imgs: values.imgs.map((_: any) => _.uid),
        usage_scenario_ids: values.usage_scenario_ids,
        category_id: values.category_id?.[1]
      })
      if(res.success) {
        if(callback) {
          callback?.()
        } else {
          callback2?.(false)
          message.success('更新成功')
        }
      } else {
        callback2?.(false)
      }
    })
  }

  const onAuditFu = (value) => {
    return new Promise(async (resolve, _rejects) => {
      const { renderer_name, ...other } = value
      // isLast是否最后一条审核
      const res = await setModelEdit({
        ...other,
        asset_id: curInfo.id,
        software_id: softwaresItem.id,
      })
      if (res.success) {
        resolve({
          success: true,
          message: ''
        })
      } else {
        resolve({
          success: false,
          message: `${renderer_name}审核失败,原因:${res.msg}`
        })
      }
    })
  }
  // 获取模型详情
  const modelInfo = async () => {
    const res = await getAuditModelInfo({
      asset_id: curInfo.id,
      software_id: softwaresItem.id,
    })
    if (res.success) {
      form.setFieldsValue({
        category_id: res.data?.cate?.map((_: any) => _.value),
        name: res.data?.name,
        sub_type: res.data?.sub_type,
        charge: res.data?.charge < 3 ? res.data.charge : 3,
        style_id: res.data?.style?.value,
        brand_id: res.data?.brand?.value,
        usage_scenario_ids: res.data?.usage_scenarios?.map((_: any) => _.value),
        rendering_level: res.data?.rendering_level,
        wiring: res.data?.wiring,
        lights: res.data?.lights,
        maps: res.data?.maps,
        uvw_maps: res.data?.uvw_maps,
        imgs: res.data?.previews?.map((_: any) => {
          return {
            uid: _.value,
            name: _.value,
            status: 'done',
            thumbUrl: _.preview,
          }
        })
      })
    } else {
    }
  }
  useEffect(() => {
    if (open) {
      modelInfo()
    }
  }, [open])

  const Xian = () => {
    return <div style={{
      height: 1,
      borderBottom: '1px solid #49494F',
      width: '100%',
      marginBottom: 14
    }} />
  }
 
  return (
    <Modal
      title={`模型审核: ${curInfo?.name}(ID:${curInfo?.identity})`}
      open={open}
      onCancel={() => onCancel()}
      wrapClassName={s.auditModal}
      footer={false}
      width={960}
      centered
      maskClosable={false}
    >
      <div className={s.auditBox}>
        <div className={s.left}>
          <Form form={form}>
            <Form.Item
              name="imgs"
              rules={[{ required: true, message: '请上传预览图' }]}
            >
              <UploadImg />
            </Form.Item>
            <Row gutter={20} style={{ padding: '0 25px' }}>
              <Col span={12}>
                <Form.Item
                  label="模型分类"
                  name="category_id"
                  rules={[{ required: true }]}
                >
                  <Cascader
                    placeholder="请选择模型分类"
                    fieldNames={{
                      label: 'name',
                      value: 'id',
                      children: 'children',
                    }}
                    options={filterConfig?.category?.list || []}
                    allowClear={false}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="模型名称"
                  name="name"
                  rules={[{ required: true }]}
                >
                  <Input
                    placeholder='请填写模型名称'
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="模型类型"
                  name="sub_type"
                  rules={[{ required: true }]}
                >
                  <Select
                    options={[
                      {
                        label: '单体模型',
                        value: 'single_model',
                      },
                      {
                        label: '场景模型',
                        value: 'scene_model',
                      },
                      {
                        label: '全景模型',
                        value: 'pano_model',
                      },
                    ]}
                    placeholder='请选择模型类型'
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="模型价格"
                  name="charge"
                  rules={[{ required: true }]}
                  getValueFromEvent={event => {
                    let value = event.target.value;
                    if (Number(value) > 3) {
                      return 3
                    }
                    return `${value}`.replace(/[^\d.]/g, '').replace('.', '$#$').replace(/\./g, '').replace('$#$', '.').replace(/^(\\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
                  }}
                >
                  <Input
                    addonAfter="元"
                    placeholder='请填写模型价格'
                  />
                </Form.Item>
              </Col>

              <Xian />
              <Col span={12}>
                <Form.Item
                  label="模型风格"
                  name="style_id"
                  rules={[{ required: true }]}
                >
                  <Select
                    options={filterConfig?.style?.list || []}
                    fieldNames={{
                      label: 'name',
                      value: 'id',
                    }}
                    placeholder='请选择模型风格'
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="家具品牌"
                  name="brand_id"
                >
                  <Select
                    allowClear
                    options={filterConfig?.brand?.list || []}
                    fieldNames={{
                      label: 'name',
                      value: 'id',
                    }}
                    placeholder='请选择家具品牌'
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="应用场景"
                  name="usage_scenario_ids"
                  rules={[{ required: true }]}
                >
                  <Select
                    mode="multiple"
                    maxTagCount='responsive'
                    options={filterConfig?.usage_scenario?.list || []}
                    fieldNames={{
                      label: 'name',
                      value: 'id',
                    }}
                    placeholder='请选择应用场景'
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="写实程度"
                  name="rendering_level"
                  rules={[{ required: true }]}
                >
                  <Select
                    options={[
                      {
                        label: '高度写实',
                        value: 'high_realism',
                      },
                      {
                        label: '写实',
                        value: 'realism',
                      },
                      {
                        label: '半写实',
                        value: 'half_realism',
                      },
                      {
                        label: '简约',
                        value: 'simple',
                      },
                    ]}
                    placeholder='请选择写实程度'
                  />
                </Form.Item>
              </Col>
              
              <Xian />
              <Col span={12}>
                <Form.Item
                  label="模型灯光"
                  name="lights"
                  rules={[{ required: true }]}
                >
                  <Radio.Group>
                    <Radio value={true}>有</Radio>
                    <Radio value={false}>无</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="材质贴图"
                  name="maps"
                  rules={[{ required: true }]}
                >
                  <Radio.Group>
                    <Radio value={true}>有</Radio>
                    <Radio value={false}>无</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="布线方式"
                  name="wiring"
                  rules={[{ required: true }]}
                >
                  <Radio.Group>
                    <Radio value='quad'>四角面</Radio>
                    <Radio value='triangle'>三边面</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="UVW贴图"
                  name="uvw_maps"
                  rules={[{ required: true }]}
                >
                  <Radio.Group>
                    <Radio value={true}>有</Radio>
                    <Radio value={false}>无</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <div className={s.subBtn}>
            <Button
              type='primary'
              onClick={() => {
                onSubmit()
              }}
            >
              <Icon size={18} type='icon-shuaxin2' />
              更新信息
            </Button>
          </div>
        </div>
        <div className={s.right}>
          {list.length && <ul>
            {
              list.map((item: any) => {
                return <AudItem
                  item={item}
                  curInfo={curInfo}
                  key={item.resource_id}
                  onAudit={(value: any, isSign: boolean) => {
                    const newList = [...auditList]
                    if (isSign) {
                      setAuditList([...newList, value])
                    } else {
                      const index = newList.findIndex(item => item.resource_id === value.resource_id)
                      newList.splice(index, 1)
                      setAuditList(newList)
                    }
                  }}
                />
              })
            }
          </ul> || ''}

          <div className={s.auditBtn}>
            <Button
              type='primary'
              className={s.subBtn}
              loading={submitLoading}
              onClick={() => {
                if (auditList.length > 0) {
                  onSubmit(async () => {
                    Promise.allSettled(auditList.map(item => onAuditFu(item))).then((val) => {
                      setSubmitLoading(false)
                      const errList: any[] = []
                      const listSuccess = val.filter((item: any) => {
                        if (!item.value.success) {
                          errList.push(item)
                        }
                        return item.value.success
                      })
                      if (!errList.length) {
                        // 没有错误数据，代表全部审核通过
                        message.success('审核完成')
                      } else {
                        Modal.error({
                          title: null,
                          content: errList.map(item => item.value.message).join('；'),
                        })
                      }
                      console.log(val, list, listSuccess, 'asdsad');
                      upDataInfo()
                      if (list.length === listSuccess.length) {
                        // 当审核通过和审核数量一致,代表这条已经全部审核通过了
                        auditAllSuccess?.()
                        onCancel()
                      }
                    })
                  }, (bool: boolean) => {
                    setSubmitLoading(bool)
                  })
                } else {
                  message.error('至少标记一条通过或者拒绝的模型')
                }
              }}
            >
              <ToTopOutlined />
              提交审核
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export const useAudit = () => {
  const [openAudit, setOpenAudit] = useState(false)

  const onAuditCancel = () => {
    setOpenAudit(false)
  }

  const onAuditOpen = () => {
    setOpenAudit(true)
  }

  return {
    openAudit,
    onAuditOpen,
    onAuditCancel,
  }
};

export default Page;
