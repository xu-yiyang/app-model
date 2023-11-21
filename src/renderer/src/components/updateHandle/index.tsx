import { useEffect, useState } from "react";
import { Modal, Progress } from "antd"
import { getVersion, updateDownloaded } from '@/windows/actions'
import s from "./index.module.less";

const App = () => {
  const [progressOpen, setProgressOpen] = useState(false)
  const [progressNum, setProgressNum] = useState(0)

  useEffect(() => {
    const getV = async () => {
      const appVersion = await getVersion();
      console.log(appVersion,'appVersion');
      window.api.updateHandle(async (event, value) => {
        console.log(event, value, '有新版本');
        Modal.confirm({
          title: '版本更新',
          okText: '更新',
          cancelText: '关闭',
          icon: null,
          wrapClassName: s.updataVersion,
          content: (
            <div className={s.main}>
              <p>检测到您当前的版本落后(v{appVersion})，请更新至最新版(v{value.version})。</p>
            </div>
          ),
          async onOk() {
            updateDownloaded()
            setProgressOpen(true)
          },
          onCancel() {
            console.log('Cancel');
          },
        });
      })
      window.api.downloadProgress((event, value) => {
        console.log(event, value, '进度');
        setProgressNum(parseInt(String(value.percent)))
      })
    }
    getV()
  }, [])

  return (
    <Modal
      wrapClassName={s.updataVersion}
      footer={null}
      open={progressOpen}
      centered
      closable={false}
    >
      <Progress percent={progressNum} />
      <h4 className={s.title}>客户端正在下载更新...</h4>
    </Modal>
  );
}

export default App;
