import { useContext, useEffect, useState } from "react";
import { Form, Input, Button, Checkbox, message } from "antd"
import md5 from 'crypto-js/md5';
import {
  UserOutlined,
} from '@ant-design/icons';
import Icon from '@/components/icon'
import { ConfigContext } from '@/utils'
import { openIndexWin } from '@/windows/actions'
import OperatButton from "@/components/operatButton";
import UpdateHandle from "@/components/updateHandle";
import { login } from "@/scene/server";
import { getVersion, checkUpdate } from '@/windows/actions'

import Logo from "./assets/logo.svg";
import Img1 from "./assets/img1.svg";
import Logo2 from "./assets/Logo2.svg";
import s from "./index.module.less";

const App = () => {
  const context: any = useContext(ConfigContext);

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false)
  const [version, setVersion] = useState('')

  const backfillAccount = JSON.parse(localStorage.getItem('loginInfo') || '{}')

  const onLogin = async (val: any) => {
    setLoading(true)
    const machine_id = window.api.machineId || ''
    const key = context?.loginKey?.account || 'account'
    const remember = val.remember
    delete val.remember
    const res: any = await login({
      ...val,
      password: md5(val.password).toString(),
      device_id : machine_id,
      [key]: val[key].replace("vconsole", "")
    })
    setLoading(false)
    if(res.success) {
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("accountInfo", JSON.stringify({
        ...res.data,
        vconsole: val[key].includes('vconsole')
      }))
      if (remember) {
        localStorage.setItem('loginInfo', JSON.stringify(val))
      } else {
        localStorage.removeItem('loginInfo')
      }
      openIndexWin()
    } else {
      message.error(res.msg)
    }
  }

  useEffect(() => {
    const getV = async () => {
      const appVersion = await getVersion();
      setVersion(appVersion)
    }
    checkUpdate()
    getV()
  }, [])

  return (
    <div className={s.loginWrap}>
      <header className={s.header}>
        <span>
          <img src={Logo} />
          1号模型网
          {version && `（v${version}）`}
        </span>
        <OperatButton isMaximizeBtn={false} />
      </header>

      <div className={s.main}>
        <div className={s.left}>
          <img src={Img1} className={s.mainImg} />
          <div className={s.logo}>
            <img src={Logo2} />
            { context?.title }
          </div>
        </div>

        <div className={s.right}>
          <img src={Logo} className={s.rLogo} />
          <Form
            name="basic"
            wrapperCol={{ span: 24 }}
            form={form}
            initialValues={{
              ...backfillAccount,
              remember: !!backfillAccount?.password
            }}
            onFinish={(val) => {
              onLogin(val)
            }}
          >
            <Form.Item
              name={context?.loginKey?.account || "account"}
              rules={[{ required: true, message: '请输入手机号码!' }]}
            >
              <Input
                addonBefore={<UserOutlined style={{ color: '#fff', fontSize: '20px' }} />}
                placeholder="请输入手机号码"
                style={{ height: '36px' }}
              />
            </Form.Item>

            <Form.Item
              name={context?.loginKey?.password || "password"}
              rules={[{ required: true, message: '请输入密码!' }]}
            >
              <Input.Password
                addonBefore={<Icon size={20} type='icon-password' />}
                placeholder="请输入密码"
              />
            </Form.Item>

            <Form.Item className={s.btn}>
              <Button type="primary" block htmlType="submit" loading={loading}>
                登录
              </Button>
            </Form.Item>

            <div className={s.remember}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住密码</Checkbox>
              </Form.Item>

              <a target="_blank" href="https://1haomoxing.com?register=1">
                立即注册
              </a>
            </div>
          </Form>
        </div>
      </div>
      <UpdateHandle />
    </div>
  );
}

export default App;
