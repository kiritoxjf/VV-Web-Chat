package model

import (
	"kiritoxjf/vv_chat/pkg"
	"sort"
)

// Room 房间
type Room struct {
	Owner   string
	Members []string
}

// room 房间表
var room = make(map[string]Room)

// CreateRoom 创建房间
func CreateRoom(owner string) string {
	mutex.Lock()
	defer mutex.Unlock()
	roomId := pkg.GenerateRandomString(5)
	room[roomId] = Room{
		Owner:   owner,
		Members: []string{owner},
	}
	return roomId
}

// CheckRoom 检查房间
func CheckRoom(id string) bool {
	_, ok := room[id]
	return ok
}

// RoomJoin 加入房间
func RoomJoin(id string, roomId string) {
	mutex.Lock()
	defer mutex.Unlock()
	r := room[roomId]
	r.Members = append(r.Members, id)
	room[roomId] = r
}

// DelRoom 解散房间
func DelRoom(roomId string) {
	mutex.Lock()
	defer mutex.Unlock()
	delete(room, roomId)
}

// ListRoom 获取房间列表
func ListRoom() []string {
	var ids []string

	for id := range room {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	return ids
}

// RoomInfo 获取房间信息
func RoomInfo(id string) (Room, bool) {
	room, exist := room[id]
	if !exist {
		return Room{}, false
	}
	return room, true
}
