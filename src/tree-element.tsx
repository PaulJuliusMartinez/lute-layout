import * as React from "react"
import { connect } from "react-redux"

import { ContentElement, Element } from "element"
import { Store } from "store"
import * as Tree from "tree"
import * as Vine from "data-structures/vine"

const STYLES: React.CSSProperties = {
  margin: "16px",
  borderWidth: "16px",
  borderStyle: "solid",
  borderColor: "#888",
  padding: "16px",
}

interface OwnProps {
  logicalId: string
  focusVine: Tree.NodeRef | undefined
}

interface ConnectProps {
  element: Element
  children: Tree.Node[]
  focusVine: Tree.NodeRef | undefined
}

type Props = OwnProps & ConnectProps

function mapStateToProps(store: Store, ownProps: OwnProps): ConnectProps {
  let { elements } = store
  let children = elements.tree[ownProps.logicalId]
  let { focusVine } = ownProps
  if (ownProps.logicalId === Tree.ROOT) {
    focusVine = Vine.root(elements.focusedLeaf)
  }
  return {
    children,
    focusVine,
    element: elements.elements[ownProps.logicalId],
  }
}

interface State {}

class TreeElement extends React.Component<Props, State> {
  formatChildren() {
    let { children, focusVine } = this.props
    return children.map(child => {
      let childFocusPath: Tree.NodeRef | undefined
      if (focusVine && focusVine.child) {
        let { logicalId, physicalId } = focusVine.child
        if (child.logicalId === logicalId && child.physicalId === physicalId) {
          childFocusPath = focusVine.child
        }
      }
      return (
        <TreeElementContainer
          key={child.physicalId}
          logicalId={child.logicalId}
          focusVine={childFocusPath}
        />
      )
    })
  }

  render() {
    let { element, children, focusVine } = this.props
    let content =
      children.length === 0 ? (element as ContentElement).content : this.formatChildren()

    let onFocusPath = Boolean(focusVine)
    let focused = focusVine && !focusVine.child

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
