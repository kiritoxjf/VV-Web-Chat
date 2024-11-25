import { lazy } from 'react'
import { createBrowserRouter, Navigate, RouteObject, RouterProvider } from 'react-router-dom'

const Layout = lazy(() => import('@/pages/Layout'))
const Home = lazy(() => import('@/pages/Home'))
const Room = lazy(() => import('@/pages/Room'))
const Monitor = lazy(() => import('@/pages/Monitor'))

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/room',
        element: <Room />
      }
    ]
  },
  {
    path: '/monitor/:key',
    element: <Monitor />
  },
  {
    path: '*',
    element: <Navigate to="/" replace={true} />
  }
]

// 创建路由
const router = createBrowserRouter(routes)

// 导出路由
const Routes = () => <RouterProvider router={router} />

export default Routes
