package model

import (
	"github.com/gorilla/websocket"
	"sort"
)

// GetConn 获取连接
func GetConn(id string) *websocket.Conn {
	return wsConn[id]
}

// ListConn 连接列表
func ListConn() []string {
	mutex.Lock()
	defer mutex.Unlock()

	var ids []string

	for id := range wsConn {
		ids = append(ids, id)
	}

	sort.Strings(ids)
	return ids
}

// AddConn 新增连接
func AddConn(id string, conn *websocket.Conn) {
	mutex.Lock()
	wsConn[id] = conn
	mutex.Unlock()
}

// DelConn 删除连接
func DelConn(id string) {
	mutex.Lock()
	delete(wsConn, id)
	mutex.Unlock()
}

// WsConn 已连接WS
var wsConn = make(map[string]*websocket.Conn)
