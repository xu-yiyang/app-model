// import Loadable from 'react-loadable'
import { getComponentConfig } from '@/utils'

let routesConfig = [
  {
    path: '/',
    component: getComponentConfig({
      componentName: 'Index',
      componentConfig: 'index'
    }),
  },
  {
    path: '/index',
    component: getComponentConfig({
      componentName: 'Index',
      componentConfig: 'index'
    }),
  },
  {
    path: '/login',
    component: getComponentConfig({
      componentName: 'Login',
      componentConfig: 'login'
    }),
  },
]

export {routesConfig}
