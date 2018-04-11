import * as React from "react"

interface Props {
  horizontal?: boolean
  vertical?: boolean
}

interface State {
  startX: number
  originalWidth: number

  startY: number
  originalHeight: number
}

const SIDEBAR_WIDTH = "--sidebar-width"
const BOTTOMBAR_HEIGHT = "--bottombar-height"
const MIN_WIDTH = 200
const MIN_HEIGHT = 200

export default class FlexLayoutDivider extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      startX: 0,
      originalWidth: 300,
      startY: 0,
      originalHeight: 200,
    }
  }

  startDrag = (e: React.MouseEvent<HTMLElement>) => {
    let styles = window.getComputedStyle(document.body)
    let originalWidth = Number(styles.getPropertyValue(SIDEBAR_WIDTH).replace("px", ""))
    let originalHeight = Number(styles.getPropertyValue(BOTTOMBAR_HEIGHT).replace("px", ""))
    this.setState({ originalWidth, originalHeight, startX: e.screenX, startY: e.screenY })

    window.addEventListener("mousemove", this.handleMouseMove)
  }

  handleMouseMove = (e: MouseEvent) => {
    let { startX, originalWidth, startY, originalHeight } = this.state
    if (this.props.vertical) {
      let delta = e.screenX - startX
      let newWidth = originalWidth - delta
      if (MIN_WIDTH < newWidth && newWidth < window.innerWidth - MIN_WIDTH) {
        document.body.style.setProperty(SIDEBAR_WIDTH, `${newWidth}px`)
      }
    }
    if (this.props.horizontal) {
      let delta = e.screenY - startY
      let newHeight = originalHeight - delta
      if (MIN_HEIGHT < newHeight && newHeight < window.innerHeight - MIN_HEIGHT) {
        document.body.style.setProperty(BOTTOMBAR_HEIGHT, `${newHeight}px`)
      }
    }
  }

  stopDrag = () => {
    window.removeEventListener("mousemove", this.handleMouseMove)
  }

  render() {
    let className = "flex-layout-divider"
    if (this.props.horizontal) className += " horizontal"
    if (this.props.vertical) className += " vertical"
    return <div className={className} onMouseDown={this.startDrag} onMouseUp={this.stopDrag} />
  }
}
