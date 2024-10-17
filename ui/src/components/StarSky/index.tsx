import styles from './index.module.scss'

const StarSky = ({ className }: { className?: string }) => {
  return (
    <div className={`flex-box h-full w-full ${className}`}>
      <div className={`${styles.layer1} fixed w-1 h-1 bg-white rounded-full`}></div>
      <div className={`${styles.layer2} fixed w-1 h-1 bg-white rounded-full`}></div>
      <div className={`${styles.layer3} fixed w-1 h-1 bg-white rounded-full`}></div>
      <div className={`${styles.layer4} fixed w-1 h-1 bg-white rounded-full`}></div>
      <div className={`${styles.layer5} fixed w-1 h-1 bg-white rounded-full`}></div>
    </div>
  )
}

export default StarSky
