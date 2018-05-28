import * as React from "react"
import { connect } from "react-redux"

import { Mode, switchToMode } from "keyboard/modes"
import { Dispatch } from "store"

interface ModeInputProps {
  mode: Mode
  innerRef?: (elem: HTMLInputElement | null) => void
  setModeOnFocus: (mode: Mode) => void
}

function mapDispatchToProps(dispatch: Dispatch) {
  return { setModeOnFocus: (mode: Mode) => { dispatch(switchToMode(mode)) } }
}

class ModeInput extends React.Component<
  ModeInputProps & React.HTMLProps<HTMLInputElement>
> {
  handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    let { mode, setModeOnFocus, onFocus } = this.props
    setModeOnFocus(mode)
    if (onFocus) onFocus(e)
  }

  render() {
    let { innerRef, mode: _m, setModeOnFocus: _smof, ...restProps  } = this.props
    return <input ref={innerRef} {...restProps} onFocus={this.handleFocus} />
  }
}

export default connect(undefined, mapDispatchToProps)(ModeInput)
