import Colorful from '@/components/Colorful'
import { useBaseStore } from '@/store/base'
import { createClickText } from '@/scripts/click_text'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { iMember } from './index.interface'
import { post } from '@/scripts/axios'
import { message } from 'antd'

const Room = () => {
  const localID = useBaseStore((state) => state.id)
  const name = useBaseStore((state) => state.name)
  const avatar = useBaseStore((state) => state.avatar)
  const room = useBaseStore((state) => state.room)
  const ws = useBaseStore((state) => state.ws)
  const stream = useBaseStore((state) => state.stream)

  const [member, setMember] = useState<iMember[]>([])

  const memberRef = useRef<iMember[]>([])

  const navigate = useNavigate()

  // 获取音量
  // const getMediaVol = (stream: MediaStream, key: string) => {
  //   const atx = new AudioContext()
  //   const analyser = atx.createAnalyser()
  //   const source = atx.createMediaStreamSource(stream)
  //   source.connect(analyser)

  //   const dataArray = new Uint8Array(analyser.frequencyBinCount)

  //   const setVal = () => {
  //     analyser.getByteFrequencyData(dataArray)
  //     const val = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
  //     key === 'input' ? setInputVol(Math.floor(val)) : setOutputVol(Math.floor(val))
  //     requestAnimationFrame(setVal)
  //   }
  //   setVal()
  // }

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
      message.error(e)
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
          message.error(e)
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
      message.error(e)
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
  }

  // 接收ICE
  const acceptICE = async (data: { id: string; candidate: string }) => {
    const m = memberRef.current.find((item) => item.id === data.id)
    if (m) m.peer.addIceCandidate(new RTCIceCandidate(JSON.parse(data.candidate)))
  }

  // 插入本地流
  useEffect(() => {
    if (stream) {
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
    <div className="flex justify-center items-center">
      <div className="flex my-2 justify-center items-center gap-2 text-white">
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
      <div>
        {member.map((item) => (
          <div key={item.id} className="flex gap-2">
            {item.name}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Room
