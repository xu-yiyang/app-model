import { useState, useEffect } from 'react';
import { closeAllWin, minimizeWin, toggleMaximize, isMaximized as isMaximizedWin } from '@/windows/actions'
import s from "./index.module.less";
import Close from "./img/mdi_close.svg";
import Max from "./img/mdi_window-maximize.svg";
import Restore from "./img/mdi_window-restore.svg";
import Min from "./img/mdi_window-minimize.svg";


const Page = ({
  isMaximizeBtn = true
}) => {
  const [isMaximized, setMaximized] = useState(false)

  useEffect(() => {
    const setMaxState = async () => {
      const isMax = await isMaximizedWin()
      setMaximized(isMax)
    }
    setMaxState()
    window.addEventListener('resize', async () => {
      setMaxState()
    }, false);
  }, [])

  return (
    <div className={s.titlebar}>
      <div
        className={s['titlebar-button']}
        id="titlebar-minimize"
        onClick={() => minimizeWin()}
      >
        <img src={Min} />
      </div>
      {isMaximizeBtn  && <div
        className={s['titlebar-button']}
        id="titlebar-maximize"
        onClick={() => {
          toggleMaximize()
        }}
      >
        <img src={isMaximized ? Restore : Max} />
      </div>}
      <div
        className={s['titlebar-button']}
        id={s['titlebar-close']}
        onClick={() => closeAllWin()}
      >
        <img src={Close} />
      </div>

    </div>
  );
}

export default Page;
