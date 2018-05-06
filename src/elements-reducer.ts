import { createElement, Element, ElementType } from "element"

import { ElementsAction, ElementsActionType } from "elements-actions"
import * as Tree from "tree"
import * as Vine from "data-structures/vine"

type ElementMap = { [logicalId: string]: Element }

export interface ElementsState {
  tree: Tree.Tree
  elements: ElementMap
  focusedLeaf: Tree.NodeRef
  copiedElementId?: Tree.NodeId
}

const ROOT_NODE = { logicalId: Tree.ROOT, physicalId: Tree.ROOT }
const defaultState: ElementsState = {
  tree: { [Tree.ROOT]: [] },
  elements: { [Tree.ROOT]: createElement(ElementType.Flex, Tree.ROOT) },
  focusedLeaf: ROOT_NODE,
}

export function elements(
  state: ElementsState = defaultState,
  action: ElementsAction,
): ElementsState {
  switch (action.type) {
    // Focusing nodes
    case ElementsActionType.FocusElement:
      return focusElement(state, action.element)
    case ElementsActionType.MoveFocus:
      return moveFocus(state, action.direction)
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
        case Tree.Direction.Left: return moveLaterally(state, -1)
        case Tree.Direction.Right: return moveLaterally(state, 1)
        case Tree.Direction.Up: return moveUp(state)
        case Tree.Direction.Down: return moveDown(state)
      }
    case ElementsActionType.MakeFirstChild:
      return moveLaterally(state, -Infinity)
    case ElementsActionType.MakeLastChild:
      return moveLaterally(state, Infinity)

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
  switch (direction) {
    case Tree.Direction.Up: {
      let { focusedLeaf } = state
      if (!focusedLeaf.parent) return state
      return { ...state, focusedLeaf: Vine.cutLeaves(focusedLeaf.parent) }
    }
    case Tree.Direction.Down: {
      let { tree, focusedLeaf } = state
      let firstChild = tree[focusedLeaf.logicalId][0]
      if (!firstChild) return state
      let newLeaf = { ...firstChild }
      let newFocusedLeaf = Vine.replaceLeaves(focusedLeaf, newLeaf)
      return { ...state, focusedLeaf: newFocusedLeaf }
    }
    case Tree.Direction.Left:
    case Tree.Direction.Right: {
      let offset = direction === Tree.Direction.Left ? -1 : 1
      let { tree, focusedLeaf } = state
      let { physicalId, parent } = focusedLeaf
      if (!parent) return state

      let siblings = tree[parent.logicalId]
      let index = Tree.indexOfPhysicalNode(siblings, physicalId)
      let newFocusedElement = siblings[index + offset]
      if (!newFocusedElement) return state

      let newFocusedLeaf = Vine.replaceLeaves(parent, { ...newFocusedElement })
      return { ...state, focusedLeaf: newFocusedLeaf }
    }
  }
}

function addChild(state: ElementsState, start: boolean): ElementsState {
  let { tree, node } = Tree.addChild(state.tree, state.focusedLeaf, start)
  let newElement = createElement(ElementType.Content, node.logicalId)
  let newElements = { ...state.elements, [node.logicalId]: newElement }
  return { ...state, tree, elements: newElements }
}

function addSibling(state: ElementsState, before: boolean): ElementsState {
  let { tree, node } = Tree.addSibling(state.tree, state.focusedLeaf, before)
  let newElement = createElement(ElementType.Content, node.logicalId)
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
  let newElement = createElement(ElementType.Content, node.logicalId)
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
