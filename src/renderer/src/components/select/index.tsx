import { useState, useRef, useEffect } from 'react';
import {
  Checkbox,
  Row,
  Col
} from 'antd';
import {
  DownOutlined,
} from '@ant-design/icons';
import Icon from '@/components/icon'
import s from "./index.module.less";

const Page = ({
  label = '',
  options = [],
  fieldNames = ['label', 'value'],
  onChange,
  value = [],
}: any) => {
  const [isShow, setShow] = useState(false)
  const selDom: any = useRef(null)

  const [checkList, setCheckList] = useState<any[]>(value)
  const [labelList, setLabelList] = useState<any[]>([])

  const onSetVal = (val: any) => {
    setCheckList(val)
    onChange(val)
  }

  const optionsObj: any = {}
  options.map((_: any) => {
    optionsObj[_[fieldNames[1]]] = _[fieldNames[0]]
  })

  useEffect(() => {
    // 点击除下拉的其他地方隐藏
    document.addEventListener('click', function (event) {
      var target: any = event.target;
      // 判断点击的目标元素是否为需要隐藏的元素或其子元素
      if (!selDom.current?.contains(target)) {
        setShow(false)
      }
    });
  }, [])

  return (
    <div
      className={`${s.select} ${checkList.length ? s.cur : ''}`}
      ref={selDom}
    >
      <label
        className={s.title}
        onClick={(e) => {
          setShow(!isShow)
        }}
      >
        {label}
        {
          labelList.length ? <em className={s.ellipsis}>
            :{
              labelList.join(',')
            }
          </em> : ''
        }
        <DownOutlined />
      </label>
      {checkList.length && <span className={s.close} onClick={() => {
        onSetVal([])
        setLabelList([])
      }}>
        <Icon size={12} type='icon-yichuyixiazaired' />
      </span> || ''}
      {isShow && options?.length && <div className={s.selList}>
        <Checkbox.Group
          value={checkList}
          onChange={(e: any[]) => {
            onSetVal(e)
            setLabelList(e.map(_ => optionsObj[_]))
          }}
        >
          <Row>
            {
              options.map((item: any) => {
                return <Col span={24} key={item[fieldNames[0]]}>
                  <Checkbox value={item[fieldNames[1]]}>{item[fieldNames[0]]}</Checkbox>
                </Col>
              })
            }
          </Row>
        </Checkbox.Group>
      </div> || ''}
    </div>
  );
}

export default Page;
