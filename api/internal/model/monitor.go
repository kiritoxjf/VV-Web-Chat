package model

import (
	"github.com/gin-gonic/gin"
	"sync"
	"time"
)

type iMonitorManager struct {
	list  []*gin.Context
	mutex sync.Mutex
}

// MonitorManager 管理器
var MonitorManager = &iMonitorManager{
	list: []*gin.Context{},
}

// AddMonitor
// @Description 添加monitor
// @Author kiritoxjf 2024-11-25 15:14:54
// @Param c *gin.Context
func (m *iMonitorManager) AddMonitor(c *gin.Context) {
	m.mutex.Lock()
	m.list = append(m.list, c)
	m.mutex.Unlock()
}

// RemoveMonitor
// @Description 移除monitor
// @Author kiritoxjf 2024-11-25 15:14:45
// @Param c *gin.Context
func (m *iMonitorManager) RemoveMonitor(c *gin.Context) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	for i, monitor := range m.list {
		if monitor == c {
			m.list = append(m.list[:i], m.list[i+1:]...)
		}
	}
}

// BroadCast
// @Description 广播
// @Author kiritoxjf 2024-11-25 15:15:10
// @Param msg string
func (m *iMonitorManager) BroadCast(msg string) {
	// 获取当前时间，消息格式化
	current := time.Now().Format("2006-01-02 15:04:05")

	// 锁定 list 以防止并发修改
	m.mutex.Lock()
	// 先缓存所有监控连接，避免锁的持有时间过长
	monitors := make([]*gin.Context, len(m.list))
	copy(monitors, m.list)
	m.mutex.Unlock()

	// 启动 Goroutine 来异步处理每个连接的消息发送
	for _, monitor := range monitors {
		go func(c *gin.Context) {
			// 每个 Goroutine 会处理一个连接的 SSE 事件
			c.SSEvent("message", current+" "+msg)
			c.Writer.Flush() // 确保数据及时推送
		}(monitor)
	}
}

// GetLength
// @Description 获取监控数
// @Author kiritoxjf 2024-11-25 15:15:24
// @Return int
func (m *iMonitorManager) GetLength() int {
	return len(m.list)
}
