import Loadable from 'react-loadable';
import { Spin } from 'antd';

const REACT__APP__LOADING__BACKGROUND_STYLE: any = {
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
  backgroundColor: '#26272b',
  opopacity: 0.1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export const Loading = () => (
  <div style={REACT__APP__LOADING__BACKGROUND_STYLE}>
    <Spin />
  </div>
)
export function loadable(cmp: any) {
  return Loadable({
    loader: cmp,
    loading: Loading,
  });
}
