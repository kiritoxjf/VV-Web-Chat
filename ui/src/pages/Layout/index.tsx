import StarSky from '@/components/StarSky'
import { useBaseStore } from '@/store/base'
import { ConfigProvider, Form, Input, Modal, Popover } from 'antd'
import { useEffect, useState } from 'react'
import { iInfoForm } from './index.interface'
import Toggle from '@/components/Toggle'
import { Outlet } from 'react-router-dom'
import MicroPhoneSvg from '@/assets/svg/microphone.svg?react'
import WarnSvg from '@/assets/svg/warn.svg?react'
import MaskSvg from '@/assets/svg/mask.svg?react'
import { useForm } from 'react-hook-form'
import { MenuOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

const Layout = () => {
  const ws = useBaseStore((state) => state.ws)
  const devices = useBaseStore((state) => state.devices)
  const updateWebSocket = useBaseStore((state) => state.updateWebsocket)
  const updateName = useBaseStore((state) => state.updateName)
  const updateAvatar = useBaseStore((state) => state.updateAvatar)
  const updateDevices = useBaseStore((state) => state.updateDevices)
  const updateStream = useBaseStore((state) => state.updateStream)

  const [active, setActive] = useState<string>('')
  const [isInfoModel, setIsInfoModel] = useState(false)
  const [isSystemModel, setIsSystemModel] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const infoForm = useForm<iInfoForm>()
  const { t } = useTranslation()

  // checkAudio 检查音频设备
  const checkAudio = async () => {
    return navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          const inputs = devices
            .filter((device) => device.kind === 'audioinput')
            .map((d) => {
              const obj = d.toJSON()
              const { deviceId, groupId, kind, label } = obj
              return { deviceId, groupId, kind, label }
            })
          updateDevices(inputs)
          setActive(inputs[0].deviceId)
        })
      })
      .catch((err) => {
        switch (err.name) {
          case 'NotAllowedError':
            setGlobalError('用户拒绝了音频访问权限')
            break
          case 'NotFoundError':
            setGlobalError('未找到可用的音频输入设备')
            break
          case 'NotReadableError':
            setGlobalError('硬件或浏览器无法读取音频输入设备')
            break
          case 'OverconstrainedError':
            setGlobalError('指定的约束条件无法满足')
            break
          case 'TypeError':
            setGlobalError('参数不正确或丢失')
            break
          default:
            setGlobalError('发生未知错误:' + err.name)
        }
      })
  }

  // checkRTC 检查RTC可用
  const checkRTC = async () => {
    return new Promise((resolve) => {
      const hasRTCPeer = !!window.RTCPeerConnection
      const hasRTCData = !!window.RTCDataChannel
      if (hasRTCPeer && hasRTCData) {
        resolve(true)
      } else {
        setGlobalError('当前浏览器不支持WebRTC')
        resolve(0)
      }
    })
  }

  // 检查个人信息配置
  const checkLocalInfo = () => {
    const localName = localStorage.getItem('name')
    const localAvatar = localStorage.getItem('avatar')
    if (localName) {
      updateName(localName)
      updateAvatar(localAvatar && localAvatar !== 'undefined' ? localAvatar : '')
      infoForm.setValue('name', localName)
      infoForm.setValue('avatar', localAvatar && localAvatar !== 'undefined' ? localAvatar : '')
    } else {
      setIsInfoModel(true)
    }
  }

  // 更新个人信息
  const updateLocalInfo = (data: iInfoForm) => {
    updateName(data.name)
    updateAvatar(data.avatar)
    localStorage.setItem('name', data.name)
    localStorage.setItem('avatar', data.avatar)
    setIsInfoModel(false)
  }

  // 初始化websocket
  const initWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url = window.location.host
    const ws = new WebSocket(`${protocol}//${url}/ws`)
    updateWebSocket(ws)
  }

  // 关闭websocket
  const closeWebSocket = () => {
    if (ws) {
      ws.close()
    }
  }

  // 更新输入流
  useEffect(() => {
    if (active) {
      navigator.mediaDevices.getUserMedia({ audio: { deviceId: active } }).then((stream) => {
        updateStream(stream)
      })
    }
  }, [active])

  useEffect(() => {
    Promise.all([checkRTC(), checkAudio()]).then(() => {
      checkLocalInfo()
      initWebSocket()
    })

    return () => {
      closeWebSocket()
    }
  }, [])

  return (
    <div className="relative w-full h-full flex flex-col bg-main-1/80 overflow-hidden">
      <header className="h-12 px-4 flex items-center text-xl bg-main-2/50 text-main-3">
        <span className="font-bold">{t('title')}</span>
        <MenuOutlined
          className="h-full ml-auto mr-2"
          onClick={() => {
            setMenuOpen(!menuOpen)
          }}
        />
      </header>
      <StarSky className="absolute bg-black -z-10" />
      <div
        className={`absolute w-12 h-12 right-2 top-16 p-2 bg-gray-800 border-2 border-main-2 rounded-full cursor-pointer transition-all ${menuOpen ? 'delay-100' : 'opacity-0 -mt-4 delay-300'} hover:animate-breath
            after:shadow-2 after:shadow-main-3 after:h-full after:w-full after:rounded-full after:absolute after:top-0 after:left-0`}
        title="个人信息"
        onClick={() => {
          setIsInfoModel(true)
        }}
      >
        <MaskSvg className="w-full h-8 text-main-3" />
      </div>
      <Popover
        placement="left"
        overlayInnerStyle={{
          backgroundColor: 'transparent'
        }}
        overlayStyle={{
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '1rem'
        }}
        content={
          <>
            {devices.map((d) => (
              <div
                className={`my-1 py-1 font-own cursor-pointer rounded ${active === d.deviceId ? 'text-main-3' : 'text-main-2'}  hover:bg-gray-200`}
                style={{
                  textShadow: active === d.deviceId ? '0 0 4px #000' : ''
                }}
                key={d.deviceId}
                onClick={() => {
                  setActive(d.deviceId)
                }}
              >
                {d.label.substring(0, 20)}
              </div>
            ))}
          </>
        }
      >
        <div
          className={`absolute w-12 h-12 right-2 top-32 p-2 bg-gray-800 border-2 border-main-2 rounded-full cursor-pointer transition-all ${menuOpen ? ' delay-200' : 'opacity-0 -mt-4 delay-200'} hover:animate-breath
            after:shadow-2 after:shadow-main-3 after:h-full after:w-full after:rounded-full after:absolute after:top-0 after:left-0`}
          title="切换麦克风"
        >
          <MicroPhoneSvg className="w-full text-main-3" />
        </div>
      </Popover>
      <div
        className={`absolute w-12 h-12 right-2 top-48 p-2 bg-gray-800 border-2 border-main-2 rounded-full cursor-pointer transition-all ${menuOpen ? ' delay-300' : 'opacity-0 -mt-4 delay-100'} hover:animate-breath
            after:shadow-2 after:shadow-main-3 after:h-full after:w-full after:rounded-full after:absolute after:top-0 after:left-0`}
        title="系统信息"
        onClick={() => {
          setIsSystemModel(true)
        }}
      >
        <WarnSvg className="w-full h-8 text-main-3" />
      </div>
      <Outlet />
      <ConfigProvider
        theme={{
          components: {
            Modal: {
              colorTextLabel: 'white',
              contentBg: 'transparent',
              boxShadow: 'none',
              zIndexBase: 10
            },
            Form: {
              fontSize: 16,
              labelColor: 'rgba(222,222,222,0.7)',
              fontFamily: 'en-font zh-font'
            }
          }
        }}
      >
        <Modal
          modalRender={(node) => (
            <div className="box-border flex flex-col justify-center items-center font-own">
              {node}
            </div>
          )}
          open={isInfoModel}
          closeIcon={null}
          footer={null}
          onCancel={() => setIsInfoModel(false)}
          destroyOnClose
        >
          <Toggle
            lLabel={t('infoTag')}
            rLabel={t('previewTag')}
            lComponent={
              <div
                className="phone:w-64 desktop:w-80 p-5 flex flex-col justify-center rounded-2xl box-border border-2 border-white/0 shadow-2 shadow-blue-400/40"
                style={{
                  background: `#222831 padding-box, linear-gradient(145deg, transparent 35%,#393E46, #00ADB5) border-box`
                }}
              >
                <Form
                  labelCol={{ span: 5 }}
                  autoComplete="off"
                  onFinish={infoForm.handleSubmit(updateLocalInfo)}
                >
                  <Form.Item name="name" label={t('nickname')} required>
                    <Input
                      {...infoForm.register('name')}
                      defaultValue={infoForm.getValues('name')}
                      style={{
                        background: 'transparent',
                        color: 'white',
                        fontFamily: 'en-font zh-font'
                      }}
                      onChange={(e) => infoForm.setValue('name', e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item name="avatar" label={t('avatar')}>
                    <Input
                      {...infoForm.register('avatar')}
                      defaultValue={infoForm.getValues('avatar')}
                      style={{
                        background: 'transparent',
                        color: 'white',
                        fontFamily: 'en-font zh-font'
                      }}
                      onChange={(e) => infoForm.setValue('avatar', e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item>
                    <button
                      type="submit"
                      className="float-right px-4 py-1 text-main-4 hover:text-main-3 border-2 border-main-4 hover:border-main-3 rounded-lg"
                    >
                      {t('submit')}
                    </button>
                  </Form.Item>
                </Form>
              </div>
            }
            rComponent={
              <div className="px-4 py-2 flex items-center gap-4 text-4xl bg-main-2 rounded-2xl text-main-3">
                <div>
                  <img
                    className="w-12 h-12 rounded-lg object-cover"
                    src={
                      infoForm.watch('avatar') ||
                      'https://img0.pixhost.to/images/614/527153430_boy_smile_dog_1006791_240x320.jpg'
                    }
                    alt={t('avatar')}
                  />
                </div>
                <div className="max-w-48 overflow-hidden text-3xl text-nowrap">
                  {infoForm.watch('name')}
                </div>
              </div>
            }
          />
        </Modal>

        <Modal
          modalRender={(node) => (
            <div className="box-border flex flex-col justify-center items-center font-own">
              {node}
            </div>
          )}
          open={isSystemModel}
          closeIcon={null}
          footer={null}
          onCancel={() => setIsSystemModel(false)}
        >
          <div
            className="phone:w-64 desktop:w-80 p-5 flex flex-col justify-center text-base text-white/60 rounded-2xl box-border border-2 border-white/0 shadow-2 shadow-blue-400/40"
            style={{
              background: `#222831 padding-box, linear-gradient(145deg, transparent 35%,#393E46, #00ADB5) border-box`
            }}
          >
            <p className="text-center text-2xl text-white mb-2">{t('title')}</p>
            <p>{t('desc1')}</p>
            <p>{t('desc2')}</p>
            <p>{t('desc3')}</p>
            <p>{t('desc4')}</p>
            <p className="mt-2">Github Link：</p>
            <p>
              <a href="https://github.com/kiritoxjf/VV-Web-Chat" target="_blank">
                https://github.com/kiritoxjf/VV-Web-Chat
              </a>
            </p>
            <p>Docker Link：</p>
            <p>
              <a href="https://hub.docker.com/r/kiritoxjf/vv-chat" target="_blank">
                https://hub.docker.com/r/kiritoxjf/vv-chat
              </a>
            </p>
          </div>
        </Modal>
      </ConfigProvider>
      {globalError && (
        <div className="absolute w-full h-full flex justify-center items-center flex-1 text-8xl text-white bg-black/80 z-30">
          {globalError}
        </div>
      )}
    </div>
  )
}

export default Layout
