package controller

import (
	"github.com/gin-gonic/gin"
	"kiritoxjf/vv_chat/internal/model"
)

// UserList 用户列表
func UserList(c *gin.Context) {
	list := model.ListUser()
	c.JSON(200, gin.H{
		"list":  list,
		"total": len(list),
	})
}
