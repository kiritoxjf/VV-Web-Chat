package middleware

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
)

func MonitorAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.Query("key")
		pwd := os.Getenv("KEY")
		if pwd == "" {
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"message": "服务器未在环境变量设置口令",
			})
			c.Abort()
			return
		}
		if token != pwd {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "口令错误",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}
