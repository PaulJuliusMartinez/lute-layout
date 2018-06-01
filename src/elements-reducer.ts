import { createElement, Element, ElementType } from "element"

import { ElementsAction, ElementsActionType } from "elements-actions"
import * as Tree from "tree"
import * as Vine from "data-structures/vine"

type ElementMap = { [logicalId: string]: Element }

export enum FocusedSide {
  Top,
  Right,
  Bottom,
  Left,
}

export interface ElementsState {
  tree: Tree.Tree
  elements: ElementMap
  focusedLeaf: Tree.NodeRef
  focusedSide: FocusedSide
  copiedElementId?: Tree.NodeId
}

const ROOT_NODE = { logicalId: Tree.ROOT, physicalId: Tree.ROOT }
const defaultState: ElementsState = {
  tree: { [Tree.ROOT]: [] },
  elements: { [Tree.ROOT]: createElement(ElementType.Flex, Tree.ROOT) },
  focusedLeaf: ROOT_NODE,
  focusedSide: FocusedSide.Left,
}

export function elements(
  state: ElementsState = defaultState,
  action: ElementsAction,
): ElementsState {
  switch (action.type) {
    case ElementsActionType.SetElementStyle: {
      let { logicalId } = state.focusedLeaf
      let currentElement = state.elements[logicalId]
      let currentElementStyles = currentElement.styles
      return {
        ...state,
        elements: {
          ...state.elements,
          [logicalId]: {
            ...currentElement,
            styles: { ...currentElementStyles, ...action.style },
          },
        },
      }
    }
    case ElementsActionType.SetElementContent: {
      let { logicalId } = state.focusedLeaf
      let currentElement = state.elements[logicalId]
      return {
        ...state,
        elements: {
          ...elements,
          [logicalId]: { ...currentElement, content: action.content },
        },
      }
    }
    // Focusing nodes
    case ElementsActionType.FocusElement:
      return focusElement(state, action.element)
    case ElementsActionType.MoveFocus:
      return moveFocus(state, action.direction)
    case ElementsActionType.VisualMoveFocus:
      return visualMoveFocus(state, action.direction)
    // Adding/Removing Nodes
    case ElementsActionType.AddChildStart:
      return addChild(state, /* start */ true)
    case ElementsActionType.AddChildEnd:
      return addChild(state, /* start */ false)
    case ElementsActionType.AddSiblingBefore:
      return addSibling(state, /* before */ true)
    case ElementsActionType.AddSiblingAfter:
      return addSibling(state, /* before */ false)
    case ElementsActionType.DeleteNode:
      return deleteNode(state)
    case ElementsActionType.RemoveChildren:
      return removeChildren(state)
    case ElementsActionType.Flatten:
      return flatten(state)
    case ElementsActionType.Wrap:
      return wrap(state)

    // Moving nodes
    case ElementsActionType.MoveNode:
      let { direction } = action
      switch (direction) {
        case Tree.Direction.First:
          return moveLaterally(state, -Infinity)
        case Tree.Direction.Left:
          return moveLaterally(state, -1)
        case Tree.Direction.Right:
          return moveLaterally(state, 1)
        case Tree.Direction.Up:
          return moveUp(state)
        case Tree.Direction.Down:
          return moveDown(state)
        case Tree.Direction.Last:
          return moveLaterally(state, Infinity)
      }

    // Copying/duplicating nodes
    // case ElementsActionType.Duplicate:
    //   return duplicate(state)
    // case ElementsActionType.ShallowDuplicate:
    //   return shallowDuplicate(state)
    // case ElementsActionType.DeepDuplicate:
    //   return deepDuplicate(state)
    // case ElementsActionType.Dissociate:
    //   return dissociate(state)
    default:
      return state
  }
}

function focusElement(state: ElementsState, element: Tree.NodeRef): ElementsState {
  return { ...state, focusedLeaf: element }
}

function moveFocus(state: ElementsState, direction: Tree.Direction): ElementsState {
  let { focusedSide } = state
  switch (direction) {
    case Tree.Direction.Up: return focusParent(state, focusedSide)
    case Tree.Direction.Down: return focusFirstChild(state, focusedSide)
    case Tree.Direction.First: return focusFirstSibling(state, focusedSide)
    case Tree.Direction.Last: return focusLastSibling(state, focusedSide)
    case Tree.Direction.Left: return focusPrevSibling(state, focusedSide)
    case Tree.Direction.Right: return focusNextSibling(state, focusedSide)
  }
}

enum Axis {
  Horizontal,
  Vertical,
}

function visualMoveFocus(state: ElementsState, direction: Tree.Direction): ElementsState {
  let { tree, focusedLeaf, focusedSide, elements } = state
  // Handle this later.
  if (!focusedLeaf.parent) {
    return focusFirstChild(state, FocusedSide.Left)
  }

  let contentAxis = getParentContentAxis(state)
  let siblings = tree[focusedLeaf.parent.logicalId]
  let index = Tree.indexOfPhysicalNode(siblings, focusedLeaf.physicalId)

  // Declare each of these separately for readability.
  let onLeft = focusedSide === FocusedSide.Left
  let onRight = focusedSide === FocusedSide.Right
  let onTop = focusedSide === FocusedSide.Top
  let onBottom = focusedSide === FocusedSide.Bottom
  let moveUp = direction === Tree.Direction.Up
  let moveRight = direction === Tree.Direction.Right
  let moveDown = direction === Tree.Direction.Down
  let moveLeft = direction === Tree.Direction.Left
  let horizontalContent = contentAxis === Axis.Horizontal
  let verticalContent = contentAxis === Axis.Vertical
  let isFirstChild = index === 0
  let isLastChild = index === siblings.length - 1
  let hasChildren = tree[focusedLeaf.logicalId].length !== 0

  let { Left, Right, Top, Bottom } = FocusedSide

  if (onLeft   && moveUp    && horizontalContent                 ) return focusParent     (state, Top   )
  if (onLeft   && moveUp    &&   verticalContent &&  isFirstChild) return focusParent     (state, Top   )
  if (onLeft   && moveUp    &&   verticalContent && !isFirstChild) return focusPrevSibling(state, Left  )
  if (onLeft   && moveRight &&                       hasChildren ) return focusFirstChild (state, Left  )
  if (onLeft   && moveRight && horizontalContent &&  isLastChild ) return focusParent     (state, Right )
  if (onLeft   && moveRight && horizontalContent && !isLastChild ) return focusNextSibling(state, Left  )
  if (onLeft   && moveRight &&   verticalContent                 ) return focusParent     (state, Right )
  if (onLeft   && moveDown  && horizontalContent                 ) return focusParent     (state, Bottom)
  if (onLeft   && moveDown  &&   verticalContent &&  isLastChild ) return focusParent     (state, Bottom)
  if (onLeft   && moveDown  &&   verticalContent && !isLastChild ) return focusNextSibling(state, Left  )
  if (onLeft   && moveLeft  && horizontalContent &&  isFirstChild) return focusParent     (state, Left  )
  if (onLeft   && moveLeft  && horizontalContent && !isFirstChild) return focusPrevSibling(state, Right )
  if (onLeft   && moveLeft  &&   verticalContent                 ) return focusParent     (state, Left  )

  if (onRight  && moveUp    && horizontalContent                 ) return focusParent     (state, Top   )
  if (onRight  && moveUp    &&   verticalContent &&  isFirstChild) return focusParent     (state, Top   )
  if (onRight  && moveUp    &&   verticalContent && !isFirstChild) return focusPrevSibling(state, Right )
  if (onRight  && moveRight && horizontalContent &&  isLastChild ) return focusParent     (state, Right )
  if (onRight  && moveRight && horizontalContent && !isLastChild ) return focusNextSibling(state, Left  )
  if (onRight  && moveRight &&   verticalContent                 ) return focusParent     (state, Right )
  if (onRight  && moveDown  && horizontalContent                 ) return focusParent     (state, Bottom)
  if (onRight  && moveDown  &&   verticalContent &&  isLastChild ) return focusParent     (state, Bottom)
  if (onRight  && moveDown  &&   verticalContent && !isLastChild ) return focusNextSibling(state, Right )
  if (onRight  && moveLeft  &&                       hasChildren ) return focusLastChild  (state, Right )
  if (onRight  && moveLeft  && horizontalContent &&  isFirstChild) return focusParent     (state, Left  )
  if (onRight  && moveLeft  && horizontalContent && !isFirstChild) return focusPrevSibling(state, Right )
  if (onRight  && moveLeft  &&   verticalContent                 ) return focusParent     (state, Left  )

  if (onTop    && moveUp    && horizontalContent                 ) return focusParent     (state, Top   )
  if (onTop    && moveUp    &&   verticalContent &&  isFirstChild) return focusParent     (state, Top   )
  if (onTop    && moveUp    &&   verticalContent && !isFirstChild) return focusPrevSibling(state, Bottom)
  if (onTop    && moveRight && horizontalContent &&  isLastChild ) return focusParent     (state, Right )
  if (onTop    && moveRight && horizontalContent && !isLastChild ) return focusNextSibling(state, Top   )
  if (onTop    && moveRight &&   verticalContent                 ) return focusParent     (state, Right )
  if (onTop    && moveDown  &&                       hasChildren ) return focusFirstChild (state, Top   )
  if (onTop    && moveDown  && horizontalContent                 ) return focusParent     (state, Bottom)
  if (onTop    && moveDown  &&   verticalContent &&  isLastChild ) return focusParent     (state, Bottom)
  if (onTop    && moveDown  &&   verticalContent && !isLastChild ) return focusNextSibling(state, Top)
  if (onTop    && moveLeft  && horizontalContent &&  isFirstChild) return focusParent     (state, Left  )
  if (onTop    && moveLeft  && horizontalContent && !isFirstChild) return focusPrevSibling(state, Top   )
  if (onTop    && moveLeft  &&   verticalContent                 ) return focusParent     (state, Left  )

  if (onBottom && moveUp    &&                       hasChildren ) return focusLastChild  (state, Bottom)
  if (onBottom && moveUp    && horizontalContent                 ) return focusParent     (state, Top   )
  if (onBottom && moveUp    &&   verticalContent &&  isFirstChild) return focusParent     (state, Top   )
  if (onBottom && moveUp    &&   verticalContent && !isFirstChild) return focusPrevSibling(state, Bottom)
  if (onBottom && moveRight && horizontalContent &&  isLastChild ) return focusParent     (state, Right )
  if (onBottom && moveRight && horizontalContent && !isLastChild ) return focusNextSibling(state, Bottom)
  if (onBottom && moveRight &&   verticalContent                 ) return focusParent     (state, Right )
  if (onBottom && moveDown  && horizontalContent                 ) return focusParent     (state, Bottom)
  if (onBottom && moveDown  &&   verticalContent &&  isLastChild ) return focusParent     (state, Bottom)
  if (onBottom && moveDown  &&   verticalContent && !isLastChild ) return focusNextSibling(state, Top   )

  if (onBottom && moveLeft  && horizontalContent &&  isFirstChild) return focusParent     (state, Left  )
  if (onBottom && moveLeft  && horizontalContent && !isFirstChild) return focusPrevSibling(state, Bottom)
  if (onBottom && moveLeft  &&   verticalContent                 ) return focusParent     (state, Left  )

  return state
}

function getParentContentAxis(state: ElementsState): Axis {
  let { focusedLeaf, elements } = state
  if (!focusedLeaf.parent) return Axis.Vertical
  let parentId = focusedLeaf.parent.logicalId
  let parent = elements[parentId]

  if (parent.styles.display === "flex") {
    let flexDirection = parent.styles.flexDirection
    if (!flexDirection || flexDirection === "row" || flexDirection === "row-reverse") {
      return Axis.Horizontal
    }
  }

  return Axis.Vertical
}

function focusParent(state: ElementsState, focusedSide: FocusedSide): ElementsState {
  let { focusedLeaf } = state
  if (!focusedLeaf.parent) return state
  return {
    ...state,
    focusedSide,
    focusedLeaf: Vine.cutLeaves(focusedLeaf.parent),
  }
}

function focusPrevSibling(state: ElementsState, focusedSide: FocusedSide): ElementsState {
  return focusSibling(state, focusedSide, Tree.Direction.Left)
}

function focusNextSibling(state: ElementsState, focusedSide: FocusedSide): ElementsState {
  return focusSibling(state, focusedSide, Tree.Direction.Right)
}

function focusFirstSibling(state: ElementsState, focusedSide: FocusedSide): ElementsState {
  return focusSibling(state, focusedSide, Tree.Direction.First)
}

function focusLastSibling(state: ElementsState, focusedSide: FocusedSide): ElementsState {
  return focusSibling(state, focusedSide, Tree.Direction.Last)
}

function focusSibling(
  state: ElementsState,
  focusedSide: FocusedSide,
  direction: Tree.Direction,
): ElementsState {
  let { tree, focusedLeaf } = state
  let { physicalId, parent } = focusedLeaf
  if (!parent) return state

  let siblings = tree[parent.logicalId]
  let newFocusedIndex: number

  if (direction === Tree.Direction.First) {
    newFocusedIndex = 0
  } else if (direction === Tree.Direction.Last) {
    newFocusedIndex = siblings.length - 1
  } else {
    let index = Tree.indexOfPhysicalNode(siblings, physicalId)
    let offset = direction === Tree.Direction.Left ? -1 : 1
    newFocusedIndex = index + offset
  }

  let newFocusedElement = siblings[newFocusedIndex]
  if (!newFocusedElement) return state

  let newFocusedLeaf = Vine.replaceLeaves(parent, { ...newFocusedElement })
  return { ...state, focusedSide, focusedLeaf: newFocusedLeaf }
}

function focusFirstChild(state: ElementsState, focusedSide: FocusedSide): ElementsState {
  return focusChild(state, focusedSide, Tree.Direction.First)
}

function focusLastChild(state: ElementsState, focusedSide: FocusedSide): ElementsState {
  return focusChild(state, focusedSide, Tree.Direction.Last)
}

function focusChild(
  state: ElementsState,
  focusedSide: FocusedSide,
  direction: Tree.Direction,
): ElementsState {
  let { tree, focusedLeaf } = state
  let children = tree[focusedLeaf.logicalId]
  if (children.length === 0) return state
  let focusedChild = direction === Tree.Direction.First ?
    children[0] :
    children[children.length - 1]
  let newLeaf = { ...focusedChild }
  let newFocusedLeaf = Vine.replaceLeaves(focusedLeaf, newLeaf)
  return { ...state, focusedSide, focusedLeaf: newFocusedLeaf }
}

function addChild(state: ElementsState, start: boolean): ElementsState {
  let { tree, node } = Tree.addChild(state.tree, state.focusedLeaf, start)
  let newElement = createElement(ElementType.Block, node.logicalId)
  let newElements = { ...state.elements, [node.logicalId]: newElement }
  return { ...state, tree, elements: newElements }
}

function addSibling(state: ElementsState, before: boolean): ElementsState {
  let { tree, node } = Tree.addSibling(state.tree, state.focusedLeaf, before)
  let newElement = createElement(ElementType.Block, node.logicalId)
  let newElements = { ...state.elements, [node.logicalId]: newElement }
  return { ...state, tree, elements: newElements }
}

function deleteNode(state: ElementsState): ElementsState {
  let { tree, removedIds } = Tree.deleteNode(
    state.tree,
    state.focusedLeaf,
    references(state),
  )
  let newFocusedLeaf = Vine.cutLeaves(state.focusedLeaf.parent!)

  let newElements: ElementMap = { ...state.elements }
  removedIds.forEach(removedId => delete newElements[removedId])
  return {
    ...state,
    tree,
    elements: newElements,
    focusedLeaf: newFocusedLeaf,
  }
}

function removeChildren(state: ElementsState): ElementsState {
  let { tree, removedIds } = Tree.removeChildren(
    state.tree,
    state.focusedLeaf,
    references(state),
  )
  let newElements: ElementMap = { ...state.elements }
  removedIds.forEach(removedId => delete newElements[removedId])
  return { ...state, tree, elements: newElements }
}

function flatten(state: ElementsState): ElementsState {
  let { tree: originalTree, focusedLeaf, copiedElementId } = state
  let { logicalId, physicalId, parent } = focusedLeaf

  let haveOtherReference = copiedElementId === logicalId
  let { tree, stillReferenced } = Tree.flatten(
    originalTree,
    state.focusedLeaf,
    haveOtherReference,
  )
  let newElements = state.elements
  if (!stillReferenced) {
    newElements = { ...newElements }
    delete newElements[logicalId]
  }

  // Focus the first child of the original node. It will be in the same place in
  // the new tree as the original node was in the original tree.
  let originalIndex = Tree.indexOfPhysicalNode(
    originalTree[parent!.logicalId],
    physicalId,
  )
  let firstChild = tree[parent!.logicalId][originalIndex]
  let newFocusedLeaf = Vine.replaceLeaves(parent!, { ...firstChild })

  return { ...state, tree, focusedLeaf: newFocusedLeaf }
}

function wrap(state: ElementsState): ElementsState {
  let { tree, node } = Tree.wrap(state.tree, state.focusedLeaf)
  let newElement = createElement(ElementType.Block, node.logicalId)
  let newElements = { ...state.elements, [node.logicalId]: newElement }
  let newFocusedLeaf = Vine.replaceLeaves(state.focusedLeaf.parent!, { ...node })
  return { ...state, tree, elements: newElements, focusedLeaf: newFocusedLeaf }
}

function moveLaterally(state: ElementsState, dest: number): ElementsState {
  let tree = Tree.moveLaterally(state.tree, state.focusedLeaf, dest)
  return { ...state, tree }
}

function moveUp(state: ElementsState): ElementsState {
  let { tree, vine: focusedLeaf } = Tree.moveUp(state.tree, state.focusedLeaf)
  return { ...state, tree, focusedLeaf }
}

function moveDown(state: ElementsState): ElementsState {
  let { tree, vine: focusedLeaf } = Tree.moveDown(state.tree, state.focusedLeaf)
  return { ...state, tree, focusedLeaf }
}

// Returns an array of references into the tree.
function references(state: ElementsState): Tree.NodeId[] {
  return state.copiedElementId == null ? [] : [state.copiedElementId]
}
