package pkg

import (
	"crypto/rand"
	"math/big"
)

// GenerateRandomString 生成随机串
func GenerateRandomString(length int) string {
	chars := "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	result := make([]byte, length)
	for i := range result {
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(chars))))
		result[i] = chars[num.Int64()]
	}
	return string(result)
}
