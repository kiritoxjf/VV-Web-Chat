export const RTC = () => {
  const peers = new Map<string, RTCPeerConnection>()
  const peerCreate = (id: string) => {
    const peer = new RTCPeerConnection()
    peers.set(id, peer)
    return peer
  }
  const getPeer = (id: string) => {
    return peers.get(id)
  }
  const addStream = (peer: RTCPeerConnection, stream: MediaStream) => {
    stream.getTracks().forEach((track) => peer.addTrack(track, stream))
  }
  return {
    peerCreate,
    getPeer,
    addStream
  }
}

export default RTC
