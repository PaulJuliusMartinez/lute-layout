import * as React from "react"
import { connect } from "react-redux"

import { ElementsState } from "elements-reducer"
import { Store } from "store"
import * as Tree from "tree"

function debug(es: ElementsState): string {
  return (
    "Tree:\n" +
    subTreeToString(
      es,
      { logicalId: "0", physicalId: "0" },
      0,
      es.focusedElementReverseVine,
    )
  )
}

function subTreeToString(
  es: ElementsState,
  node: Tree.Node,
  depth: number,
  focusPath: Tree.ReverseVine | undefined,
): string {
  let str = new Array(depth).fill("  ").join("")
  let focused = focusPath && !focusPath.child
  str += `[${node.logicalId}, ${node.physicalId}]`
  if (focused) str += " (focused)"
  str += "\n"
  let children = es.tree[node.logicalId]
  children.forEach(child => {
    if (
      focusPath &&
      focusPath.child &&
      focusPath.child.logicalId === child.logicalId &&
      focusPath.child.logicalId === child.physicalId
    ) {
      str += subTreeToString(es, child, depth + 1, focusPath.child)
    } else {
      str += subTreeToString(es, child, depth + 1, undefined)
    }
  })
  return str
}

function mapStateToProps(state: Store) {
  return state.elements
}

const DebugTreeState: React.SFC<ElementsState> = props => {
  return <pre>{debug(props)}</pre>
}

export default connect(mapStateToProps)(DebugTreeState)
