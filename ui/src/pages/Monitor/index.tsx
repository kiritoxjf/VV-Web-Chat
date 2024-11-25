import StarSky from '@/components/StarSky'
import { get } from '@/scripts/axios'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

const Monitor = () => {
  const [messages, setMessages] = useState<string[]>([])

  const { key } = useParams()
  const notifyRef = useRef<EventSource | null>(null)
  const statisticRef = useRef<EventSource | null>(null)

  const notify = () => {
    notifyRef.current = new EventSource(`/auth/notification?key=${key}`)
    notifyRef.current.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data])
    }
  }

  const statistic = () => {
    statisticRef.current = new EventSource(`/auth/statistic?key=${key}`)
    statisticRef.current.onmessage = (event) => {
      console.log(JSON.parse(event.data))
    }
  }

  useEffect(() => {
    get(`/auth/check?key=${key}`)
      .then(() => {
        notify()
        statistic()
      })
      .catch((e) => {
        console.log(e)
      })
    return () => {
      notifyRef.current?.close()
      statisticRef.current?.close()
    }
  }, [])
  return (
    <div className="relative w-full h-full">
      <StarSky className="absolute bg-black -z-10" />
      <div className="w-full h-full bg-main-1/80 overflow-hidden">
        <div>{messages}</div>
        <div></div>
      </div>
    </div>
  )
}

export default Monitor
