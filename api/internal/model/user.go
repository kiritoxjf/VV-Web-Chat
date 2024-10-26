package model

import (
	"github.com/gorilla/websocket"
	"sort"
)

// iUser 用户
type iUser struct {
	ws     *websocket.Conn
	roomId string
}

// user 用户表
var user = make(map[string]iUser)

// AddUser 添加用户
func AddUser(id string, ip string, ws *websocket.Conn) {
	mutex.Lock()
	defer mutex.Unlock()
	user[id] = iUser{
		ws:     ws,
		roomId: "",
	}
}

// CheckUser 检查用户
func CheckUser(id string) bool {
	_, ok := user[id]
	return ok
}

// UserJoin 加入房间
func UserJoin(id string, roomId string) {
	mutex.Lock()
	defer mutex.Unlock()
	u := user[id]
	u.roomId = roomId
	user[id] = u
}

// DelUser 删除用户
func DelUser(id string) {
	mutex.Lock()
	defer mutex.Unlock()
	delete(user, id)
}

// ListUser 获取用户列表
func ListUser() []string {
	var ids []string

	for id := range user {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	return ids
}
