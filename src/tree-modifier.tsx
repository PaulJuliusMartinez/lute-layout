import * as React from "react"

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

  shallowDissociate: () => void
  deepDissociate: () => void

  copy: () => void
  paste: () => void
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
        {formatButton(props.shallowDissociate, "Shallow Dissociate")}
        {formatButton(props.deepDissociate, "Deep Dissociate")}
        <h3>Copy/Paste Elements</h3>
        {formatButton(props.copy, "Copy")}
        {formatButton(props.paste, "Paste")}
      </div>
    </div>
  )
}

export default TreeModifier
