import React, { useLayoutEffect, useState, useRef } from 'react';
import { PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { message, Modal, Upload, Spin } from 'antd';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import s from "./index.module.less";
import { uploadFile, isFileImage } from '@/utils'
import uploadImg from './upload-main-img.png'

interface DraggableUploadListItemProps {
  originNode: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  file: UploadFile<any>;
  handlePreview: any;
  onRemove: any;
  isZhuTu: boolean;
}

const DraggableUploadListItem = ({ originNode, file, handlePreview, onRemove, isZhuTu }: DraggableUploadListItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: file.uid,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? s['is-dragging'] : ''} ${s.imgItem}`}
      {...attributes}
      {...listeners}
    >
      {/* <{file.status === 'error' && isDragging ? originNode.props.children : originNode}> */}
      <div className='ant-upload-list-item ant-upload-list-item-done'>
        {isZhuTu && <img className={s['upload-imgs-main-img']} src={uploadImg} />}
        <img
          src={file.thumbUrl}
          style={{ width: '100%', height: '100%', objectFit: 'scale-down' }}
        />
        <span className='ant-upload-list-item-actions'>
          <span onClick={() => handlePreview()}>
            <EyeOutlined />
          </span>
          <span onClick={() => onRemove()}>
            <DeleteOutlined />
          </span>
        </span>
      </div>
      {/* {originNode} */}
    </div>
  );
};

const App: React.FC = ({
  value,
  onChange
}: any) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<any>('');
  const [list, setFileList] = useState<UploadFile[]>([]);
  const refList = useRef<UploadFile[]>([])


  const sensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 10 },
  });
  
  const setFun = (data: any) => {
    setFileList(data)
    onChange(data)
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const activeIndex = list.findIndex((i: any) => i.uid === active.id);
      const overIndex = list.findIndex((i: any) => i.uid === over?.id);
      setFun(arrayMove(list, activeIndex, overIndex));
    }
  };

  const customRequest = (fileData: any) => {
    refList.current = [...list]
    if(fileData?.file) {
      uploadFile({file: fileData?.file, cat: 'img'}).then((res: any) => {
        const index = value?.findIndex((item: any) => item.uid === res.path)
        if(index === -1) {
          const obj: any = {
            uid: res.path,
            name: res.path,
            status: "done",
            thumbUrl: res.preview
          }
          const d = [...value]
          d.push(obj)
          onChange(d)
          const index2 = refList.current?.findIndex((item: any) => item.uid === fileData?.file?.uid)
          if(index2 !== -1) {
            refList.current.splice(index2, 1, obj)
            setFileList(refList.current)
          }
        } else {
          message.error('不能上传相同的图片')
        }
      })
    }
  }

  const isUpload = useRef(false)
  const _onChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    if(!isUpload.current) {
      setFileList(newFileList);
    }
  };

  useLayoutEffect(() => {
    if(!list?.length) {
      setFileList(value)
    }
  }, [value])

  return (
    <div className={s['upload-box']}>
      <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
        <SortableContext items={list?.map((i: any) => i.uid) || []} strategy={rectSortingStrategy}>
          <Upload
            accept=".jpg,.png,.jpeg"
            beforeUpload={(file, fileList) => {
              if (!isFileImage(file)) {
                isUpload.current = true
                return false
              }
              if((fileList?.length + list?.length) > 5) {
                isUpload.current = true
                message.error('最多上传5张图片');
                return false
              } else {
                isUpload.current = false
              }
            }}
            onChange={_onChange}
            listType="picture-card"
            multiple={true}
            maxCount={5}
            fileList={list || []}
            customRequest={customRequest}
            itemRender={(originNode, file, fileList) => {
              return (
                <Spin spinning={file.status === "uploading"} tip='上传中'>
                  <DraggableUploadListItem
                    originNode={originNode}
                    file={file}
                    handlePreview={() => {
                      setPreviewImage(file.thumbUrl);
                      setPreviewOpen(true);
                    }}
                    isZhuTu={file.uid === fileList[0].uid}
                    onRemove={() => {
                      if (list.length <= 1) {
                        return message.error('至少保留一张预览图')
                      }
                      setFun(list?.filter?.((item: any) => item.uid !== file.uid))
                    }}
                  />
                </Spin>
              )
            }}
          >
            {list?.length >= 5 ? null : (
              <div className={s.addIcon}><PlusOutlined /></div>
            )}
          </Upload>
        </SortableContext>
      </DndContext>
      <Modal
        wrapClassName={s.viewImgModel}
        open={previewOpen}
        title={null}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default App;