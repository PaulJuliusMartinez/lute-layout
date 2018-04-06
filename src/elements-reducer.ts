import { createElement, Element, ElementType } from "element"

import {
  ElementsAction,
  ElementsActionType,
} from "elements-actions"

export interface ElementsState {
  logicalChildren: { [logicalId: number]: number[] }
  physicalChildren: { [physicalId: number]: number[] }

  parents: { [logicalId: number]: number | undefined }

  logicalElements: { [logicalId: number]: Element }
}

const defaultState: ElementsState = {
  logicalChildren: { 0: [] },
  physicalChildren: { 0: [] },

  parents: { 0: undefined },

  logicalElements: { 0: createElement(ElementType.Flex, 0) },
}

export function elements(
  state: ElementsState = defaultState,
  action: ElementsAction,
): ElementsState {
  switch (action.type) {
    case ElementsActionType.RemoveElement:
    case ElementsActionType.ReplaceWithChildren:
    case ElementsActionType.RemoveChildren:
    case ElementsActionType.AddChildStart:
    case ElementsActionType.AddChildEnd:
    case ElementsActionType.AddSiblingBefore:
    case ElementsActionType.AddSiblingAfter:
      return modifyTree(state, action)
    default:
      return state
  }
}

function modifyTree(state: ElementsState, action: ElementsAction) {
  let { logicalId, physicalId } = action

  switch (action.type) {
    case ElementsActionType.RemoveElement:
    case ElementsActionType.ReplaceWithChildren:
    case ElementsActionType.RemoveChildren:
    case ElementsActionType.AddChildStart:
    case ElementsActionType.AddChildEnd:
    case ElementsActionType.AddSiblingBefore:
    case ElementsActionType.AddSiblingAfter:
    default:
      return state
  }
}
