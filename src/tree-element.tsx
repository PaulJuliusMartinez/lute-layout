import * as React from "react"
import { connect } from "react-redux"

import { ContentElement, Element } from "element"
import { focusElement } from "elements-actions"
import { Dispatch, Store } from "store"
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
  physicalId: string
  focusVine: Tree.NodeRef | undefined
}

interface ConnectStateProps {
  element: Element
  children: Tree.Node[]
  focusVine: Tree.NodeRef | undefined
}

interface ConnectDispatchProps {
  focusSelf: (element: Tree.NodeRef) => void
}

type Props = OwnProps & ConnectStateProps & ConnectDispatchProps

function mapStateToProps(store: Store, ownProps: OwnProps): ConnectStateProps {
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

function mapDispatchToProps(dispatch: Dispatch): ConnectDispatchProps {
  return {
    focusSelf: (element: Tree.NodeRef) => {
      dispatch(focusElement(element))
    },
  }
}

interface State {}

class TreeElement extends React.Component<Props, State> {
  div: HTMLElement

  handleElementClick = (e: React.MouseEvent<HTMLElement>) => {
    let { logicalId, physicalId } = this.props
    let elem = e.currentTarget
    let leaf: Tree.MutNodeRef = { logicalId, physicalId }

    while (true) {
      let parentElem = elem.parentElement!
      logicalId = parentElem.dataset.lid!
      physicalId = parentElem.dataset.pid!

      if (!logicalId || !physicalId) {
        this.props.focusSelf(Vine.leaf(leaf))
        break
      }

      let parentNode: Tree.MutNodeRef = { logicalId, physicalId }
      leaf.parent = parentNode
      parentNode.child = leaf

      leaf = parentNode
      elem = parentElem
    }

    e.stopPropagation()
  }

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
          physicalId={child.physicalId}
          focusVine={childFocusPath}
        />
      )
    })
  }

  divRef = (e: HTMLElement | null) => {
    if (e) {
      this.div = e
    }
  }

  render() {
    let { logicalId, physicalId, element, children, focusVine } = this.props
    let content =
      children.length === 0 ? (element as ContentElement).content : this.formatChildren()

    let onFocusPath = Boolean(focusVine)
    let focused = focusVine && !focusVine.child

    let styles = Object.assign({}, STYLES)
    if (onFocusPath) styles.borderColor = "#00f"
    if (focused) styles.borderColor = "#f00"

    return (
      <div
        style={styles}
        onClick={this.handleElementClick}
        ref={this.divRef}
        data-lid={logicalId}
        data-pid={physicalId}
      >
        {content}
      </div>
    )
  }
}

const TreeElementContainer: React.ComponentType<OwnProps> = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TreeElement)

export default TreeElementContainer
