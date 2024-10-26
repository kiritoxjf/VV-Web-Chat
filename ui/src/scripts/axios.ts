/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

// 创建一个 axios 实例
const instance = axios.create({
  // 配置你的基本 URL、超时等
  // baseURL: "https://xxx.cn/api/",
  // timeout: 10000,
  withCredentials: true
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 在请求发送前可以做一些处理
    config.params = {
      ...config.params,
      t: new Date().getTime()
    }
    return config
  },
  (error) => {
    // 处理请求错误
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 在响应返回后可以做一些处理
    return response
  },
  (error) => {
    // 处理响应错误
    if (error.response.status === 401) {
      // 处理未授权的逻辑
      window.location.href = '/sign'
    }
    return Promise.reject(error)
  }
)

// 封装 GET 请求
export const get = async <T>(
  url: string,
  params: any = {},
  config: AxiosRequestConfig = { headers: { 'Content-Type': 'application/json;charset=utf-8' } }
): Promise<T> => {
  return new Promise((resolve, reject) => {
    instance
      .get<T>(url, { params, ...config })
      .then((res) => {
        resolve(res.data)
      })
      .catch((err) => {
        reject(err.response.data.message || '请求失败')
      })
  })
}

// 封装 POST 请求
export const post = async <T>(
  url: string,
  data?: any,
  config: AxiosRequestConfig = { headers: { 'Content-Type': 'application/json;charset=utf-8' } }
): Promise<T> => {
  return new Promise((resolve, reject) => {
    instance
      .post<T>(url, data, config)
      .then((res) => {
        resolve(res.data)
      })
      .catch((err) => {
        reject(err.response.data.message || '请求失败')
      })
  })
}

// 封装 PUT 请求
export const put = async <T>(
  url: string,
  data?: any,
  config: AxiosRequestConfig = { headers: { 'Content-Type': 'application/json;charset=utf-8' } }
): Promise<T> => {
  return new Promise((resolve, reject) => {
    instance
      .put<T>(url, data, config)
      .then((res) => {
        resolve(res.data)
      })
      .catch((err) => {
        reject(err.response.data.message || '请求失败')
      })
  })
}

// 封装 DELETE 请求
export const del = async <T>(
  url: string,
  params: any = {},
  config: AxiosRequestConfig = { headers: { 'Content-Type': 'application/json;charset=utf-8' } }
): Promise<T> => {
  return new Promise((resolve, reject) => {
    instance
      .delete<T>(url, { params, ...config })
      .then((res) => {
        resolve(res.data)
      })
      .catch((err) => {
        reject(err.response.data.message || '请求失败')
      })
  })
}

// 封装 DOWNLOAD 请求
export const down = async (
  url: string,
  params: any = {},
  config?: AxiosRequestConfig
): Promise<AxiosResponse> => {
  return new Promise((resolve, reject) => {
    instance
      .get(url, { params, ...config, responseType: 'blob' })
      .then((res) => {
        resolve(res)
      })
      .catch((err) => {
        reject(err.response.data.message || '请求失败')
      })
  })
}

// // 处理响应错误的函数
// const handleErrorResponse = (error: any) => {
// 	// 检查是否是 token 过期的错误，根据实际情况修改
// 	if (error.response && error.response.status === 401) {
// 		console.log("Token expired or invalid! Redirecting to login page...");
// 		// 清除 token
// 		document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
// 		// 可以跳转到登录页
// 		// router.push('/login');
// 	}
// };

// // 判断 Token 是否过期的函数，根据实际情况修改
// const isTokenExpired = (token: string | null): boolean => {
// 	// 实际情况中，可能需要解码 token 并检查是否过期
// 	// 返回 true 表示过期，返回 false 表示未过期
// 	return false;
// };

