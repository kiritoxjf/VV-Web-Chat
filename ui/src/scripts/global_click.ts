// createClickEffect 创建点击特效
const createClickEffect = (x: number, y: number) => {
  const effect = document.createElement('div')
  effect.className = 'global-click-effect'
  document.body.appendChild(effect)

  // 位置
  effect.style.zIndex = '30'
  effect.style.left = x - 20 + 'px'
  effect.style.top = y - 20 + 'px'

  // 颜色
  const randomColor = 'hsl(' + Math.random() * 360 + ', 100%, 50%)'
  effect.style.borderColor = randomColor

  // 结束移除
  effect.addEventListener('animationend', () => {
    document.body.removeChild(effect)
  })
}

// document全局点击事件
document.addEventListener('click', (event) => {
  createClickEffect(event.pageX, event.pageY)
})

const style = document.createElement('style')
style.textContent = `
.global-click-effect {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid;
  animation: global-click-effect 0.3s ease-out;
}

@keyframes global-click-effect {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
`
document.head.appendChild(style)
