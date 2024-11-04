import Colorful from '@/components/Colorful'
import { useBaseStore } from '@/store/base'
import { createClickText } from '@/scripts/click_text'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { iMember } from './index.interface'
import { post } from '@/scripts/axios'
import { message } from 'antd'
import MicroPhoneSvg from '@/assets/svg/microphone.svg?react'

const Room = () => {
  const localID = useBaseStore((state) => state.id)
  const name = useBaseStore((state) => state.name)
  const avatar = useBaseStore((state) => state.avatar)
  const room = useBaseStore((state) => state.room)
  const ws = useBaseStore((state) => state.ws)
  const stream = useBaseStore((state) => state.stream)

  // 输入音量
  const [inputVol, setInputVol] = useState<number>(0)
  // 静音
  const [mute, setMute] = useState<boolean>(false)

  const [member, setMember] = useState<iMember[]>([])

  const memberRef = useRef<iMember[]>([])

  const navigate = useNavigate()
  const [messageApi, contextHolder] = message.useMessage()

  // 获取输入音量
  const getLocalVol = () => {
    if (stream) {
      const atx = new AudioContext()
      const analyser = atx.createAnalyser()
      const source = atx.createMediaStreamSource(stream)
      source.connect(analyser)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const setVal = () => {
        analyser.getByteFrequencyData(dataArray)
        const val = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
        setInputVol(Math.floor(val))
        requestAnimationFrame(setVal)
      }
      setVal()
    }
  }

  // 静音
  const handleMute = () => {
    console.log(stream)
    if (mute) {
      const tracks = stream?.getAudioTracks()
      console.log(tracks)
      if (tracks && tracks.length > 0) {
        tracks[0].enabled = true
      }
      messageApi.info('开麦')
      setMute(false)
    } else {
      const tracks = stream?.getAudioTracks()
      console.log(tracks)
      if (tracks && tracks.length > 0) {
        tracks[0].enabled = false
      }
      messageApi.info('闭麦')
      setMute(true)
    }
  }

  // 成员加入
  const join = async (id: string) => {
    const user: iMember = {
      id,
      name: '',
      avatar: '',
      peer: new RTCPeerConnection(),
      stream: new MediaStream()
    }
    // 流
    stream?.getTracks().forEach((track) => user.peer.addTrack(track, stream))
    user.peer.ontrack = (e) => {
      user.stream = e.streams[0]
      // 创建 audio 元素
      const audioElement = document.createElement('audio')
      audioElement.srcObject = e.streams[0]
      audioElement.autoplay = true // 自动播放
      audioElement.controls = true // 可选：显示控制条
    }

    // memberRef.current = [...memberRef.current, user].sort((a, b) => (a.id > b.id ? 1 : -1))
    memberRef.current = [...memberRef.current, user]
    setMember(memberRef.current)

    // offer
    const offer = await user.peer.createOffer()
    await user.peer.setLocalDescription(offer)

    // ice
    user.peer.onicecandidate = (e) => {
      if (e.candidate) {
        const json = {
          source: localID,
          target: id,
          candidate: JSON.stringify(e.candidate)
        }
        post('/api/ice', json).catch((e) => {
          console.log(e)
        })
      }
    }

    const json = {
      source: localID,
      target: id,
      name,
      avatar,
      offer: JSON.stringify(offer)
    }
    post('/api/offer', json).catch((e) => {
      messageApi.error(e)
    })
  }

  // 成员离开
  const leave = (id: string) => {
    const user = memberRef.current.find((item) => item.id === id)
    if (user) {
      user.peer.close()
      memberRef.current = memberRef.current.filter((item) => item.id !== id)
      setMember(memberRef.current)
    }
    messageApi.info(`${user?.name}离开了房间`)
  }

  // 接受offer
  const acceptOffer = async (data: { id: string; name: string; avatar: string; offer: string }) => {
    const user: iMember = {
      id: data.id,
      name: data.name,
      avatar: data.avatar,
      peer: new RTCPeerConnection(),
      stream: new MediaStream()
    }
    stream?.getTracks().forEach((track) => user.peer.addTrack(track, stream))
    user.peer.ontrack = (e) => {
      user.stream = e.streams[0]
      // 创建 audio 元素
      const audioElement = document.createElement('audio')
      audioElement.srcObject = e.streams[0]
      audioElement.autoplay = true // 自动播放
      audioElement.controls = true // 可选：显示控制条
    }

    const o = new RTCSessionDescription(JSON.parse(data.offer))
    await user.peer.setRemoteDescription(o)

    const answer = await user.peer.createAnswer()
    await user.peer.setLocalDescription(answer)
    // ice
    user.peer.onicecandidate = (e) => {
      if (e.candidate) {
        const json = {
          source: localID,
          target: data.id,
          candidate: JSON.stringify(e.candidate)
        }
        post('/api/ice', json).catch((e) => {
          messageApi.error(e)
        })
      }
    }
    const json = {
      source: localID,
      target: data.id,
      name,
      avatar,
      answer: JSON.stringify(answer)
    }
    post('/api/answer', json).catch((e) => {
      messageApi.error(e)
    })

    memberRef.current = [...memberRef.current, user]
    setMember(memberRef.current)
  }

  // 接收Answer
  const acceptAnswer = async (data: {
    id: string
    name: string
    avatar: string
    answer: string
  }) => {
    memberRef.current = memberRef.current.map((m) => {
      if (m.id === data.id) {
        return {
          ...m,
          name: data.name,
          avatar: data.avatar
        }
      }
      return m
    })
    setMember(memberRef.current)
    const user = memberRef.current.find((item) => item.id === data.id)
    if (!user) return
    const answer = new RTCSessionDescription(JSON.parse(data.answer))
    await user.peer.setRemoteDescription(answer)
    messageApi.info(`${user.name}加入了房间`)
  }

  // 接收ICE
  const acceptICE = async (data: { id: string; candidate: string }) => {
    const m = memberRef.current.find((item) => item.id === data.id)
    if (m) m.peer.addIceCandidate(new RTCIceCandidate(JSON.parse(data.candidate)))
  }

  // 插入本地流
  useEffect(() => {
    if (stream) {
      getLocalVol()
      member.forEach((item) => {
        stream.getTracks().forEach((track) => item.peer.addTrack(track, stream))
      })
    }
  }, [stream])

  useEffect(() => {
    if (!room) {
      navigate('/')
    }

    // 添加ws监听
    if (ws) {
      ws.onmessage = (e) => {
        const json = JSON.parse(e.data)
        switch (json.key) {
          case 'join':
            join(json.id)
            break
          case 'offer':
            acceptOffer(json)
            break
          case 'answer':
            acceptAnswer(json)
            break
          case 'ice':
            acceptICE(json)
            break
          case 'leave':
            leave(json.id)
            break
        }
      }
    }
  }, [])

  // handleClickCopy 点击复制
  const handleClickCopy = (event: React.MouseEvent<HTMLDivElement>) => {
    navigator.clipboard
      .writeText(room)
      .then(() => {
        createClickText(event.pageX, event.pageY, '复制成功')
      })
      .catch(() => {
        createClickText(event.pageX, event.pageY, '浏览器不支持点击复制')
      })
  }

  return (
    <div className="flex flex-col justify-center items-center gap-8 text-main-3">
      {contextHolder}
      <div className="flex my-2 justify-center items-center gap-2">
        <div className="cursor-default">房间号：</div>
        <Colorful
          child={
            <div className="group relative cursor-pointer" onClick={handleClickCopy}>
              <div className="relative text-4xl group-hover:opacity-10">{room}</div>
              <div className="absolute inset-0 items-center justify-center hidden group-hover:flex">
                点击复制
              </div>
            </div>
          }
        ></Colorful>
      </div>
      <div
        className={`relative px-4 py-2 flex items-center gap-4 text-4xl bg-main-2 rounded-2xl overflow-hidden animate-hidden-show cursor-pointer border-2 ${mute ? 'border-red-700' : inputVol > 30 ? 'border-main-3' : 'border-main-3/0'}`}
        onClick={handleMute}
      >
        <div>
          <img
            className="w-12 h-12 rounded-lg object-cover"
            src={
              avatar ||
              'https://img0.pixhost.to/images/614/527153430_boy_smile_dog_1006791_240x320.jpg'
            }
            alt="头像"
          />
        </div>
        <div className="max-w-48 overflow-hidden text-3xl text-nowrap">{name}</div>
        {mute && (
          <div className="absolute left-0 right-0 top-0 bottom-0 flex justify-center items-center bg-main-2/80">
            <MicroPhoneSvg className="w-8 text-red-700" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        {member.map((item) => (
          <div
            key={item.id}
            className="px-4 py-2 w-64 flex items-center gap-4 text-4xl bg-main-2 rounded-2xl animate-right-in"
          >
            <div>
              <img
                className="w-12 h-12 rounded-lg object-cover"
                src={
                  item.avatar ||
                  'https://img0.pixhost.to/images/614/527153430_boy_smile_dog_1006791_240x320.jpg'
                }
                alt="头像"
              />
            </div>
            <div className="max-w-48 overflow-hidden text-3xl text-nowrap">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Room
