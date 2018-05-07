import * as React from "react"

import CSSPropertiesEditor from "css-properties-editor"
import DebugTreeState from "debug-tree-state"
import FlexLayoutDivider from "flex-layout-divider"
import TreeControl from "keyboard/tree-control"
import TreeElement from "tree-element"
import TreeModifier from "tree-modifier"

export default class FlexLayoutTool extends React.Component<{}, {}> {
  constructor(props: {}) {
    super(props)
    this.state = {} as any
  }

  render() {
    return (
      <div className="flex-layout-tool">
        <div className="flex-layout">
         <TreeElement
           logicalId="0"
           physicalId="0"
           focusVine={undefined /* set by Redux */}
          />
        </div>
        <FlexLayoutDivider horizontal={true} />
        <TreeModifier />
        <FlexLayoutDivider vertical={true} />
        <div className="flex-layout-tool-sidebar">
          <CSSPropertiesEditor logicalId="0" />
        </div>
        <TreeControl />
      </div>
    )
  }
}
