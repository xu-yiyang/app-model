import { useEffect } from "react";
import {
  Divider,
} from 'antd';

import ProdCardItem from "../prodCardItem";

import s from "./index.module.less";

const Page = ({
  list = [],
}: any) => {
  useEffect(() => {
    const setWidth = () => {
      const width = document.querySelector('.imgItem')?.clientWidth
      const dom = document.getElementById('centerR')
      if (width && dom) {
        dom.style.width = width + 40 + 'px'
      }
    }
    setTimeout(() => {
      setWidth()
    }, 200)
    window.addEventListener('resize', () => setWidth(), false);
  }, [])

  return (
    <div className={s.centerR} id='centerR'>
      <div className={s.title}>
        <Divider
          plain
          style={{ color: '#fff', borderColor: '#fff' }}
        >
          相似推荐
        </Divider>
      </div>
      <div className={s.imgList}>
        {
          list.map((_: any, i: any) => {
            return <ProdCardItem
              key={_.id}
              imgUrl={_.preview_img}
              title={_.name}
            />
          })
        }
      </div>
    </div>
  );
}

export default Page;
