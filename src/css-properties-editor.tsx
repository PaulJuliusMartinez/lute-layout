import * as CSS from "csstype"
import * as React from "react"
import { connect } from "react-redux"

import { setElementContent, setElementStyle } from "elements-actions"
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
    setStyle: (style: CSS.Properties) => { dispatch(setElementStyle(style)) },
    setContent: (content: string) => { dispatch(setElementContent(content)) },
  }
}

interface State {
  searchInputValue: string
}

type CSSRule = keyof CSS.Properties

class CSSPropertiesEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { searchInputValue: "" }
  }

  handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchInputValue: e.currentTarget.value })
  }

  handleSearchInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log("enter hit")
    }
  }

  handleRuleValueChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    rule: CSSRule,
  ) => {
    this.props.setStyle({ [rule]: e.currentTarget.value })
  }

  formatSelect(rule: CSSRule, options: string[]) {
    let formattedOptions = options.map(o => (
      <option key={o} value={o}>
        {o}
      </option>
    ))

    return (
      <div>
        {rule}:{" "}
        <select
          value={this.props.styles[rule]}
          onChange={e => this.handleRuleValueChange(e, rule)}
        >
          {formattedOptions}
        </select>
      </div>
    )
  }

  render() {
    return (
      <div>
        <input
          type="text"
          value={this.state.searchInputValue}
          onChange={this.handleSearchInputChange}
          onKeyPress={this.handleSearchInputKeyPress}
          placeholder="Enter the name of a CSS rule"
        />
        <div>
          <h3>Layout</h3>
          {this.formatSelect("display", ["block", "flex", "inline"])}
          {this.formatSelect("justifyContent", ["flex-start", "flex-end", "center", "space-between"])}
          {this.formatSelect("alignItems", ["flex-start", "flex-end", "center", "stretch"])}
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CSSPropertiesEditor)
