export const auditStateEnum: any = {
  pending: {
    label: '待审核',
    value: 'pending',
    color: 'orange',
  },
  resubmit: {
    label: '重提交',
    value: 'resubmit',
    color: 'orange',
    tip: '抱歉，您的模型标记材质贴图与实际不符，请修改后重新上传'
  },
  deleted: {
    label: '已删除',
    value: 'deleted',
    color: 'error'
  },
  listed: {
    label: '已上架',
    value: 'listed',
    color: 'processing'
  },
  delisted: {
    label: '已下架',
    value: 'delisted',
    color: 'error',
    tip: '抱歉，因版权纠纷，模型下架'
  },
  rejected: {
    label: '未通过',
    value: 'rejected',
    color: 'error',
  },
}