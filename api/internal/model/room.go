package model

import (
	"kiritoxjf/vv_chat/pkg"
	"sync"
)

// iRoom 房间
type iRoom struct {
	id      string
	Owner   string
	Members []string
	mutex   sync.Mutex
}

// iRoomManager
type iRoomManager struct {
	rooms map[string]*iRoom
	mutex sync.Mutex
}

// RoomManager 管理器
var RoomManager = &iRoomManager{
	rooms: make(map[string]*iRoom),
}

// CreateRoom 创建房间
func (m *iRoomManager) CreateRoom(owner string) string {
	m.mutex.Lock()
	id := pkg.GenerateRandomString(5)
	m.rooms[id] = &iRoom{
		id:    id,
		Owner: owner,
		Members: []string{
			owner,
		},
	}
	m.mutex.Unlock()
	return id
}

// DelRoom 删除房间
func (m *iRoomManager) DelRoom(id string) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	delete(m.rooms, id)
}

// GetRoom 获取房间
func (m *iRoomManager) GetRoom(id string) (*iRoom, bool) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	room, exist := m.rooms[id]
	return room, exist
}

// DelMember 删除成员
func (r *iRoom) DelMember(id string) {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	if len(r.Members) == 1 {
		RoomManager.DelRoom(r.id)
	}
	for i, member := range r.Members {
		if member == id {
			r.Members = append(r.Members[:i], r.Members[i+1:]...)
		}
	}
}

// ListRoom 房间列表
func (m *iRoomManager) ListRoom() []string {
	var rooms []string
	for room := range m.rooms {
		rooms = append(rooms, room)
	}
	return rooms
}

// JoinMember 加入房间
func (r *iRoom) JoinMember(id string) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	joinJson := map[string]string{
		"key":  "join",
		"id":   id,
		"code": pkg.StatusOK,
	}
	if err := r.BroadCast(joinJson); err != nil {
		return err
	}
	return nil
}

// BroadCast 广播
func (r *iRoom) BroadCast(msg interface{}) error {
	for _, member := range r.Members {
		u, _ := UserManager.GetUser(member)
		if err := u.SafeWriteJson(msg); err != nil {
			return err
		}
	}
	return nil
}

//// room 房间表
//var room = make(map[string]IRoom)
//
//// CreateRoom 创建房间
//func CreateRoom(owner string) string {
//	Mutex.Lock()
//	defer Mutex.Unlock()
//	roomId := pkg.GenerateRandomString(5)
//	room[roomId] = IRoom{
//		Owner:   owner,
//		Members: []string{owner},
//	}
//	return roomId
//}
//
//// CheckRoom 检查房间
//func CheckRoom(id string) bool {
//	_, ok := room[id]
//	return ok
//}
//
//// RoomJoin 加入房间
//func RoomJoin(id string, roomId string) {
//	Mutex.Lock()
//	defer Mutex.Unlock()
//	r := room[roomId]
//	r.Members = append(r.Members, id)
//	room[roomId] = r
//}
//
//// RoomLeave 离开房间
//func RoomLeave(id string, roomId string) {
//	Mutex.Lock()
//	defer Mutex.Unlock()
//	r := room[roomId]
//	for i, m := range r.Members {
//		if m == id {
//			r.Members = append(r.Members[:i], r.Members[i+1:]...)
//			break
//		}
//	}
//	room[roomId] = r
//}
//
//// GetMember 获取房间成员
//func GetMember(id string) []string {
//	r := room[id]
//	return r.Members
//}
//
//// DelRoom 解散房间
//func DelRoom(roomId string) {
//	Mutex.Lock()
//	defer Mutex.Unlock()
//	delete(room, roomId)
//}
//
//// ListRoom 获取房间列表
//func ListRoom() []string {
//	var ids []string
//
//	for id := range room {
//		ids = append(ids, id)
//	}
//	sort.Strings(ids)
//	return ids
//}
//
//// RoomInfo 获取房间信息
//func RoomInfo(id string) (IRoom, bool) {
//	room, exist := room[id]
//	if !exist {
//		return IRoom{}, false
//	}
//	return room, true
//}
