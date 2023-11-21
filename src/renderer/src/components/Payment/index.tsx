import { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import {
  Modal,
  Spin,
  message,
  Button
} from 'antd';
import s from "./index.module.less";
import payIcon from './payIcon.svg'
import {
  shopState,
  pay_task_code,
  purchase_asset,
  current_currency,
  charge_info
} from "@/scene/server";
import { downFun } from '@/utils';


const runTime = async (identity: string, software_name: string, callback: any) => {
  const res = await shopState({
    asset_identify: identity,
    softname: software_name,
  })
  if (res?.data?.purchased) {
    callback?.()
  } else {
    setTimeout(() => runTime(identity,software_name,callback), 2000);
  }
};

const Page = ({
  open,
  onCancel,
  paymentInfo, // 支付信息
  topupCallback, // 点击充值回调
  payCallback, // 支付成功回调
}: any) => {
  const [curIndex, setCurIndex] = useState('currency'); // 选择的支付方式
  const [balance, setBalance] = useState(0); // 当前的金额
  const [downCount, setDownCount] = useState(0); // 下载券
  const [task_code, setTask_code] = useState(0); // 支付code
  const [payLoading, setPayLoading] = useState(false); // 支付loading
  const list = ['currency', 'qrcode', 'coupon'] // 支付方式
  
  useEffect(() => {
    if (paymentInfo) {
      setBalance(paymentInfo.currency || 0)
      setDownCount(paymentInfo.download_coupon_count || 0)
      if(paymentInfo.download_coupon_count > 0) {
        setCurIndex('coupon')
      }
    }
  }, [open])

  const getShopState = async () => {
    if(curIndex === 'currency' && balance < paymentInfo?.charge) {
      return message.error('您的余额不足')
    }
    if(curIndex === 'coupon' && !downCount) {
      return message.error('您的下载券不足')
    }
    setPayLoading(true)
    if(curIndex !== 'qrcode') {
      const res = await purchase_asset({
        asset_identify: paymentInfo.identity,
        softname: paymentInfo.software_name,
        method: curIndex
      })
      if(!res.success) {
        setPayLoading(false)
        return message.error(res.msg)
      }
    }
    await runTime(paymentInfo.identity, paymentInfo.software_name, () => {
      message.success({
        content: '支付成功',
        onClose: () => {
          setPayLoading(false)
          payCallback?.()
        }
      })
    })
  }
  
  const qrcodeGenerate = () => {
    pay_task_code({
      asset_identify: paymentInfo.identity,
      softname: paymentInfo.software_name,
    }).then((res: any) => {
      if (res.success) {
        setTask_code(res.data.task_code)
      }
    })
  }

  return (
    <Modal
      open={open}
      title='请确认以下支付信息'
      onCancel={() => onCancel()}
      className={s.topupModal}
      footer={null}
      maskClosable={false}
      width={550}
    >
      <Spin spinning={payLoading}>
        <div className={s.table}>
          <div className={s.item}>
            <span>文件格式</span>
            <div>{ paymentInfo?.software_name || '--' }</div>
          </div>
          <div className={s.item}>
            <span>素材信息</span>
            <div>{ paymentInfo?.name || '--' }(ID:{ paymentInfo?.identity || '--' })</div>
          </div>
          <div className={s.item}>
            <span>支付金额</span>
            <div className={s.amount}>
              ￥
              <em> { paymentInfo?.charge || '--' } </em>
              或
              <em> 1 </em>
              张下载券
            </div>
          </div>
          <div className={s.item}>
            <span>支付方式</span>
            <div>
              <ul>
                {
                  list?.map(item => {
                    return <li
                      className={curIndex === item && s.cur || ''}
                      key={item}
                      onClick={() => {
                        setCurIndex(item)
                        if (item === 'qrcode') {
                          qrcodeGenerate()
                        }
                      }}
                    >
                      {item === 'currency' && <div className={s.box}>
                        <i>余额</i>
                        <span>{ balance }元</span>
                      </div>}
                      {item === 'qrcode' && <img src={payIcon} alt="" />}
                      {item === 'coupon' && <div className={s.box}>
                        <i>下载券</i>
                        <span>{ downCount }张</span>
                      </div>}
                    </li>
                  })
                }
              </ul>
              {curIndex === 'currency' && balance < Number(paymentInfo?.charge) && <p>
                  {/* 您的余额不足，请 
                  <i onClick={() => {
                    topupCallback?.()
                  }}>
                    充值(充200得210、充500得530、充1000得1100、充2000得2200)
                  </i> */}
                  <a target="_blank" href="https://1haomoxing.com">
                    请点击前往网页端充值
                  </a>
                </p>
              }
              {curIndex === 'qrcode' && <div className={s['qrcode-box']}>
                <QRCode value={`${process.env.RENDERER_VITE_USER_PC_URL}/payPage/index.html?quota=${task_code}`} size={90} />
              </div>}
            </div>
          </div>
        </div>
        <p className={s.text}>
          温馨提示：该服务不支持退款，30天内下载不再收费，您可在<em>我的订单</em>查看
        </p>
        <Button
          block
          className={s.btn}
          type="primary"
          onClick={() => {
            getShopState()
          }}
        >
          { curIndex === 'qrcode' ? '我已支付成功' : '确认支付' }
        </Button>
      </Spin>
    </Modal>
  );
}

interface IInfo {
  asset_identity: string; // 模型id
  asset_name: string; // 模型名称
  charge: number; // 该买模型价格
  softname: string; // 模型格式名称
}

interface IOpenData {
  itemDetail: any; // 当前的模型详情
  resources: any; // 当前选择的渲染器数据
  downSuccess: any; // 下载成功回调
  updataDownState: any; // 购买成功回调
}

interface IPaymentInfo {
  currency: number; // 余额
  download_coupon_count: number; // 代金券数量
  charge: number; // 支付金额
  identity: any; // 模型id
  software_name: any; // 模型格式名称
  name: any; // 模型名称
}

export const usePayment = (softwaresItem: any) => {
  // softwaresItem当前选择的模型格式数据
  const [openPayment, setOpenPayment] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<IPaymentInfo | null>(null)

  const onPaymentCancel = () => {
    setOpenPayment(false)
  }

  const onPaymentOpen = ({
    itemDetail,
    resources,
    downSuccess,
    updataDownState
  }: IOpenData) => {
    if(itemDetail) {
      // 获取支付的一些信息
      charge_info({
        asset_identify: itemDetail.identity,
        software_id: softwaresItem.id,
      }).then((res: any) => {
        if(res.success) {
          current_currency().then((res2: any) => {
            const data1: IInfo = res.data
            if (res2.success) {
              const data = res2.data
              if((data1.charge > data.currency)) {
                // 当下载券>0 || 付款金额>余额，打开支付弹窗
                setOpenPayment(true)
                setPaymentInfo({
                  ...itemDetail,
                  ...data,
                  charge: data1.charge,
                  software_name: data1.softname,
                  name: data1.asset_name,
                })
              } else {
                // 否则直接使用余额支付
                purchase_asset({
                  asset_identify: itemDetail.identity,
                  softname: data1.softname,
                  method: 'currency'
                }).then((res: any) => {
                  if(!res.success) {
                    return message.error(res.msg)
                  }
                  runTime(itemDetail.identity, data1.softname, () => {
                    updataDownState?.(itemDetail)
                    message.success({
                      content: '购买成功，已为您自动下载',
                      onClose: () => {
                        downFun(itemDetail.identity, resources, () => {
                          downSuccess?.()
                        })
                      }
                    })
                  })
                })
              }
            }
          })
        }
      })
    }
  }

  return {
    openPayment,
    onPaymentCancel,
    onPaymentOpen,
    paymentInfo
  }
};

export default Page;
