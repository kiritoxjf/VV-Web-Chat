package controller

import (
	"github.com/gin-gonic/gin"
	"kiritoxjf/vv_chat/internal/model"
	"net/http"
)

// List 获取统计数据
func List(c *gin.Context) {
	users := model.UserManager.ListUser()
	rooms := model.RoomManager.ListRoom()
	c.JSON(http.StatusOK, gin.H{
		"user":  users,
		"room":  rooms,
		"total": len(users),
	})
}

// Room 获取房间信息
func Room(c *gin.Context) {
	roomId := c.Query("roomId")
	room, exist := model.RoomManager.GetRoom(roomId)
	if exist {
		c.JSON(http.StatusOK, gin.H{
			"id":      roomId,
			"owner":   room.Owner,
			"members": room.Members,
		})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{})
	}
}
