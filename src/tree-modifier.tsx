import * as React from "react"
import { connect } from "react-redux"

import * as TreeActions from "elements-actions"
import { Dispatch } from "store"
import * as Tree from "tree"

interface Props {
  // Add elements
  addChildStart: () => void
  addChildEnd: () => void
  addSiblingBefore: () => void
  addSiblingAfter: () => void

  // Delete element and all children
  deleteElement: () => void
  // Remove all children
  removeChildren: () => void
  // Replace element with children
  flatten: () => void
  // Wrap current node in a new node
  wrap: () => void

  moveUp: () => void
  moveDown: () => void
  moveLeft: () => void
  moveRight: () => void

  makeFirstChild: () => void
  makeLastChild: () => void

  duplicate: () => void
  shallowDuplicate: () => void
  deepDuplicate: () => void

  dissociate: () => void

  copy: () => void
  paste: () => void

  // Move focus
  moveFocusToFirst: () => void
  moveFocusUp: () => void
  moveFocusDown: () => void
  moveFocusLeft: () => void
  moveFocusRight: () => void
  moveFocusToLast: () => void
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    addChildStart: () => { dispatch(TreeActions.addChildStart()) },
    addChildEnd: () => { dispatch(TreeActions.addChildEnd()) },
    addSiblingBefore: () => { dispatch(TreeActions.addSiblingBefore()) },
    addSiblingAfter: () => { dispatch(TreeActions.addSiblingAfter()) },
    deleteElement: () => { dispatch(TreeActions.deleteNode()) },
    removeChildren: () => { dispatch(TreeActions.removeChildren()) },
    flatten: () => { dispatch(TreeActions.flatten()) },
    wrap: () => { dispatch(TreeActions.wrap()) },

    makeFirstChild: () => { dispatch(TreeActions.moveToFirst()) },
    moveUp: () => { dispatch(TreeActions.moveUp()) },
    moveDown: () => { dispatch(TreeActions.moveDown()) },
    moveLeft: () => { dispatch(TreeActions.moveLeft()) },
    moveRight: () => { dispatch(TreeActions.moveRight()) },
    makeLastChild: () => { dispatch(TreeActions.moveToLast()) },

    duplicate: () => { dispatch(TreeActions.duplicate()) },
    shallowDuplicate: () => { dispatch(TreeActions.shallowDuplicate()) },
    deepDuplicate: () => { dispatch(TreeActions.deepDuplicate()) },
    dissociate: () => { dispatch(TreeActions.dissociate()) },
    copy: () => { dispatch(TreeActions.copy()) },
    paste: () => { dispatch(TreeActions.paste()) },

    moveFocusToFirst: () => { dispatch(TreeActions.moveFocusToFirst()) },
    moveFocusUp: () => { dispatch(TreeActions.moveFocusUp()) },
    moveFocusDown: () => { dispatch(TreeActions.moveFocusDown()) },
    moveFocusLeft: () => { dispatch(TreeActions.moveFocusLeft()) },
    moveFocusRight: () => { dispatch(TreeActions.moveFocusRight()) },
    moveFocusToLast: () => { dispatch(TreeActions.moveFocusToLast()) },
  }
}

function formatButton(handleClick: () => void, text: string) {
  return (
    <div>
      <input type="button" onClick={handleClick} value={text} />
    </div>
  )
}

const TreeModifier: React.SFC<Props> = props => {
  return (
    <div className="tree-modifier">
      <div>
        <h3>Add Element</h3>
        {formatButton(props.addChildStart, "Add Child Start")}
        {formatButton(props.addChildEnd, "Add Child End")}
        {formatButton(props.addSiblingBefore, "Add Sibling Before")}
        {formatButton(props.addSiblingAfter, "Add Sibling After")}
        {formatButton(props.wrap, "Wrap")}
      </div>
      <div>
        <h3>Remove Elements</h3>
        {formatButton(props.deleteElement, "Delete")}
        {formatButton(props.removeChildren, "Remove Children")}
        {formatButton(props.flatten, "Flatten")}
      </div>
      <div>
        <h3>Move Element</h3>
        {formatButton(props.moveUp, "Move Up")}
        {formatButton(props.moveDown, "Move Down")}
        {formatButton(props.moveLeft, "Move Left")}
        {formatButton(props.moveRight, "Move Right")}
        {formatButton(props.makeFirstChild, "Make First Child")}
        {formatButton(props.makeLastChild, "Make Last Child")}
      </div>
      <div>
        <h3>Duplicating Elements</h3>
        {formatButton(props.duplicate, "Duplicate")}
        {formatButton(props.shallowDuplicate, "Shallow Duplicate")}
        {formatButton(props.deepDuplicate, "Deep Duplicate")}
      </div>
      <div>
        <h3>Dissociating Elements</h3>
        {formatButton(props.dissociate, "Dissociate")}
        <h3>Copy/Paste Elements</h3>
        {formatButton(props.copy, "Copy")}
        {formatButton(props.paste, "Paste")}
      </div>
      <div>
        <h3>Move Focus</h3>
        {formatButton(props.moveFocusToFirst, "Move Focus To First")}
        {formatButton(props.moveFocusUp, "Move Focus Up")}
        {formatButton(props.moveFocusDown, "Move Focus Down")}
        {formatButton(props.moveFocusRight, "Move Focus Right")}
        {formatButton(props.moveFocusLeft, "Move Focus Left")}
        {formatButton(props.moveFocusToLast, "Move Focus To Last")}
      </div>
    </div>
  )
}

export default connect(undefined, mapDispatchToProps)(TreeModifier)
