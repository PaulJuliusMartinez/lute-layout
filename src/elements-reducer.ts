import { createElement, Element, ElementType } from "element"

import { ElementsAction, ElementsActionType } from "elements-actions"
import * as Tree from "tree"

type ElementMap = { [logicalId: string]: Element }

export interface ElementsState {
  tree: Tree.Tree
  elements: ElementMap
  focusedElementVine: Tree.Vine
  focusedElementReverseVine: Tree.ReverseVine
  copiedElementId?: Tree.NodeId
}

const defaultState: ElementsState = {
  tree: { [Tree.ROOT]: [] },
  elements: { [Tree.ROOT]: createElement(ElementType.Flex, Tree.ROOT) },
  focusedElementVine: { logicalId: Tree.ROOT, physicalId: Tree.ROOT },
  focusedElementReverseVine: { logicalId: Tree.ROOT, physicalId: Tree.ROOT },
}

export function elements(
  state: ElementsState = defaultState,
  action: ElementsAction,
): ElementsState {
  switch (action.type) {
    // Focusing nodes
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

function moveFocus(state: ElementsState, direction: Tree.Direction): ElementsState {
  switch (direction) {
    case Tree.Direction.Up: {
      let focusedElementVine = state.focusedElementVine.parent
      if (!focusedElementVine) return state
      return {
        ...state,
        focusedElementVine,
        focusedElementReverseVine: Tree.reverseVine(focusedElementVine),
      }
    }
    case Tree.Direction.Down: {
      let { tree, focusedElementVine } = state
      let firstChild = tree[focusedElementVine.logicalId][0]
      if (!firstChild) return state
      let newFocusedElement = { ...firstChild, parent: focusedElementVine }
      return {
        ...state,
        focusedElementVine: newFocusedElement,
        focusedElementReverseVine: Tree.reverseVine(newFocusedElement),
      }
    }
    case Tree.Direction.Left:
    case Tree.Direction.Right: {
      let offset = direction === Tree.Direction.Left ? -1 : 1
      let { tree, focusedElementVine } = state
      let { physicalId, parent } = focusedElementVine
      if (!parent) return state
      let siblings = tree[parent.logicalId]
      let index = Tree.indexOfPhysicalNode(siblings, physicalId)
      let newFocusedElement = siblings[index + offset]
      if (!newFocusedElement) return state
      let newFocusedVine = { ...newFocusedElement, parent }
      return {
        ...state,
        focusedElementVine: newFocusedVine,
        focusedElementReverseVine: Tree.reverseVine(newFocusedVine),
      }
    }
  }
}

function addChild(state: ElementsState, start: boolean): ElementsState {
  let { tree, vine } = Tree.addChild(state.tree, state.focusedElementVine, start)
  let newElement = createElement(ElementType.Content, vine.logicalId)
  let newElements = { ...state.elements, [vine.logicalId]: newElement }
  return { ...state, tree, elements: newElements }
}

function addSibling(state: ElementsState, before: boolean): ElementsState {
  let { tree, vine } = Tree.addSibling(state.tree, state.focusedElementVine, before)
  let newElement = createElement(ElementType.Content, vine.logicalId)
  let newElements = { ...state.elements, [vine.logicalId]: newElement }
  return { ...state, tree, elements: newElements }
}

function deleteNode(state: ElementsState): ElementsState {
  let { tree, removedIds } = Tree.deleteNode(
    state.tree,
    state.focusedElementVine,
    references(state),
  )
  let focusedElementVine = state.focusedElementVine.parent!
  let focusedElementReverseVine = Tree.reverseVine(focusedElementVine)
  let newElements: ElementMap = { ...state.elements }
  removedIds.forEach(removedId => delete newElements[removedId])
  return {
    ...state,
    tree,
    focusedElementVine,
    focusedElementReverseVine,
    elements: newElements,
  }
}

function removeChildren(state: ElementsState): ElementsState {
  let { tree, removedIds } = Tree.removeChildren(
    state.tree,
    state.focusedElementVine,
    references(state),
  )
  let newElements: ElementMap = { ...state.elements }
  removedIds.forEach(removedId => delete newElements[removedId])
  return { ...state, tree, elements: newElements }
}

function flatten(state: ElementsState): ElementsState {
  let { tree: originalTree, focusedElementVine, copiedElementId } = state
  let { logicalId, physicalId, parent } = focusedElementVine

  let haveOtherReference = copiedElementId === logicalId
  let { tree, stillReferenced } = Tree.flatten(
    originalTree,
    state.focusedElementVine,
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
  let newFocusedElementVine = { ...firstChild, parent }

  return {
    ...state,
    tree,
    focusedElementVine: newFocusedElementVine,
    focusedElementReverseVine: Tree.reverseVine(newFocusedElementVine),
  }
}

function wrap(state: ElementsState): ElementsState {
  let { tree, vine } = Tree.wrap(state.tree, state.focusedElementVine)
  let newElement = createElement(ElementType.Content, vine.logicalId)
  let newElements = { ...state.elements, [vine.logicalId]: newElement }
  return {
    ...state,
    tree,
    elements: newElements,
    focusedElementVine: vine,
    focusedElementReverseVine: Tree.reverseVine(vine),
  }
}

function moveLaterally(state: ElementsState, dest: number): ElementsState {
  let tree = Tree.moveLaterally(state.tree, state.focusedElementVine, dest)
  return { ...state, tree }
}

function moveUp(state: ElementsState): ElementsState {
  let { tree, vine } = Tree.moveUp(state.tree, state.focusedElementVine)
  return {
    ...state,
    tree,
    focusedElementVine: vine,
    focusedElementReverseVine: Tree.reverseVine(vine),
  }
}

function moveDown(state: ElementsState): ElementsState {
  let { tree, vine } = Tree.moveDown(state.tree, state.focusedElementVine)
  return {
    ...state,
    tree,
    focusedElementVine: vine,
    focusedElementReverseVine: Tree.reverseVine(vine),
  }
}

// Returns an array of references into the tree.
function references(state: ElementsState): Tree.NodeId[] {
  return state.copiedElementId == null ? [] : [state.copiedElementId]
}
