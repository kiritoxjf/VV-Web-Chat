import StarSky from '@/components/StarSky'
import { lazy } from 'react'
import { createBrowserRouter, RouteObject, RouterProvider } from 'react-router-dom'

const Solo = lazy(() => import('@/pages/Solo'))

const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <>
        <StarSky className="absolute bg-black -z-10" />
        <Solo />
      </>
    )
  }
]

// 创建路由
const router = createBrowserRouter(routes)

// 导出路由
const Routes = () => <RouterProvider router={router} />

export default Routes
