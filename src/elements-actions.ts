import { ElementType } from "element"
import { Direction, Vine } from "tree"

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

  ShallowDissociate,
  DeepDissociate,

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
    | ElementsActionType.MakeFirstChild
    | ElementsActionType.MakeLastChild
    | ElementsActionType.Duplicate
    | ElementsActionType.ShallowDuplicate
    | ElementsActionType.DeepDuplicate
    | ElementsActionType.ShallowDissociate
    | ElementsActionType.DeepDissociate
    | ElementsActionType.Copy
    | ElementsActionType.Paste
}

interface MoveNodeAction {
  type: ElementsActionType.MoveNode
  direction: Direction
}

interface FocusElementAction {
  type: ElementsActionType.FocusElement
  element: Vine
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
