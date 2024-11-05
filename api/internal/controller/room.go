package controller

import (
	"github.com/gin-gonic/gin"
	"kiritoxjf/vv_chat/internal/model"
	"kiritoxjf/vv_chat/pkg"
	"net/http"
)

// CreateRoom 创建房间
func CreateRoom(c *gin.Context) {
	var json struct {
		ID string `json:"id"`
	}
	if err := c.ShouldBind(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "传参错误",
		})
		return
	}
	if _, exist := model.UserManager.GetUser(json.ID); exist == true {
		id := model.RoomManager.CreateRoom(json.ID)
		user, _ := model.UserManager.GetUser(json.ID)
		user.JoinRoom(id)
		c.JSON(http.StatusOK, gin.H{
			"id": id,
		})
		return
	} else {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"message": "非法用户",
		})
		return
	}
}

// JoinRoom 加入房间
func JoinRoom(c *gin.Context) {
	var json struct {
		ID     string `json:"id"`
		Name   string `json:"name"`
		Avatar string `json:"avatar"`
		Room   string `json:"roomId"`
	}
	if err := c.ShouldBind(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "传参错误",
		})
		return
	}
	user, exist := model.UserManager.GetUser(json.ID)
	if exist != true {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"message": "非法用户",
		})
		return
	}
	room, exist := model.RoomManager.GetRoom(json.Room)
	if exist != true {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"message": "房间不存在",
		})
		return
	}

	if err := room.JoinMember(json.ID); err != nil {
		return
	}
	user.JoinRoom(json.Room)
	c.JSON(http.StatusOK, gin.H{})
}

// LeaveRoom 离开房间
func LeaveRoom(c *gin.Context) {
	id := c.Query("id")
	roomId := c.Query("room")
	user, exist := model.UserManager.GetUser(id)
	if !exist {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"message": "非法用户",
		})
		return
	}
	user.LeaveRoom()
	room, exist := model.RoomManager.GetRoom(roomId)
	if !exist {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"message": "房间不存在",
		})
		return
	}
	leaveJson := map[string]string{
		"key":  "leave",
		"id":   id,
		"code": pkg.StatusOK,
	}
	if err := room.BroadCast(id, leaveJson); err != nil {
		println(err.Error())
	}
	room.DelMember(id)
	c.JSON(http.StatusOK, gin.H{})
}
