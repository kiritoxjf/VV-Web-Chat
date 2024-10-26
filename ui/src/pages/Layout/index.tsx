import StarSky from '@/components/StarSky'
import { useBaseStore } from '@/store/base'
import { Button, ConfigProvider, Form, Input, Modal, Popover } from 'antd'
import { useEffect, useState } from 'react'
import { iInfoForm } from './index.interface'
import Toggle from '@/components/Toggle'
import { Outlet } from 'react-router-dom'
import MicroPhoneSvg from '@/assets/svg/microphone.svg?react'
import WarnSvg from '@/assets/svg/warn.svg?react'
import MaskSvg from '@/assets/svg/mask.svg?react'
import { useForm } from 'react-hook-form'

const Layout = () => {
  const ws = useBaseStore((state) => state.ws)
  const name = useBaseStore((state) => state.name)
  const avatar = useBaseStore((state) => state.avatar)
  const devices = useBaseStore((state) => state.devices)
  const activeDevice = useBaseStore((state) => state.activeDevice)
  const updateWebSocket = useBaseStore((state) => state.updateWebsocket)
  const updateName = useBaseStore((state) => state.updateName)
  const updateAvatar = useBaseStore((state) => state.updateAvatar)
  const updateDevices = useBaseStore((state) => state.updateDevices)
  const updateActiveDevice = useBaseStore((state) => state.updateActiveDevice)

  const [isInfoModel, setIsInfoModel] = useState(false)
  const [isSystemModel, setIsSystemModel] = useState(false)
  const [globalError, setGlobalError] = useState('')

  const infoForm = useForm<iInfoForm>()

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
          updateActiveDevice(inputs[0])
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
      updateAvatar(localAvatar ?? '')
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
    <div className="relative w-full h-full bg-black/50 overflow-hidden">
      <StarSky className="absolute bg-black -z-10" />
      <div
        className="absolute w-12 h-12 right-2 top-4 p-2 bg-gray-800 border-2 border-[#283593] rounded-full cursor-pointer hover:animate-breath
            after:shadow-2 after:shadow-[#64b5f6] after:h-full after:w-full after:rounded-full after:absolute after:top-0 after:left-0"
        title="个人信息"
        onClick={() => {
          setIsInfoModel(true)
        }}
      >
        <MaskSvg className="w-full h-8 text-blue-400" />
      </div>
      <Popover
        placement="left"
        content={
          <>
            {devices.map((d) => (
              <div
                className={`my-1 py-1 font-own cursor-pointer rounded ${activeDevice === d ? 'text-green-600' : ''} hover:bg-gray-200`}
                key={d.deviceId}
                onClick={() => {
                  updateActiveDevice(d)
                }}
              >
                {d.label.substring(0, 20)}
              </div>
            ))}
          </>
        }
      >
        <div
          className="absolute w-12 h-12 right-2 top-20 p-2 bg-gray-800 border-2 border-[#283593] rounded-full cursor-pointer hover:animate-breath
            after:shadow-2 after:shadow-[#64b5f6] after:h-full after:w-full after:rounded-full after:absolute after:top-0 after:left-0"
          title="切换麦克风"
        >
          <MicroPhoneSvg className="w-full text-blue-800" />
        </div>
      </Popover>
      <div
        className="absolute w-12 h-12 right-2 top-36 p-2 bg-gray-800 border-2 border-[#283593] rounded-full cursor-pointer hover:animate-breath
            after:shadow-2 after:shadow-[#64b5f6] after:h-full after:w-full after:rounded-full after:absolute after:top-0 after:left-0"
        title="系统信息"
        onClick={() => {
          setIsSystemModel(true)
        }}
      >
        <WarnSvg className="w-full h-8 text-blue-400" />
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
              fontFamily: 'Gap YeZiGongChangXiaoShiTou'
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
            lLabel="信息"
            rLabel="预览"
            lComponent={
              <div
                className="phone:w-64 desktop:w-80 p-5 flex flex-col justify-center rounded-2xl box-border border-2 border-white/0 shadow-2 shadow-blue-400/40"
                style={{
                  background: `linear-gradient(rgba(33, 33, 33), rgba(33, 33, 33)) padding-box, linear-gradient(145deg, transparent 35%,#5b247a, #1bcedf) border-box`
                }}
              >
                <Form
                  labelCol={{ span: 5 }}
                  autoComplete="off"
                  onFinish={infoForm.handleSubmit(updateLocalInfo)}
                >
                  <Form.Item name="name" label="昵称" required>
                    <Input
                      {...infoForm.register('name')}
                      defaultValue={name}
                      style={{
                        background: 'transparent',
                        color: 'white',
                        fontFamily: 'Gap YeZiGongChangXiaoShiTou'
                      }}
                      onChange={(e) => infoForm.setValue('name', e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item name="avatar" label="头像">
                    <Input
                      {...infoForm.register('avatar')}
                      defaultValue={avatar}
                      style={{
                        background: 'transparent',
                        color: 'white',
                        fontFamily: 'Gap YeZiGongChangXiaoShiTou'
                      }}
                      onChange={(e) => infoForm.setValue('avatar', e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button className="float-right bg-white/0 text-white" htmlType="submit">
                      确定
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            }
            rComponent={
              <div
                className={`flex place-content-center place-items-center gap-2 h-64 w-64 rounded-full bg-gradient-to-br from-red-400 to-blue-900 
              before:absolute before:content-[''] before:w-full before:h-full before:rounded-full before:shadow-1`}
              >
                <div className="h-full w-full relative flex flex-col justify-center items-center rounded-full overflow-hidden">
                  <div className="absolute flex flex-col justify-center items-center gap-4">
                    <img
                      className="w-32 h-32 rounded-full object-cover"
                      src={
                        infoForm.watch('avatar') ||
                        'https://images.wallpaperscraft.com/image/single/boy_smile_dog_1006791_240x320.jpg'
                      }
                      alt="头像"
                    />
                    <span className="-mt-4 text-4xl text-white cursor-default">
                      {infoForm.watch('name') || ''}
                    </span>
                  </div>
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
            className="phone:w-64 desktop:w-80 p-5 flex flex-col justify-center text-white/60 rounded-2xl box-border border-2 border-white/0 shadow-2 shadow-blue-400/40"
            style={{
              background: `linear-gradient(rgba(33, 33, 33), rgba(33, 33, 33)) padding-box, linear-gradient(145deg, transparent 35%,#5b247a, #1bcedf) border-box`
            }}
          >
            <p className="text-center text-2xl text-white mb-2">VV语音</p>
            <p>·基于WebRTC的开源Web端语音聊天系统</p>
            <p>·支持多人房间语音</p>
            <p>·完全开源免费</p>
            <p>·简单部署，操作方便</p>
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
