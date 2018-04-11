import { createElement, Element, ElementType } from "element"

import { ElementsAction, ElementsActionType } from "elements-actions"
import { Node, NodeId, ReverseVine, ROOT, Tree, Vine } from "tree"

export interface ElementsState {
  tree: Tree
  elements: { [logicalId: string]: Element }
  focusedElementVine: Vine
  focusedElementReverseVine: ReverseVine
  copiedElement?: NodeId
}

const defaultState: ElementsState = {
  tree: { [ROOT]: [] },
  elements: { [ROOT]: createElement(ElementType.Flex, ROOT) },
  focusedElementVine: { logicalId: ROOT, physicalId: ROOT },
  focusedElementReverseVine: { logicalId: ROOT, physicalId: ROOT },
}

export function elements(
  state: ElementsState = defaultState,
  action: ElementsAction,
): ElementsState {
  switch (action.type) {
    case ElementsActionType.AddChildStart:
      return addChild(state, /* start */ true)
    case ElementsActionType.AddChildEnd:
      return addChild(state, /* start */ false)
    case ElementsActionType.AddSiblingBefore:
      return addSibling(state, /* before */ true)
    case ElementsActionType.AddSiblingAfter:
      return addSibling(state, /* before */ false)
    default:
      return state
  }
}

function addChild(state: ElementsState, start: boolean): ElementsState {
  return state
}

function addSibling(state: ElementsState, before: boolean): ElementsState {
  return state
}
