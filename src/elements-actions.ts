import { ElementType } from "element"

export enum ElementsActionType {
  // Node Appearances
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

  // Node Related Things
  AddChildStart,
  AddChildEnd,
  AddSiblingBefore,
  AddSiblingAfter,
  RemoveElement,
  ReplaceWithChildren,
  RemoveChildren,
}

interface ElementAction {
  logicalId: number
  physicalId: number
}

interface RemoveAction extends ElementAction {
  type:
    | ElementsActionType.RemoveElement
    | ElementsActionType.ReplaceWithChildren
    | ElementsActionType.RemoveChildren
}

interface AddAction extends ElementAction {
  type:
    | ElementsActionType.AddChildStart
    | ElementsActionType.AddChildEnd
    | ElementsActionType.AddSiblingBefore
    | ElementsActionType.AddSiblingAfter
  elementType?: ElementType
}

export type ElementsAction = AddAction | RemoveAction
