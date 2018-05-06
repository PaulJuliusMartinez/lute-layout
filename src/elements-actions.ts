import { ElementType } from "element"
import { Direction, NodeRef } from "tree"

export enum ElementsActionType {
  // Navigating Tree

  FocusElement,
  MoveFocus,

  // Element Style modifications

  SetElementType,

  SetMargin,
  SetBorderWidth,
  SetBorderColor,
  SetPadding,

  SetColor,
  SetBackgroundColor,

  SetFontSize,
  SetFontWeight,
  SetFontStyle,

  SetChildMargin,
  SetChildBorderWidth,
  SetChildBorderColor,
  SetChildPadding,

  ResetChildStyles,

  SetFlexDirection,
  SetJustifyContent,
  SetAlignItems,

  SetFlexGrow,
  SetFlexShrink,
  SetFlexBasis,
  SetAlignSelf,

  SetContent,
  SetDisplay,

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

  MakeFirstChild,
  MakeLastChild,

  Duplicate,
  ShallowDuplicate,
  DeepDuplicate,

  Dissociate,

  Copy,
  Paste,
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
    | ElementsActionType.MakeFirstChild
    | ElementsActionType.MakeLastChild
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
  type: ElementsActionType.MoveFocus
  direction: Direction
}

export type ElementsAction =
  | FocusElementAction
  | MoveFocusAction
  | ModifyTreeAction
  | MoveNodeAction

function focusElement(element: NodeRef): FocusElementAction {
  return { type: ElementsActionType.FocusElement, element }
}

function createMoveFocusActionCreator(direction: Direction): () => MoveFocusAction {
  return () => ({ type: ElementsActionType.MoveFocus, direction })
}

const moveFocusUp = createMoveFocusActionCreator(Direction.Up)
const moveFocusDown = createMoveFocusActionCreator(Direction.Down)
const moveFocusLeft = createMoveFocusActionCreator(Direction.Left)
const moveFocusRight = createMoveFocusActionCreator(Direction.Right)

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
const makeFirstChild = createModifyActionCreator(ElementsActionType.MakeFirstChild)
const makeLastChild = createModifyActionCreator(ElementsActionType.MakeLastChild)

function createMoveNodeActionCreator(direction: Direction): () => MoveNodeAction {
  return () => ({ type: ElementsActionType.MoveNode, direction })
}

const moveUp = createMoveNodeActionCreator(Direction.Up)
const moveDown = createMoveNodeActionCreator(Direction.Down)
const moveLeft = createMoveNodeActionCreator(Direction.Left)
const moveRight = createMoveNodeActionCreator(Direction.Right)

export {
  focusElement,

  moveFocusUp,
  moveFocusDown,
  moveFocusLeft,
  moveFocusRight,

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

  moveUp,
  moveDown,
  moveLeft,
  moveRight,
  makeFirstChild,
  makeLastChild,
}
