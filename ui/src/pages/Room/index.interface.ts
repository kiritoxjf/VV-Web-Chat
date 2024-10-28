export interface iMember {
  id: string
  name: string
  avatar: string
  peer: RTCPeerConnection
  stream: MediaStream
}
