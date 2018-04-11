import * as React from "react"

import ElementController from "element-controller"
import FlexElement, { DEFAULT_COLOR, DEFAULT_WIDTH, FocusInfo } from "flex-element"
import FlexLayoutDivider from "flex-layout-divider"
import TreeElement from "tree-element"
import TreeModifier from "tree-modifier"

interface State {
  focusInfo: FocusInfo
}

export default class FlexLayoutTool extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props)
    this.state = {} as any
  }

  render() {
    return (
      <div className="flex-layout-tool">
        <div className="flex-layout">
          {/*
          <FlexElement
            id={0}
            addSiblingBefore={() => alert("Can't add siblings to root.")}
            addSiblingAfter={() => alert("Can't add siblings to root.")}
            remove={() => alert("Can't remove root element.")}
            marginWidth={DEFAULT_WIDTH}
            borderWidth={DEFAULT_WIDTH}
            borderColor={DEFAULT_COLOR}
            paddingWidth={DEFAULT_WIDTH}
            resetStyleCounter={0}
            focus={focusInfo => this.setState({ focusInfo })}
            parentFlex={false}
          />
           */}
          <TreeElement />
        </div>
        <FlexLayoutDivider horizontal={true} />
        <TreeModifier />
        <FlexLayoutDivider vertical={true} />
        <div className="flex-layout-tool-sidebar">
          <ElementController focusInfo={this.state.focusInfo} />
        </div>
      </div>
    )
  }
}
