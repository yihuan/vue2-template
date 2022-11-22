import qs from 'qs'
import axios from 'axios'
import { Message } from 'element-ui'

const isProd = process.env.NODE_ENV === 'production'
export const BASE_URL = isProd
  ? window.location.origin + '/aa/'
  : window.location.protocol + '//xxx.dev.cn/aa/'

const MSG_DURATION = 2500

axios.defaults.withCredentials = true
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

axios.interceptors.request.use(
  function (config) {
    const moreConfig = {
      crossDomain: true
    }
    config = Object.assign(config, moreConfig)
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  (response) => {
    if (response.data.code === 200) {
      return Promise.resolve(response.data)
    } else {
      Message({
        dangerouslyUseHTMLString: true,
        type: 'error',
        message: response.data.msg,
        duration: MSG_DURATION
      })
      return Promise.reject(response.data.msg)
    }
  },
  (error) => {
    try {
      const statusCode = error.response && error.response.status
      if (statusCode) {
        switch (statusCode) {
          case 302: {
            const currentPath = document.location.href
            const redirectPage =
              BASE_URL + 'login/toL?fromUrl=' + encodeURIComponent(currentPath)
            location.href = redirectPage
            break
          }
          case 401:
            break
          // 请求不存在
          case 404:
            Message({
              dangerouslyUseHTMLString: true,
              type: 'error',
              message: '网络请求不存在',
              duration: MSG_DURATION
            })
            break
          case 500:
            Message({
              type: 'error',
              message: '服务器发生错误，请稍后再试',
              duration: MSG_DURATION
            })
            break
          default:
            Message({
              dangerouslyUseHTMLString: true,
              type: 'error',
              message: error.response.data.message,
              duration: MSG_DURATION
            })
        }
        return Promise.reject(error.response)
      }
    } catch (error) {
      console.error('Error', error) // eslint-disable-line
    }
  }
)

const CancelToken = axios.CancelToken
const cancellableRequests = {}

export const postRequest = ({
  url,
  tag = '',
  params = {},
  config = {},
  cancellable = false
}) => {
  if (cancellable && cancellableRequests[url]) {
    cancellableRequests[url]()
  }

  if (!url) {
    console.error('Error:', 'Requested URL is empty') // eslint-disable-line
    return
  }
  const defaultConfig = {
    method: 'post',
    url: url + (tag ? `/${tag}` : ''),
    data: qs.stringify(params),
    cancelToken: new CancelToken(function executor(c) {
      if (cancellable) {
        cancellableRequests[url] = c
      }
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
  }
  config = Object.assign(
    defaultConfig,
    {
      errorTip: false
    },
    config
  )
  return axios(config)
}

export const postBodyRequest = ({
  url,
  tag = '',
  params = {},
  config = {},
  cancellable = false
}) => {
  if (cancellable && cancellableRequests[url]) {
    cancellableRequests[url]()
  }

  if (!url) {
    console.error('Error:', 'Requested URL is empty') // eslint-disable-line
    return
  }
  const defaultConfig = {
    method: 'post',
    url: url + (tag ? `/${tag}` : ''),
    data: params,
    cancelToken: new CancelToken(function executor(c) {
      if (cancellable) {
        cancellableRequests[url] = c
      }
    }),
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  }
  config = Object.assign(
    defaultConfig,
    {
      errorTip: false
    },
    config
  )
  return axios(config)
}

export const getRequest = ({
  url,
  tag = '',
  params = {},
  config = {},
  cancellable = false
}) => {
  if (cancellable && cancellableRequests[url]) {
    cancellableRequests[url]()
  }
  if (!url) {
    console.error('Error:', 'Requested URL is empty') // eslint-disable-line
    return
  }
  const defaultConfig = {
    method: 'get',
    params: params,
    cancelToken: new CancelToken(function executor(c) {
      if (cancellable) {
        cancellableRequests[url] = c
      }
    }),
    url: url + (tag ? `/${tag}` : '')
  }
  config = Object.assign(
    defaultConfig,
    {
      errorTip: false
    },
    config
  )
  return axios(config)
}
