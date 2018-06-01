import * as CSS from "csstype"

import { ElementType } from "element"
import { Direction, NodeRef } from "tree"

export enum ElementsActionType {
  // Element Style modifications

  SetElementStyle,
  SetElementContent,

  // Navigating Tree

  FocusElement,
  MoveFocus,
  VisualMoveFocus,

  // Tree modifications

  AddChildStart,
  AddChildEnd,
  AddSiblingBefore,
  AddSiblingAfter,

  DeleteNode,
  RemoveChildren,
  Flatten,
  Wrap,

  MoveNode,

  Duplicate,
  ShallowDuplicate,
  DeepDuplicate,

  Dissociate,

  Copy,
  Paste,
}

interface SetElementStyleAction {
  type: ElementsActionType.SetElementStyle
  style: CSS.Properties
}

interface SetElementContentAction {
  type: ElementsActionType.SetElementContent
  content: string
}

interface ModifyTreeAction {
  type:
    | ElementsActionType.AddChildStart
    | ElementsActionType.AddChildEnd
    | ElementsActionType.AddSiblingBefore
    | ElementsActionType.AddSiblingAfter
    | ElementsActionType.DeleteNode
    | ElementsActionType.RemoveChildren
    | ElementsActionType.Flatten
    | ElementsActionType.Wrap
    | ElementsActionType.Duplicate
    | ElementsActionType.ShallowDuplicate
    | ElementsActionType.DeepDuplicate
    | ElementsActionType.Dissociate
    | ElementsActionType.Copy
    | ElementsActionType.Paste
}

interface MoveNodeAction {
  type: ElementsActionType.MoveNode
  direction: Direction
}

interface FocusElementAction {
  type: ElementsActionType.FocusElement
  element: NodeRef
}

interface MoveFocusAction {
  type: ElementsActionType.MoveFocus | ElementsActionType.VisualMoveFocus
  direction: Direction
}

export type ElementsAction =
  | SetElementStyleAction
  | SetElementContentAction
  | FocusElementAction
  | MoveFocusAction
  | ModifyTreeAction
  | MoveNodeAction

function setElementStyle(style: CSS.Properties) {
  return { type: ElementsActionType.SetElementStyle, style }
}

function setElementContent(content: string) {
  return { type: ElementsActionType.SetElementContent, content }
}

function focusElement(element: NodeRef): FocusElementAction {
  return { type: ElementsActionType.FocusElement, element }
}

function createMoveFocusActionCreator(direction: Direction): () => MoveFocusAction {
  return () => ({ type: ElementsActionType.MoveFocus, direction })
}

const moveFocusToFirst = createMoveFocusActionCreator(Direction.First)
const moveFocusUp = createMoveFocusActionCreator(Direction.Up)
const moveFocusDown = createMoveFocusActionCreator(Direction.Down)
const moveFocusLeft = createMoveFocusActionCreator(Direction.Left)
const moveFocusRight = createMoveFocusActionCreator(Direction.Right)
const moveFocusToLast = createMoveFocusActionCreator(Direction.Last)

function createVisualMoveFocusActionCreator(direction: Direction): () => MoveFocusAction {
  return () => ({ type: ElementsActionType.VisualMoveFocus, direction })
}

const visualMoveFocusUp = createVisualMoveFocusActionCreator(Direction.Up)
const visualMoveFocusDown = createVisualMoveFocusActionCreator(Direction.Down)
const visualMoveFocusLeft = createVisualMoveFocusActionCreator(Direction.Left)
const visualMoveFocusRight = createVisualMoveFocusActionCreator(Direction.Right)

function createModifyActionCreator(eat: ElementsActionType): () => ModifyTreeAction {
  return () => ({ type: eat as any})
}

const addChildStart = createModifyActionCreator(ElementsActionType.AddChildStart)
const addChildEnd = createModifyActionCreator(ElementsActionType.AddChildEnd)
const addSiblingBefore = createModifyActionCreator(ElementsActionType.AddSiblingBefore)
const addSiblingAfter = createModifyActionCreator(ElementsActionType.AddSiblingAfter)
const deleteNode = createModifyActionCreator(ElementsActionType.DeleteNode)
const removeChildren = createModifyActionCreator(ElementsActionType.RemoveChildren)
const flatten = createModifyActionCreator(ElementsActionType.Flatten)
const wrap = createModifyActionCreator(ElementsActionType.Wrap)
const duplicate = createModifyActionCreator(ElementsActionType.Duplicate)
const shallowDuplicate = createModifyActionCreator(ElementsActionType.ShallowDuplicate)
const deepDuplicate = createModifyActionCreator(ElementsActionType.DeepDuplicate)
const dissociate = createModifyActionCreator(ElementsActionType.Dissociate)
const copy = createModifyActionCreator(ElementsActionType.Copy)
const paste = createModifyActionCreator(ElementsActionType.Paste)

function createMoveNodeActionCreator(direction: Direction): () => MoveNodeAction {
  return () => ({ type: ElementsActionType.MoveNode, direction })
}

const moveToFirst = createMoveNodeActionCreator(Direction.First)
const moveUp = createMoveNodeActionCreator(Direction.Up)
const moveDown = createMoveNodeActionCreator(Direction.Down)
const moveLeft = createMoveNodeActionCreator(Direction.Left)
const moveRight = createMoveNodeActionCreator(Direction.Right)
const moveToLast = createMoveNodeActionCreator(Direction.Last)

export {
  setElementStyle,
  setElementContent,

  focusElement,

  moveFocusToFirst,
  moveFocusUp,
  moveFocusDown,
  moveFocusLeft,
  moveFocusRight,
  moveFocusToLast,

  visualMoveFocusUp,
  visualMoveFocusDown,
  visualMoveFocusLeft,
  visualMoveFocusRight,

  addChildStart,
  addChildEnd,
  addSiblingBefore,
  addSiblingAfter,
  deleteNode,
  removeChildren,
  flatten,
  wrap,
  duplicate,
  shallowDuplicate,
  deepDuplicate,
  dissociate,
  copy,
  paste,

  moveToFirst,
  moveUp,
  moveDown,
  moveLeft,
  moveRight,
  moveToLast,
}
