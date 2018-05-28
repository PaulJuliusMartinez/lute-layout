import * as CSS from "csstype"
import * as React from "react"
import { connect } from "react-redux"

import { setElementContent, setElementStyle } from "elements-actions"
import { Mode } from "keyboard/modes"
import ModeInput from "keyboard/mode-input"
import * as Flex from "flex"
import { Dispatch, Store } from "store"

interface OwnProps {
  logicalId: string
}

interface ConnectStateProps {
  styles: CSS.Properties
  content: string
}

interface ConnectDispatchProps {
  setStyle: (style: CSS.Properties) => void
  setContent: (content: string) => void
}

type Props = OwnProps & ConnectStateProps & ConnectDispatchProps

function mapStateToProps(store: Store, ownProps: OwnProps): ConnectStateProps {
  return { ...store.elements.elements[ownProps.logicalId] }
}

function mapDispatchToProps(dispatch: Dispatch): ConnectDispatchProps {
  return {
    setStyle: (style: CSS.Properties) => {
      dispatch(setElementStyle(style))
    },
    setContent: (content: string) => {
      dispatch(setElementContent(content))
    },
  }
}

interface State {
  ruleInputValue: string
  valueInputValue: string
}

type CSSRule = keyof CSS.Properties

class CSSPropertiesEditor extends React.Component<Props, State> {
  ruleInput: HTMLInputElement
  valueInput: HTMLInputElement

  constructor(props: Props) {
    super(props)
    this.state = { ruleInputValue: "", valueInputValue: "" }
  }

  setRuleInputRef = (e: HTMLInputElement | null) => {
    if (e) this.ruleInput = e
  }

  setValueInputRef = (e: HTMLInputElement | null) => {
    if (e) this.valueInput = e
  }

  handleRuleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ ruleInputValue: e.currentTarget.value })
  }

  handleRuleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      this.valueInput.focus()
    }
  }

  handleValueInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ valueInputValue: e.currentTarget.value })
  }

  handleValueInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      this.props.setStyle({ [this.state.ruleInputValue]: this.state.valueInputValue })
      this.ruleInput.focus()
    }
  }

  formatStyles() {
    let { styles } = this.props
    let formattedStyles = Object.keys(styles).map(ruleName => {
      return (
        <tr key={ruleName} className="set-style">
          <td className="rule-name">{ruleName}</td>
          <td className="rule-value">{(styles as any)[ruleName]}</td>
        </tr>
      )
    })

    return <table><tbody>{formattedStyles}</tbody></table>
  }

  render() {
    return (
      <div>
        <ModeInput
          innerRef={this.setRuleInputRef}
          mode={Mode.StyleEditing}
          type="text"
          value={this.state.ruleInputValue}
          onChange={this.handleRuleInputChange}
          onKeyPress={this.handleRuleInputKeyPress}
          placeholder="CSS Rule Name"
        />
        <ModeInput
          innerRef={this.setValueInputRef}
          mode={Mode.StyleEditing}
          type="text"
          value={this.state.valueInputValue}
          onChange={this.handleValueInputChange}
          onKeyPress={this.handleValueInputKeyPress}
          placeholder="Value"
        />
        {this.formatStyles()}
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CSSPropertiesEditor)
