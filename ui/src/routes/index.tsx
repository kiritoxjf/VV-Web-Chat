import { lazy } from 'react'
import { createBrowserRouter, RouteObject, RouterProvider } from 'react-router-dom'

const Home = lazy(() => import('@/pages/Home'))

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />
  }
]

// 创建路由
const router = createBrowserRouter(routes)

// 导出路由
const Routes = () => <RouterProvider router={router} />

export default Routes
