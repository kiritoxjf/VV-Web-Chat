import styles from './Home.module.scss'
import StarSky from '@/components/StarSky'
import { Button, Form, Input, message, Modal, Select } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { iCall, iDevice } from './index.interface'
import { createClickText } from '@/scripts/click_text'
import AudioSvg from '@/assets/svg/audio.svg?react'
import { PhoneOutlined } from '@ant-design/icons'
import { ResponseCode } from '@/scripts/code'
import Ring from '@/components/Ring'
import Ringed from '@/components/Ringed'
import Calling from '@/components/Calling'

function Home() {
  // About RTC Check
  const [errMsg, setErrMsg] = useState<string>('')
  // About Name
  const [isChangeName, setIsChangeName] = useState<boolean>(false)
  const [name, setName] = useState<string>('')
  // About Socket
  const [connectId, setConnectId] = useState<string>('')
  // About Devices
  const [inputDevices, setInputDevices] = useState<iDevice[]>([])
  const [activeInput, setActiveInput] = useState<iDevice>()

  // About Speak
  const [speak, setSpeak] = useState<boolean>(true)
  const [inputVol, setInputVol] = useState<string>('0%')
  const [outputVol, setOutputVol] = useState<string>('0%')

  // About Call
  // leisure 空闲  ring 响铃中  ringed （被）响铃中  exchange 交换  calling 通话中
  const [state, setState] = useState<'leisure' | 'ring' | 'ringed' | 'exchange' | 'calling'>(
    'leisure'
  )
  const [remoteName, setRemoteName] = useState<string>('') // 对方名字
  const [remoteId, setRemoteId] = useState<string>('') // 对方id
  const [localStream, setLocalStream] = useState<MediaStream>()
  const [remoteStream, setRemoteStream] = useState<MediaStream>()

  const socket = useRef<WebSocket>()
  const peer = useRef<RTCPeerConnection>()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const callForm = useForm<iCall>()

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
    const name = localStorage.getItem('name')
    if (name) {
      setName(name)
      setIsChangeName(false)
      getDevices()
      createConn()
    } else {
      setIsChangeName(true)
    }
  }

  // changeName 设置名字
  const changeName = () => {
    setIsChangeName(false)
    localStorage.setItem('name', name)
    createConn()
    getDevices()
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
    const audioTracks = localStream?.getAudioTracks()
    if (audioTracks && audioTracks.length > 0) {
      audioTracks[0].enabled = true
    }
  }

  // closeMic 关闭麦克风
  const closeMic = () => {
    setSpeak(false)
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
      key === 'input' ? setInputVol(val.toFixed(0) + '%') : setOutputVol(val.toFixed(0) + '%')
      requestAnimationFrame(setVal)
    }
    setVal()
  }

  // 切换音频设备
  const switchDevice = (value: string) => {
    const device = inputDevices.filter((d) => d.deviceId === value)[0]
    setActiveInput(device)
  }

  // knock 呼叫
  const knock = (form: iCall) => {
    const { id } = form
    setRemoteId(id)
    setState('ring')
    socket.current?.send(
      JSON.stringify({
        key: 'knock',
        source: connectId,
        target: id,
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
  const knocked = (obj: { source: string; target: string; name: string }) => {
    const { source, target, name } = obj
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
      <StarSky className="absolute bg-black z-10" />
      {contextHolder}
      {!errMsg && (
        <div className="flex flex-col h-full w-full gap-1 text-white z-20">
          {!isChangeName && (
            <>
              <div className="my-2 text-center text-4xl">
                <div>你的连接码：</div>
                <div className="cursor-pointer" title="点击复制" onClick={handleClickCopy}>
                  {connectId}
                </div>
              </div>
              <div className="flex flex-1 phone:flex-col phone:items-center desktop:flex-row desktop:justify-center gap-8">
                <div className="p-2 h-64 w-80 flex flex-col items-center border-solid border-2 border-gray-200 rounded-lg gap-2 bg-gray-900/80">
                  <div
                    className="text-4xl cursor-pointer"
                    title="点击修改名字"
                    onClick={() => setIsChangeName(true)}
                  >
                    {name}
                  </div>
                  <div className="w-32 h-32 flex justify-center items-center">
                    {speak && (
                      <AudioSvg
                        className={`${styles.microphone} w-24 h-24 rounded-full border-2 border-gray-200 border-solid cursor-pointer`}
                        style={{ '--x': inputVol }}
                        onClick={() => {
                          closeMic()
                        }}
                      />
                    )}
                    {!speak && (
                      <AudioSvg
                        className={`w-24 h-24 rounded-full border-2 border-gray-200 border-solid cursor-pointer bg-red-800`}
                        onClick={() => {
                          openMic()
                        }}
                      />
                    )}
                  </div>
                  <div className="flex w-full">
                    <div className="w-20 leading-8">输入设备：</div>
                    <Select
                      className="flex-1 overflow-hidden"
                      options={(inputDevices || []).map((d) => ({
                        label: d.label,
                        value: d.deviceId
                      }))}
                      value={activeInput?.deviceId}
                      defaultActiveFirstOption={false}
                      onSelect={(value) => switchDevice(value)}
                    />
                  </div>
                </div>
                {state === 'leisure' && (
                  <div className="p-2 w-80 border-solid border-2 border-gray-200 rounded-lg bg-gray-900/80">
                    <Form onFinish={callForm.handleSubmit(knock)}>
                      <Form.Item>
                        <Controller
                          name="id"
                          control={callForm.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              classNames={{
                                input:
                                  'border-x-0 border-t-0 border-gray-200 border-solid rounded-none text-4xl text-center text-white font-own focus:border-e-0 hover:border-e-0'
                              }}
                              addonAfter={
                                <Button
                                  className="bg-green-600 text-white hover:bg-green-200"
                                  htmlType="submit"
                                  icon={<PhoneOutlined />}
                                  size="large"
                                />
                              }
                              variant="borderless"
                            />
                          )}
                        />
                      </Form.Item>
                    </Form>
                  </div>
                )}
                {state === 'ring' && (
                  <Ring remoteName={remoteName} remoteId={remoteId} cancel={cancel} />
                )}
                {state === 'ringed' && (
                  <Ringed
                    remoteName={remoteName}
                    remoteId={remoteId}
                    answer={answer}
                    denial={denial}
                  />
                )}
                {state === 'calling' && (
                  <Calling
                    remoteName={remoteName}
                    audioRef={audioRef}
                    outputVol={outputVol}
                    hangup={hangup}
                  />
                )}
              </div>
            </>
          )}
          <audio ref={audioRef} autoPlay></audio>
          <Modal
            className="top-40 font-own"
            styles={{ content: { background: 'rgba(255,255,255,0.4)', color: 'white' } }}
            open={isChangeName}
            footer={null}
            closable={false}
          >
            <div className="flex flex-col justify-center items-center gap-4">
              <div className="text-4xl">给自己取个名字吧</div>

              <Input
                className="w-60 pb-4 border-x-0 border-t-0 rounded-none border-solid border-gray-200 text-4xl text-center text-white font-own"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={10}
                variant="borderless"
                onPressEnter={changeName}
              />
              <Button className="w-60 phone:inline desktop:hidden" ghost onClick={changeName}>
                OK
              </Button>
            </div>
          </Modal>
        </div>
      )}
      <div className="flex justify-center items-center flex-1 text-8xl text-white z-20">
        {errMsg}
      </div>
    </>
  )
}

export default Home
