import { Routes, Route, BrowserRouter, HashRouter } from 'react-router-dom'
// BrowserRouter 要替换成 HashRouter，因为 BrowserRouter 打包之后路由使用不了，路由组件本应该显示的部分直接白屏

const CreateAppRouter = ({routesConfig}: any) => {
  const genRouteComponent = (route: any) => {
    const { path, component: RouteComp }: any = route;
    return(
      <Route
        key={path}
        path={path}
        element={<RouteComp />}
      />
    );
  }
  return (
    <HashRouter>
      <Routes>
        {routesConfig.map((route: any) => (genRouteComponent(route)))}
      </Routes>
    </HashRouter>
  )

}

export {
  CreateAppRouter
}
