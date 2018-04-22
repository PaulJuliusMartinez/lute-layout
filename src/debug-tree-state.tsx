import * as React from "react"
import { connect } from "react-redux"

import { ElementsState } from "elements-reducer"
import { Store } from "store"
import * as Tree from "tree"
import * as Vine from "data-structures/vine"

function debug(es: ElementsState): string {
  return (
    "Tree:\n" +
    subTreeToString(
      es,
      { logicalId: "0", physicalId: "0" },
      0,
      es.focusedLeaf,
    )
  )
}

function subTreeToString(
  es: ElementsState,
  node: Tree.Node,
  depth: number,
  focusVine: Tree.NodeRef | undefined,
): string {
  let str = new Array(depth).fill("  ").join("")
  let focused = focusVine && !focusVine.child
  str += `[${node.logicalId}, ${node.physicalId}]`
  if (focused) str += " (focused)"
  str += "\n"
  let children = es.tree[node.logicalId]
  children.forEach(child => {
    if (
      focusVine &&
      focusVine.child &&
      focusVine.child.logicalId === child.logicalId &&
      focusVine.child.physicalId === child.physicalId
    ) {
      str += subTreeToString(es, child, depth + 1, focusVine.child)
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
