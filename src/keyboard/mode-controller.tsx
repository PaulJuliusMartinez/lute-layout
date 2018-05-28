import * as React from "react"
import { connect } from "react-redux"

import TreeControl from "keyboard/tree-control"
import { Mode, switchToStyleEditing, switchToTreeModification } from "keyboard/modes"
import { Dispatch, Store } from "store"

interface ConnectStateProps {
  activeMode: Mode
}

interface ConnectDispatchProps {
  switchToStyleEditing: () => void
  switchToTreeModification: () => void
}

type Props = ConnectStateProps & ConnectDispatchProps

function mapStateToProps(store: Store): ConnectStateProps {
  return { activeMode: store.mode.activeMode }
}

function mapDispatchToProps(dispatch: Dispatch): ConnectDispatchProps {
  return {
    switchToStyleEditing: () => { dispatch(switchToStyleEditing) },
    switchToTreeModification: () => { dispatch(switchToTreeModification) },
  }
}

class ModeController extends React.Component<Props> {
  handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey) {
      if (e.key === "s") this.props.switchToStyleEditing()
      if (e.key === "t") this.props.switchToTreeModification()
    }
  }

  componentDidMount() {
    window.addEventListener("keydown", this.handleKeyDown)
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown)
  }

  render() {
    let { activeMode } = this.props
    return (
      <div className="keyboard-mode-controller">
        {activeMode === Mode.TreeModification ? <TreeControl /> : undefined }
        <div className="active-mode">
          {Mode[activeMode]} Mode
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModeController)
