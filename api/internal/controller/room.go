package controller

import (
	"github.com/gin-gonic/gin"
	"kiritoxjf/vv_chat/internal/model"
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
	}
	if model.CheckUser(json.ID) {
		roomId := model.CreateRoom(json.ID)
		c.JSON(http.StatusOK, gin.H{
			"id": roomId,
		})
	} else {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"message": "非法用户",
		})
	}
}

// JoinRoom 加入房间
func JoinRoom(c *gin.Context) {
	var json struct {
		ID   string `json:"id"`
		Room string `json:"roomId"`
	}
	if err := c.ShouldBind(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "传参错误",
		})
	}
	if !model.CheckUser(json.ID) {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"message": "非法用户",
		})
		return
	}
	if !model.CheckRoom(json.Room) {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"message": "房间不存在",
		})
		return
	}
	model.UserJoin(json.ID, json.Room)
	model.RoomJoin(json.ID, json.Room)
	c.JSON(http.StatusOK, gin.H{})
}
