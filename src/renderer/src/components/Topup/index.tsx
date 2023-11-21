import { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import {
  Modal,
  Tooltip,
  InputNumber,
  message
} from 'antd';
import s from "./index.module.less";
import Icon from '@/components/icon'
import { get_recharge_suite, get_task_code } from "@/scene/server";

const Page = ({
  open,
  onCancel
}: any) => {
  const keyV = 'capital'
  const [radioList, setRadioList] = useState([]); // 充值选项金额
  const [radioMoney, setRadioMoney] = useState<null | number>(null); // 选择的金额
  const [curMoney, setCurMoney] = useState<null | number>(null); // 当前的金额
  const [inputMoney, setInputMoney] = useState<null | number>(null); // 输入的金额
  const [isGenerate, setIsGenerate] = useState(false); // 是否展示生成二维码
  const [task_code, setTask_code] = useState(''); // 充值code
    
  const getCode = ({ id, amount }: any) => {
    get_task_code({
      suite_id: id,
      amount: amount,
    }).then((res) => {
      if (res.success) {
        setTask_code(res.data?.task_code)
      }
    })
  }

  const itemClick = (item: any) => {
    setIsGenerate(false)
    setRadioMoney(item[keyV])
    setInputMoney(null)
    setCurMoney(item[keyV])
    getCode({ id: item.id })
  }
  const inputClick = () => {
    setIsGenerate(true)
    setRadioMoney(null)
  }
  const onReset = () => {
    if (inputMoney) {
      setCurMoney(inputMoney)
      setIsGenerate(false)
      getCode({ amount: inputMoney })
    } else {
      message.error('请填写金额！')
    }
  }

  useEffect(() => {
    get_recharge_suite().then(res => {
      if(res.success) {
        const recharge_suites = res.data?.recharge_suites || []
        setRadioList(recharge_suites)
        setRadioMoney(recharge_suites[0][keyV])
        getCode({ id: recharge_suites[0].id })
      }
    })
  }, [])

  return (
    <Modal
      open={open}
      title='充值'
      onCancel={() => onCancel()}
      className={s.topupModal}
      footer={null}
      maskClosable={false}
    >
      <div className={s.radio}>
        {
          radioList.map((item: any) => {
            return <div
              key={item.id}
              className={radioMoney === item[keyV] ? s.cur : ''}
              onClick={() => itemClick(item)}
            >
              {item[keyV]}
            </div>
          })
        }
        <div
          className={!radioMoney ? s.cur : ''}
          onClick={() => inputClick()}
        >
          <Tooltip title="50起充">
            <InputNumber
              className={s.input}
              min={50}
              controls={false}
              placeholder='自定义金额'
              onChange={val => {
                setInputMoney(val)
              }}
            />
          </Tooltip>
        </div>
      </div>
      <div className={s.qrcode}>
        <div className={s.qrcodeBox}>
          <Tooltip title="点击刷新二维码">
            <div onClick={() => getCode({ amount: curMoney })}>
              <QRCode value={`${process.env.RENDERER_VITE_USER_PC_URL}/payPage/index.html?quota=${task_code}`} size={90} />
            </div>
          </Tooltip>
          {isGenerate && <div className={s.generate}>
            <div onClick={() => onReset()}>
              <Icon size={18} type='icon-shuaxin2' />
              <p>生成二维码</p>
            </div>
          </div>}
        </div>
        <div className={s.text}>
          <p>支付金额: { (radioMoney ?? inputMoney) || '--'} 元</p>
          <p>支付方式：微信、支付宝、银联扫码支付</p>
        </div>
      </div>
    </Modal>
  );
}

export const useTopup = () => {
  const [openTopup, setOpenTopup] = useState(false)

  const onTopupCancel = () => {
    setOpenTopup(false)
  }

  const onTopupOpen = () => {
    setOpenTopup(true)
  }

  return {
    openTopup,
    onTopupCancel,
    onTopupOpen
  }
};

export default Page;
