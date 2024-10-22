# 构建React前端
FROM node:18 AS frontend

WORKDIR /app
COPY ./ui/package*.json ./
RUN npm config set registry https://registry.npmmirror.com/
RUN npm ci
COPY ./ui ./
RUN npm run build

# 构建Gin后端，使用Alpine基础镜像
FROM golang:1.23.1-alpine AS backend

WORKDIR /app
ENV GOPROXY=https://goproxy.cn,direct
COPY ./api ./
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o gin-app ./cmd/main.go

# 构建最终镜像
FROM alpine:latest

LABEL version="1.0"
LABEL description="A OpenSource Chat Server based on WebRTC with React and Gin"
LABEL maintainer="kiritoxjf@outlook.com"

# 安装 Nginx、Supervisor 和 gettext
RUN apk add --no-cache nginx supervisor bash gettext tzdata

ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 创建日志目录并设置权限
RUN mkdir -p /var/log/nginx /var/log/gin /var/log/supervisord && \
  chown -R root:root /var/log/nginx /var/log/gin /var/log/supervisord && \
  chmod -R 755 /var/log/nginx /var/log/gin /var/log/supervisord

# 拷贝构建文件和配置
COPY --from=frontend /app/dist /home/ui
COPY ./nginx.conf /etc/nginx/nginx.conf

COPY --from=backend /app/gin-app /usr/local/bin/gin-app
RUN chmod +x /usr/local/bin/gin-app

COPY ./supervisord.conf /etc/supervisord.conf

# 暴露端口
EXPOSE 80 8080

# 启动 Supervisor，使用 envsubst 替换配置
# CMD ["/bin/sh", "-c", "envsubst '${SSL_CERTIFICATE} ${SSL_CERTIFICATE_KEY}' < /etc/nginx/nginx.temp.conf > /etc/nginx/nginx.conf && /usr/bin/supervisord -c /etc/supervisord.conf"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
