import React, { useCallback } from 'react';
import { Form, Spin } from 'antd'
import Left from './components/Left'
import RightTop from './components/RightTop'
import RightCenter from './components/RightCenter'
import RightFooter from './components/RightFooter'
import AuditModal, { useAudit } from './components/AuditModal'
import TopupModal, { useTopup } from '@/components/Topup'
import PaymentModal, { usePayment } from '@/components/Payment'

import { useIndex } from './hooks'
import s from "./index.module.less";

export const indexContext = React.createContext({});

const App = () => {
  const {
    form,
    userInfo,
    setCurInfo,
    getModelList,
    filterConfig,
    setFilterConfig,
    list,
    setLoadingFooter,
    loadingCenter,
    childCenterRef,
    curRenderers,
    progressObj,
    setProgressObj,
    curInfo,
    loadingFooter,
    auditData,
    upDataInfo,
    setList,
    listTotal,
    searchImg,
    setSearchImg,
    getSearchImg,
  } = useIndex()

  const {
    openAudit,
    onAuditOpen,
    onAuditCancel,
  } = useAudit()

  const {
    openTopup,
    onTopupCancel,
    onTopupOpen
  } = useTopup()
  
  const {
    openPayment,
    onPaymentCancel,
    onPaymentOpen,
    paymentInfo
  } = usePayment(filterConfig?.softwares?.softwaresItem)

  // 更新下载状态
  const updataDownState = useCallback((info: any) => {
    const newD = [...list]
    const index = newD.findIndex(_ => _.identity === info.identity)
    if(index !== -1) {
      newD[index].purchased = true
      setList(newD)
    }
  }, [list])

  return (
    <indexContext.Provider value={{
      onPaymentCancel, // 关闭支付窗口
      onPaymentOpen, // 打开支付窗口
      progressObj, // 下载进度数据
      setProgressObj, // 设置下载进度数据
      updataDownState, // 更新下载状态
      curRenderers, // 当前选择的渲染器数据 
      upDataInfo, // 更新当前模型详情
      searchImg, // 搜索图片
      getSearchImg, // 获取图片url并设置
      filterConfig,
    }}>
      <div className={s.container} id='dropzone'>
        <Form
          name="model"
          form={form}
          onValuesChange={() => {
            setSearchImg('')
            getModelList({ searchImg: false })
          }}
        >
          <div className={s.wrap}>
            <div className={s.left}>
              <Left
                userInfo={userInfo}
                onSwitchSoftwares={({ softwaresIndex, rendererIndex }: any) => {
                  const config: any = { ...filterConfig }
                  if (softwaresIndex !== undefined) {
                    config.softwares.softwaresItem = config.softwares?.list?.[softwaresIndex] || null
                  }
                  config.softwares.softwaresItem.rendererIndex = rendererIndex ?? 0
                  setFilterConfig(config)
                  getModelList()
                }}
              />
            </div>
            <div className={s.right} id='rightDom'>
              <div className={s.topBox}>
                <RightTop />
              </div>

              <div className={s.centerBox}>
                <RightCenter
                  list={list}
                  setCurInfo={setCurInfo}
                  setLoading={setLoadingFooter}
                  ref={childCenterRef}
                  getModelList={getModelList}
                  listTotal={listTotal}
                />
                {
                  loadingCenter && <div className={s.load}>
                    <Spin spinning={true}>
                    </Spin>
                  </div>
                }
              </div>

              {curInfo && <Spin spinning={loadingFooter}>
                <div className={s.footerBox}>
                  <RightFooter
                    curInfo={curInfo}
                    onAuditOpen={onAuditOpen}
                    auditData={auditData}
                  />
                </div>
              </Spin>}
            </div>
          </div>
        </Form>

        {openAudit && <AuditModal
          auditData={auditData}
          open={openAudit}
          curInfo={curInfo}
          onCancel={onAuditCancel}
          upDataInfo={upDataInfo}
          auditAllSuccess={() => {
            // 审核全部通过后，删除该模型
            const newD = [...list]
            const index = newD.findIndex(_ => _.identity === curInfo.identity)
            if(index !== -1) {
              newD.splice(index, 1)
              setList(newD)
            }
          }}
        />}

        {openTopup && <TopupModal
          open={openTopup}
          onCancel={onTopupCancel}
        />}

        {
          <PaymentModal
            open={openPayment}
            onCancel={onPaymentCancel}
            paymentInfo={paymentInfo}
            topupCallback={() => {
              onTopupOpen()
              onPaymentCancel()
            }}
            payCallback={() => {
              onPaymentCancel()
              upDataInfo()
              updataDownState(paymentInfo)
            }}
          />
        }
      </div>
    </indexContext.Provider>
  );
}

export default App;
