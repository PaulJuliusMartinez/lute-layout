import * as React from "react"
import { connect } from "react-redux"

import { ContentElement, Element } from "element"
import { Store } from "store"
import * as Tree from "tree"

const STYLES: React.CSSProperties = {
  margin: "16px",
  borderWidth: "16px",
  borderStyle: "solid",
  borderColor: "#888",
  padding: "16px",
}

interface OwnProps {
  logicalId: string
  focusPath: Tree.ReverseVine | undefined
}

interface ConnectProps {
  element: Element
  children: Tree.Node[]
  focusPath: Tree.ReverseVine | undefined
}

type Props = OwnProps & ConnectProps

function mapStateToProps(store: Store, ownProps: OwnProps): ConnectProps {
  let { elements } = store
  let children = elements.tree[ownProps.logicalId]
  let { focusPath } = ownProps
  if (ownProps.logicalId === Tree.ROOT) {
    focusPath = elements.focusedElementReverseVine
  }
  return {
    children,
    focusPath,
    element: elements.elements[ownProps.logicalId],
  }
}

interface State {}

class TreeElement extends React.Component<Props, State> {
  formatChildren() {
    let { children, focusPath } = this.props
    return children.map(child => {
      let childFocusPath: Tree.ReverseVine | undefined
      if (focusPath && focusPath.child) {
        let { logicalId, physicalId } = focusPath.child
        if (child.logicalId === logicalId && child.physicalId === physicalId) {
          childFocusPath = focusPath.child
        }
      }
      return (
        <TreeElementContainer
          key={child.physicalId}
          logicalId={child.logicalId}
          focusPath={childFocusPath}
        />
      )
    })
  }

  render() {
    let { element, children, focusPath } = this.props
    let content =
      children.length === 0 ? (element as ContentElement).content : this.formatChildren()

    let onFocusPath = Boolean(focusPath)
    let focused = focusPath && !focusPath.child

    let styles = Object.assign({}, STYLES)
    if (onFocusPath) styles.borderColor = "#00f"
    if (focused) styles.borderColor = "#f00"

    return <div style={styles}>{content}</div>
  }
}

const TreeElementContainer: React.ComponentType<OwnProps> = connect(mapStateToProps)(
  TreeElement,
)

export default TreeElementContainer
