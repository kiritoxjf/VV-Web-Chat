export const createClickText = (x: number, y: number, text: string) => {
  const textEffect = document.createElement('div')

  textEffect.className = 'text-effect'
  textEffect.textContent = text
  document.body.appendChild(textEffect)

  // 位置
  textEffect.style.zIndex = '30'
  textEffect.style.fontSize = '0.8rem'
  textEffect.style.left = x - 20 + 'px'
  textEffect.style.top = y - 20 + 'px'

  // 颜色
  const randomColor = 'hsl(' + Math.random() * 360 + ', 100%, 50%)'
  textEffect.style.color = randomColor

  // 结束移除
  textEffect.addEventListener('animationend', () => {
    document.body.removeChild(textEffect)
  })
}
