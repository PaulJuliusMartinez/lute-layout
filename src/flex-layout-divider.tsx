import * as React from "react"

interface State {
  startX: number
  originalWidth: number
}

const SIDEBAR_SIZE = "--sidebar-size"
const MIN_SIZE = 200

export default class FlexLayoutDivider extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props)
    this.state = { startX: 0, originalWidth: 300 }
  }

  startDrag = (e: React.MouseEvent<HTMLElement>) => {
    let styles = window.getComputedStyle(document.body)
    let originalWidth = Number(styles.getPropertyValue(SIDEBAR_SIZE).replace("px", ""))
    this.setState({ originalWidth, startX: e.screenX })

    window.addEventListener("mousemove", this.handleMouseMove)
  }

  handleMouseMove = (e: MouseEvent) => {
    let { startX, originalWidth } = this.state
    let delta = e.screenX - startX
    let newWidth = originalWidth - delta
    if (MIN_SIZE < newWidth && newWidth < window.innerWidth - MIN_SIZE) {
      document.body.style.setProperty(SIDEBAR_SIZE, `${newWidth}px`)
    }
  }

  stopDrag = () => {
    window.removeEventListener("mousemove", this.handleMouseMove)
  }

  render() {
    return (
      <div
        className="flex-layout-divider"
        onMouseDown={this.startDrag}
        onMouseUp={this.stopDrag}
      />
    )
  }
}
