package controller

import (
	"github.com/gin-gonic/gin"
	"kiritoxjf/vv_chat/internal/model"
	"kiritoxjf/vv_chat/internal/services"
	"time"
)

// MainHandler
// @Description SSE主连接
// @Author kiritoxjf 2024-11-22 18:13:21
// @Param c *gin.Context
func MainHandler(c *gin.Context) {
	c.Writer.Header().Add("Content-Type", "text/event-stream")
	c.Writer.Header().Add("Cache-Control", "no-cache")
	c.Writer.Header().Add("Connection", "keep-alive")

	id := services.LinkStart(c)

	// 获取上下文
	ctx := c.Request.Context()

	for {
		select {
		case <-ctx.Done(): // 客户端断开连接时，Done 通道会关闭
			services.LinkStop(id)
			return
		}
	}
}

// NotifyHandler
// @Description 流式通知
// @Author kiritoxjf 2024-11-22 18:13:32
// @Param c *gin.Context
func NotifyHandler(c *gin.Context) {
	c.Writer.Header().Add("Content-Type", "text/event-stream")
	c.Writer.Header().Add("Cache-Control", "no-cache")
	c.Writer.Header().Add("Connection", "keep-alive")

	c.SSEvent("message", "通知连接已建立")
	c.Writer.Flush()
	model.MonitorManager.AddMonitor(c)

	// 获取上下文
	ctx := c.Request.Context()

	for {
		select {
		case <-ctx.Done(): // 客户端断开连接时，Done 通道会关闭
			model.MonitorManager.RemoveMonitor(c)
			return
		}
	}
}

// StatisticsHandler
// @Description 流式统计
// @Author kiritoxjf 2024-11-25 13:32:11
// @Param c *gin.Context
func StatisticsHandler(c *gin.Context) {
	c.Writer.Header().Add("Content-Type", "text/event-stream")
	c.Writer.Header().Add("Cache-Control", "no-cache")
	c.Writer.Header().Add("Connection", "keep-alive")

	c.SSEvent("message", "通知连接已建立")
	c.Writer.Flush()

	// 获取上下文
	ctx := c.Request.Context()

	for {
		select {
		case <-ctx.Done(): // 客户端断开连接时，Done 通道会关闭
			model.MonitorManager.RemoveMonitor(c)
			return
		case <-time.After(time.Second * 5):
			userNum := model.UserManager.GetNumb()
			roomNum := model.RoomManager.GetNumb()
			staticJson := map[string]int{
				"user": userNum,
				"room": roomNum,
			}
			c.SSEvent("message", staticJson)
			c.Writer.Flush()
		}
	}
}
