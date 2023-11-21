import { useState, useEffect, useRef, useLayoutEffect, useContext, forwardRef, useImperativeHandle } from "react";
import { isMinimized as isMinimizedWin } from '@/windows/actions'
import { ConfigContext, debounce } from '@/utils'
import { Spin, Image } from "antd"
import InfiniteScroll from 'react-infinite-scroll-component';
import { getModelInfo } from "@/scene/server";
import Empty from '@/components/empty'
import Recommendation from "./recommendation";
import ProdCardItem from "./prodCardItem";
import { indexContext } from '@/scene/Index/index';

import s from "./index.module.less";

const Page = forwardRef(({
  list,
  setCurInfo,
  setLoading,
  getModelList,
  listTotal,
}: any, ref) => {
  const {
    curRenderers, // 当前选择的渲染器数据
  }: any = useContext(indexContext)
  const context: any = useContext(ConfigContext);
  const { isShowRecommendation } = context;

  const listContainerWidth = 102 // 卡片容器宽度

  const [curId, setCurId] = useState<any>(); // 当前选择的模型id
  const [visibleImg, setVisibleImg] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  // const [isCustomMenu, setIsCustomMenu] = useState(false);
  
  // 获取模型详情
  const modelInfo = async (id: string, again = false) => {
    if (curId === id && !again) {
      return;
    }
    setLoading(true)
    const res = await getModelInfo({
      id: id ?? curId,
    })
    setLoading(false)
    if (res.success) {
      setCurId(id ?? curId)
      setCurInfo(res.data)
    } else {
      setCurInfo(null)
    }
  }

  // 把方法暴露给父组件
  useImperativeHandle(ref, () => ({
    modelInfo
  }));

  const [isShowI, setIsShowI] = useState(true); // 是否展示占位图
  const fun = () => {
    const imgListRef = document.getElementById('imgList')
    // 当列表宽度大于容器宽度，展示占位图，(列表容器宽度 > 列表数量*（卡片容器宽度）- 列表容器内边距)
    if (imgListRef && imgListRef?.clientWidth > (list.length * (listContainerWidth) - 2)) {
      setIsShowI(false)
    } else {
      setIsShowI(true)
    }
  }
  useEffect(() => {
    if (list.length) {
      if(!curId) {
        const id = list[0].id
        setCurId(id)
        modelInfo(id)
      }
      fun()
      window.addEventListener('resize', fun, false);
    } else {
      setCurInfo(null)
    }

    return () => {
      window.removeEventListener('resize', fun);
    }
  }, [list])

  const isReload = useRef(true);
  useLayoutEffect(() => {
    // setTimeout(() => {
    //   if(process.env.RENDERER_VITE_ALL_APP_TYPE === 'admin') {
    //     const imgListRef = document.getElementById('imgList')
    //     imgListRef?.addEventListener('contextmenu', function(event: any) {
    //       if(event?.target?.classList.contains('imgItem')) {
    //         event.preventDefault(); // 阻止默认的右键菜单弹出
    //         const customMenu = document.getElementById('customMenu');
    //         if(customMenu) {
    //           setIsCustomMenu(true)
    //           console.log(event,'imgListRef');
    //           customMenu.style.display = 'block';
    //           customMenu.style.left = event.clientX + 'px';
    //           customMenu.style.top = event.clientY + 'px';
    //         }
    //       }
    //     });
    //     document.addEventListener('click', function(e) {
    //       setIsCustomMenu(false)
    //     });
    //   }
    // }, 500)

    const _handleSendCode: any = debounce(async () => {
      // 在窗口大小变化时执行的代码
      const isMinimized = await isMinimizedWin()
      if (isReload.current && !isMinimized) {
        console.log('窗口大小已变化');
        location.reload();
      }
      isReload.current = !isMinimized
    }, 200)

    window.addEventListener('resize', _handleSendCode, false);

    return () => {
      window.removeEventListener('resize', _handleSendCode);
    }
  }, [])

  const recommendationList: any = []

  return (
    <div className={s.center}>
      <div className={s.centerL} id='centerL'>
        <InfiniteScroll
          scrollableTarget="centerL"
          dataLength={list.length}
          next={async () => {
            getModelList({}, true)
          }}
          hasMore={list.length < listTotal}
          loader={
            list?.length ? <div className={s.loading}>
              <Spin />
            </div> : ''
          }
          endMessage={
            list?.length ? <div className={s.toTheEnd}>
              你已经到底了
            </div> : ''
          }
        >
          {list.length ? (
            <div className={s.imgList} id='imgList'>
              {
                list.map((_: any) => {
                  return <ProdCardItem
                    key={_.id}
                    imgUrl={_.preview_img}
                    isCur={_.id === curId}
                    title={_.name}
                    onClick={(again = false) => {
                      modelInfo(_.id, again)
                    }}
                    resources={_?.resources?.find((item: any) => item.renderer_id === curRenderers.value) || null}
                    model_identity={_.identity}
                    isShop={_.purchased ?? true}
                    item={_}
                    openPreview={(url: string) => {
                      // 打开预览图弹窗
                      setVisibleImg(true);
                      setImgUrl(url)
                    }}
                  />
                })
              }
              {isShowI && <>
                <ProdCardItem seizeASeat={true}></ProdCardItem>
              </>}
            </div>
          ) : <Empty />}
        </InfiniteScroll>
      </div>
      <div style={{ display: 'none', position: 'absolute' }}>
        <Image
          width={200}
          src={imgUrl}
          preview={{
            visible: visibleImg,
            src: imgUrl,
            onVisibleChange: (value) => {
              setVisibleImg(value);
            },
            toolbarRender: () => null,
          }}
        />
      </div>
      {/* <div id="customMenu" className={s.customMenu}>
        {isCustomMenu && <ul>
          <li onClick={() => {
            console.log(12312)
          }}>打开文件所在目录</li>
        </ul>}
      </div> */}
      {(isShowRecommendation && recommendationList.length) ? <Recommendation list={recommendationList} /> : ''}
    </div>
  );
})

export default Page;
