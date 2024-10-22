import { Button, ConfigProvider, Form, Input, message, Modal, Popover } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { iDevice, iInfo } from './index.interface'
import { createClickText } from '@/scripts/click_text'
import PenSvg from '@/assets/svg/pen.svg?react'
import MicroPhoneSvg from '@/assets/svg/microphone.svg?react'
import { PhoneOutlined } from '@ant-design/icons'
import { ResponseCode } from '@/scripts/code'
import Ring from '@/components/Ring'
import Ringed from '@/components/Ringed'
import Calling from '@/components/Calling'
import Colorful from '@/components/Colorful'
import Toggle from '@/components/Toggle'

function Solo() {
  // About RTC Check
  const [errMsg, setErrMsg] = useState<string>('')
  // About Name
  const [isChangeInfo, setIsChangeInfo] = useState<boolean>(false)
  const [name, setName] = useState<string>('')
  const [avatar, setAvatar] = useState<string>('')
  // About Socket
  const [connectId, setConnectId] = useState<string>('')
  // About Devices
  const [inputDevices, setInputDevices] = useState<iDevice[]>([])
  const [activeInput, setActiveInput] = useState<iDevice>()

  // About Speak
  const [speak, setSpeak] = useState<boolean>(true)
  const [inputVol, setInputVol] = useState<number>(0)
  const [outputVol, setOutputVol] = useState<number>(0)

  // About Call
  // leisure 空闲  ring 响铃中  ringed （被）响铃中  exchange 交换  calling 通话中
  const [state, setState] = useState<'leisure' | 'ring' | 'ringed' | 'exchange' | 'calling'>(
    'leisure'
  )
  const [remoteName, setRemoteName] = useState<string>('') // 对方名字
  const [remoteId, setRemoteId] = useState<string>('') // 对方id
  const [remoteAvatar, setRemoteAvatar] = useState<string>('') // 对方头像
  const [localStream, setLocalStream] = useState<MediaStream>()
  const [remoteStream, setRemoteStream] = useState<MediaStream>()

  const socket = useRef<WebSocket>()
  const peer = useRef<RTCPeerConnection>()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  let timeout: NodeJS.Timeout

  const infoForm = useForm<iInfo>()

  const [messageApi, contextHolder] = message.useMessage()

  // checkRTC 检查RTC
  const checkAudio = async () => {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          resolve(stream)
        })
        .catch((err) => {
          switch (err.name) {
            case 'NotAllowedError':
              reject('用户拒绝了音频访问权限')
              break
            case 'NotFoundError':
              reject('未找到可用的音频输入设备')
              break
            case 'NotReadableError':
              reject('硬件或浏览器无法读取音频输入设备')
              break
            case 'OverconstrainedError':
              reject('指定的约束条件无法满足')
              break
            case 'TypeError':
              reject('参数不正确或丢失')
              break
            default:
              reject('发生未知错误:' + err.name)
          }
        })
    })
  }

  // checkName 检查名字
  const checkName = () => {
    const localName = localStorage.getItem('name')
    const localAvatar = localStorage.getItem('avatar')
    if (localName) {
      setName(localName)
      setAvatar(localAvatar ?? '')
      infoForm.setValue('name', localName)
      infoForm.setValue('avatar', localAvatar ?? '')
      getDevices()
      createConn()
    } else {
      setIsChangeInfo(true)
    }
  }

  // changeInfo 设置个人信息
  const changeInfo = (form: iInfo) => {
    localStorage.setItem('name', form.name)
    form.avatar && localStorage.setItem('avatar', form.avatar)
    setName(form.name)
    form.avatar && setAvatar(form.avatar)
    createConn()
    getDevices()
    setIsChangeInfo(false)
  }

  // createConn 创建连接
  const createConn = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url = window.location.host
    socket.current = new WebSocket(`${protocol}//${url}/ws`)
    socket.current.onmessage = (e) => {
      setRemoteId((prev) => prev)
      setConnectId((prev) => prev)
      const json = JSON.parse(e.data)
      switch (json.key) {
        case 'id':
          setConnectId(json.value)
          break
        case 'knock':
          knocked(json)
          break
        case 'knocked':
          knockRes(json)
          break
        case 'ice':
          getRemoteIce(json)
          break
        case 'call-offer':
          setRemoteName(json.name)
          break
        case 'offer':
          getRemoteOffer(json)
          break
        case 'answer':
          getRemoteAnswer(json)
          break
        case 'hangup':
          hangup(true)
          break
      }
    }
  }

  // handleClickCopy 点击复制
  const handleClickCopy = (event: React.MouseEvent<HTMLDivElement>) => {
    navigator.clipboard
      .writeText(connectId)
      .then(() => {
        createClickText(event.pageX, event.pageY, '复制成功')
      })
      .catch(() => {
        createClickText(event.pageX, event.pageY, '浏览器不支持点击复制')
      })
  }

  // 获取音频设备
  const getDevices = () => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const inputs = devices
        .filter((d) => d.kind === 'audioinput')
        .map((d) => {
          const obj = d.toJSON()
          const { deviceId, groupId, kind, label } = obj
          return { deviceId, groupId, kind, label }
        })
      setInputDevices(inputs)
      setActiveInput(inputs[0])
    })
  }

  // openMic 打开麦克风
  const openMic = () => {
    setSpeak(true)
    messageApi.info('开麦')
    const audioTracks = localStream?.getAudioTracks()
    if (audioTracks && audioTracks.length > 0) {
      audioTracks[0].enabled = true
    }
  }

  // closeMic 关闭麦克风
  const closeMic = () => {
    setSpeak(false)
    messageApi.info('闭麦')
    const audioTracks = localStream?.getAudioTracks()
    if (audioTracks && audioTracks.length > 0) {
      audioTracks[0].enabled = false
    }
  }

  // 获取音量
  const getMediaVol = (stream: MediaStream, key: string) => {
    const atx = new AudioContext()
    const analyser = atx.createAnalyser()
    const source = atx.createMediaStreamSource(stream)
    source.connect(analyser)

    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const setVal = () => {
      analyser.getByteFrequencyData(dataArray)
      const val = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
      key === 'input' ? setInputVol(Math.floor(val)) : setOutputVol(Math.floor(val))
      requestAnimationFrame(setVal)
    }
    setVal()
  }

  // 切换音频设备
  const switchDevice = (d: iDevice) => {
    setActiveInput(d)
  }

  // knock 呼叫
  const knock = (id: string) => {
    if (id === connectId) return messageApi.warning('不能呼叫自己哦')
    timeout = setTimeout(() => {
      setState('ring')
    }, 300)
    socket.current?.send(
      JSON.stringify({
        key: 'knock',
        source: connectId,
        target: id,
        avatar,
        name
      })
    )
    peer.current = new RTCPeerConnection()
    localStream?.getTracks().forEach((track) => {
      peer.current?.addTrack(track, localStream)
    })

    peer.current.ontrack = (event) => {
      setRemoteStream(event.streams[0])
    }
  }

  // knocked 被呼叫
  const knocked = (obj: { source: string; target: string; name: string; avatar: string }) => {
    const { source, target, name, avatar } = obj
    if (state !== 'leisure') {
      socket.current?.send(
        JSON.stringify({
          key: 'knocked',
          source: target,
          target: source,
          code: ResponseCode.RemoteError,
          message: '对方繁忙中'
        })
      )
      return
    }
    setRemoteName(name)
    setRemoteId(source)
    setRemoteAvatar(avatar)
    setState('ringed')
  }

  // knockRes 呼叫反馈
  const knockRes = (json: {
    source: string
    target: string
    code: string
    name?: string
    message?: string
  }) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    switch (json.code) {
      case ResponseCode.AppError:
        messageApi.warning(json.message)
        setState('leisure')
        break
      case ResponseCode.RemoteError:
        messageApi.warning(json.message)
        setState('leisure')
        break
      case ResponseCode.Denial:
        messageApi.warning('对方拒绝')
        setState('leisure')
        break
      case ResponseCode.Cancel:
        messageApi.warning('对方取消')
        setState('leisure')
        break
      case ResponseCode.StatusOK:
        setRemoteName(json.name ?? '')
        setState('exchange')
        exchangeICE(json.target, json.source)
        sendOffer(json.target, json.source)
        break
    }
  }

  // answer 接听
  const answer = () => {
    socket.current?.send(
      JSON.stringify({
        key: 'knocked',
        source: connectId,
        target: remoteId,
        code: ResponseCode.StatusOK,
        name: name
      })
    )
    setState('exchange')

    peer.current = new RTCPeerConnection()
    localStream?.getTracks().forEach((track) => {
      peer.current?.addTrack(track, localStream)
    })

    peer.current.ontrack = (event) => {
      setRemoteStream(event.streams[0])
    }

    exchangeICE(connectId, remoteId)
  }

  // denial 拒接
  const denial = () => {
    socket.current?.send(
      JSON.stringify({
        key: 'knocked',
        source: connectId,
        target: remoteId,
        code: ResponseCode.Denial
      })
    )
    setState('leisure')
  }

  // cancel 取消呼叫
  const cancel = () => {
    socket.current?.send(
      JSON.stringify({
        key: 'knocked',
        source: connectId,
        target: remoteId,
        code: ResponseCode.Cancel
      })
    )
    setState('leisure')
  }

  // exchangeICE 交换ICE
  const exchangeICE = (source: string, target: string) => {
    if (peer.current) {
      // 交换ICE-candidate
      peer.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.current?.send(
            JSON.stringify({
              key: 'ice',
              source: source,
              target: target,
              candidate: JSON.stringify(event.candidate)
            })
          )
        }
      }
    }
  }

  // sendOffer 发送Offer
  const sendOffer = async (source: string, target: string) => {
    if (peer.current) {
      const offer = await peer.current.createOffer()
      await peer.current.setLocalDescription(offer)
      socket.current?.send(
        JSON.stringify({
          key: 'offer',
          source: source,
          target: target,
          offer: JSON.stringify(offer)
        })
      )
      setState('calling')
    }
  }

  // getRemoteIce 获取远端ICE
  const getRemoteIce = async (json: { candidate: string }) => {
    if (peer.current && json.candidate) {
      await peer.current.addIceCandidate(new RTCIceCandidate(JSON.parse(json.candidate)))
    }
  }

  // getRemoteOffer 获取远端Offer
  const getRemoteOffer = async (json: { source: string; target: string; offer: string }) => {
    if (peer.current && json.offer) {
      console.log(JSON.parse(json.offer))
      await peer.current.setRemoteDescription(new RTCSessionDescription(JSON.parse(json.offer)))
      const answer = await peer.current.createAnswer()
      await peer.current.setLocalDescription(answer)
      socket.current?.send(
        JSON.stringify({
          key: 'answer',
          source: json.target,
          target: json.source,
          answer: JSON.stringify(answer)
        })
      )
      setState('calling')
    }
  }

  // getRemoteAnswer 获取远端Answer
  const getRemoteAnswer = async (json: { answer: string }) => {
    if (peer.current && json.answer) {
      console.log(JSON.parse(json.answer))
      await peer.current.setRemoteDescription(new RTCSessionDescription(JSON.parse(json.answer)))
    }
  }

  // hangup 挂断
  const hangup = (ed: boolean) => {
    if (!ed) {
      socket.current?.send(
        JSON.stringify({
          key: 'hangup',
          source: connectId,
          target: remoteId
        })
      )
    }
    if (peer.current) {
      peer.current.close()
      peer.current = undefined
      setState('leisure')
    }
    if (remoteStream) remoteStream.getTracks().forEach((track) => track.stop())
    setRemoteId('')
    setRemoteName('')
    messageApi.info('已挂断')
  }

  useEffect(() => {
    const getInputStream = async () => {
      if (localStream) localStream.getTracks().forEach((track) => track.stop())
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: activeInput?.deviceId }
      })
      setLocalStream(stream)
      getMediaVol(stream, 'input')
    }
    if (activeInput) getInputStream()
    return () => {
      if (localStream) localStream.getTracks().forEach((track) => track.stop())
    }
  }, [activeInput])

  useEffect(() => {
    if (remoteStream) {
      getMediaVol(remoteStream, 'output')
      if (audioRef.current) audioRef.current.srcObject = remoteStream
    }
    return () => {
      if (remoteStream) remoteStream.getTracks().forEach((track) => track.stop())
    }
  }, [remoteStream])

  useEffect(() => {
    checkAudio()
      .then(() => {
        setErrMsg('')
        checkName()
      })
      .catch((msg) => {
        setErrMsg(msg)
      })
    return () => {
      socket.current?.close()
      peer.current?.close()
      peer.current = undefined
    }
  }, [])

  return (
    <>
      {contextHolder}
      {!errMsg && (
        <div className="relative flex flex-col h-full w-full gap-1 text-white overflow-hidden">
          <Popover
            placement="left"
            content={
              <>
                {inputDevices.map((d) => (
                  <div
                    className={`my-1 py-1 font-own cursor-pointer rounded ${activeInput === d ? 'text-green-600' : ''} hover:bg-gray-200`}
                    key={d.deviceId}
                    onClick={() => {
                      switchDevice(d)
                    }}
                  >
                    {d.label.substring(0, 20)}
                  </div>
                ))}
              </>
            }
          >
            <div
              className="absolute w-12 h-12 right-0 top-8 p-2 m-2 bg-gray-800 border-2 border-[#283593] rounded-full cursor-pointer hover:animate-bounce hover:ani after:shadow-2 after:shadow-[#64b5f6] after:h-full after:w-full after:rounded-full after:absolute after:top-0 after:left-0"
              title="切换麦克风"
            >
              <MicroPhoneSvg className="w-full text-blue-800" />
            </div>
          </Popover>
          {!isChangeInfo && (
            <>
              <div className="flex my-2 justify-center items-center gap-2">
                <div className="cursor-default">你的连接码：</div>
                <Colorful
                  child={
                    <div className="group relative cursor-pointer" onClick={handleClickCopy}>
                      <div className="relative text-4xl group-hover:opacity-10">{connectId}</div>
                      <div className="absolute inset-0 items-center justify-center hidden group-hover:flex">
                        点击复制
                      </div>
                    </div>
                  }
                ></Colorful>
              </div>
              <div className="flex flex-1 phone:flex-col phone:items-center desktop:flex-row desktop:justify-center gap-8">
                <div
                  className={`relative flex place-content-center place-items-center gap-2 h-64 w-64 rounded-full bg-gradient-to-br from-red-400 to-blue-900 
                    before:absolute before:content-[''] before:w-full before:h-full before:rounded-full ${inputVol > 10 ? 'before:shadow-green-500' : ''} ${speak ? '' : 'before:shadow-red-500'} before:shadow-2`}
                >
                  <div className="group h-full w-full relative flex flex-col justify-center items-center rounded-full overflow-hidden">
                    <div className="absolute flex flex-col justify-center items-center gap-4">
                      <img
                        className="w-32 h-32 rounded-full object-cover transition group-hover:-translate-y-40 duration-500 ease-in-out"
                        src={
                          avatar ||
                          'https://images.wallpaperscraft.com/image/single/boy_smile_dog_1006791_240x320.jpg'
                        }
                        alt="头像"
                      />
                      <span className="-mt-4 text-4xl cursor-default transition group-hover:translate-y-40 duration-500 ease-in-out">
                        {name}
                      </span>
                    </div>
                    <div className="absolute flex justify-center items-center gap-8">
                      <PenSvg
                        className="w-12 h-12 text-red-700 cursor-pointer hover:text-red-400 transition -translate-x-40 group-hover:translate-x-0 duration-500 ease-in-out"
                        onClick={() => {
                          setIsChangeInfo(true)
                        }}
                      />
                      <MicroPhoneSvg
                        className={`w-10 h-10 ${speak ? 'text-green-700 hover:text-green-400' : 'text-red-700 hover:text-red-400'} cursor-pointer transition translate-x-40 group-hover:translate-x-0 duration-500 ease-in-out`}
                        onClick={() => {
                          speak ? closeMic() : openMic()
                        }}
                      />
                    </div>
                  </div>
                </div>
                {state === 'leisure' && (
                  <div
                    className={`p-2 w-80 border-solid border-2 border-gray-200 rounded-lg bg-gray-900/80 ${remoteId.length === 8 ? 'border-green-500' : ''}`}
                  >
                    <Input
                      classNames={{
                        input:
                          'border-x-0 border-t-0 border-gray-200 border-solid rounded-none text-4xl text-center text-white font-own focus:border-e-0 hover:border-e-0'
                      }}
                      addonAfter={
                        <Button
                          className="bg-green-600 text-white hover:bg-green-200 animate-bounce"
                          icon={<PhoneOutlined />}
                          size="large"
                          onClick={() => {
                            knock(remoteId)
                          }}
                        />
                      }
                      variant="borderless"
                      value={remoteId}
                      onChange={(e) => {
                        setRemoteId(e.target.value)
                      }}
                      onPressEnter={() => {
                        knock(remoteId)
                      }}
                    />
                    {/* <Form onFinish={callForm.handleSubmit(knock)}>
                      <Controller
                        name="id"
                        control={callForm.control}
                        rules={{
                          required: true
                        }}
                        render={({ field }) => (
                          <Form.Item>
                            <Input
                              {...field}
                              classNames={{
                                input:
                                  'border-x-0 border-t-0 border-gray-200 border-solid rounded-none text-4xl text-center text-white font-own focus:border-e-0 hover:border-e-0'
                              }}
                              addonAfter={
                                <Button
                                  className="bg-green-600 text-white hover:bg-green-200 animate-bounce"
                                  htmlType="submit"
                                  icon={<PhoneOutlined />}
                                  size="large"
                                />
                              }
                              variant="borderless"
                            />
                          </Form.Item>
                        )}
                      />
                    </Form> */}
                  </div>
                )}
                {state === 'ring' && <Ring remoteId={remoteId} cancel={cancel} />}
                {state === 'ringed' && (
                  <Ringed
                    remoteName={remoteName}
                    remoteAvatar={remoteAvatar}
                    answer={answer}
                    denial={denial}
                  />
                )}
                {state === 'calling' && (
                  <Calling
                    remoteName={remoteName}
                    remoteAvatar={remoteAvatar}
                    audioRef={audioRef}
                    outputVol={outputVol}
                    hangup={hangup}
                  />
                )}
              </div>
            </>
          )}
          <audio ref={audioRef} autoPlay></audio>
          <ConfigProvider
            theme={{
              components: {
                Modal: {
                  contentBg: 'transparent'
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
              open={isChangeInfo}
              footer={null}
              closeIcon={null}
              onCancel={() => {
                setIsChangeInfo(false)
              }}
              destroyOnClose
            >
              <Toggle
                lLabel="设置"
                rLabel="预览"
                lComponent={
                  <div className="phone:w-64 desktop:w-80 p-5 flex flex-col justify-center bg-gray-200 rounded-2xl shadow-2 shadow-blue-500">
                    <Form
                      onFinish={infoForm.handleSubmit(changeInfo)}
                      style={{ fontFamily: 'own' }}
                      autoComplete="off"
                    >
                      <Controller
                        control={infoForm.control}
                        name="name"
                        rules={{ required: true, pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]{1,10}$/ }}
                        render={({ field }) => (
                          <Form.Item<iInfo> label="名字" name="name">
                            <Input
                              className="shadow-1 shadow-gray-800"
                              placeholder="Name"
                              onDragEnter={() => {
                                infoForm.handleSubmit(changeInfo)
                              }}
                              {...field}
                            />
                            {infoForm.formState.errors.name?.type === 'required' && (
                              <span className="absolute font-bold text-red-500 left-0 top-8">
                                名字不能为空
                              </span>
                            )}
                            {infoForm.formState.errors.name?.type === 'pattern' && (
                              <span className="absolute font-bold text-red-500 left-0 top-8">
                                长度不能超过10
                              </span>
                            )}
                          </Form.Item>
                        )}
                      />
                      <Controller
                        control={infoForm.control}
                        name="avatar"
                        rules={{
                          pattern: /^(https?:\/\/.*\.(jpg|jpeg|png|gif|bmp|webp))$/
                        }}
                        render={({ field }) => (
                          <Form.Item<iInfo> label="头像" name="avatar">
                            <Input
                              className="shadow-1 shadow-gray-800"
                              placeholder="Avatar(null = default)"
                              {...field}
                              value={field.value}
                            />
                            {infoForm.formState.errors.avatar?.type === 'pattern' && (
                              <span className="absolute font-bold text-red-500 left-0 top-8">
                                请输入正确的图片链接
                              </span>
                            )}
                          </Form.Item>
                        )}
                      />
                      <Form.Item className="phone:inline desktop:hidden">
                        <Button type="primary" className="w-full" htmlType="submit">
                          OK
                        </Button>
                      </Form.Item>
                    </Form>
                  </div>
                }
                rComponent={
                  <div
                    className={`flex place-content-center place-items-center gap-2 h-64 w-64 rounded-full bg-gradient-to-br from-red-400 to-blue-900 
                    before:absolute before:content-[''] before:w-full before:h-full before:rounded-full ${inputVol > 10 ? 'before:shadow-green-500' : ''} before:shadow-1`}
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
                          {infoForm.watch('name') || avatar}
                        </span>
                      </div>
                    </div>
                  </div>
                }
              />
            </Modal>
          </ConfigProvider>
        </div>
      )}
      <div className="flex justify-center items-center flex-1 text-8xl text-white">{errMsg}</div>
    </>
  )
}

export default Solo
