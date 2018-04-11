import * as Flex from "flex"
import { NodeId } from "tree"

export enum ElementType {
  Flex,
  InlineFlex,
  Block,
  Inline,
  Content,
}

export interface BaseElement {
  margin?: number
  borderWidth?: number
  borderColor?: string
  padding?: number

  color?: string
  backgroundColor?: string

  fontSize?: string
  fontStyle?: string
  fontWeight?: string

  // Only applicable if parent is flex
  order?: number
  flexGrow?: number
  flexShrink?: number
  flexBasis?: string
  alignSelf?: Flex.AlignSelf
}

export interface ContainerElement extends BaseElement {
  childMargin: number
  childBorderWidth: number
  childBorderColor: string
  childPadding: number
}

export interface FlexElement extends ContainerElement {
  elementType: ElementType.Flex | ElementType.InlineFlex

  flexWrap: Flex.Wrap
  flexDirection: Flex.Direction
  justifyContent: Flex.JustifyContent
  alignItems: Flex.AlignItems
  alignContent: Flex.AlignContent
}

export interface BlockContainerElement extends ContainerElement {
  elementType: ElementType.Block
}

export interface InlineContainerElement extends ContainerElement {
  elementType: ElementType.Inline
}

export interface ContentElement extends BaseElement {
  elementType: ElementType.Content

  content: string
}

export type Element =
  | FlexElement
  | BlockContainerElement
  | InlineContainerElement
  | ContentElement

const DEFAULT_CHILD_SETTINGS = {
  childMargin: 16,
  childBorderWidth: 16,
  childBorderColor: "#808080",
  childPadding: 16,
}

export function createElement(elementType: ElementType, logicalId: NodeId): Element {
  switch (elementType) {
    case ElementType.Flex:
    case ElementType.InlineFlex: {
      return {
        elementType,
        ...DEFAULT_CHILD_SETTINGS,
        flexWrap: Flex.Wrap.Nowrap,
        flexDirection: Flex.Direction.Row,
        justifyContent: Flex.JustifyContent.FlexStart,
        alignItems: Flex.AlignItems.FlexStart,
        alignContent: Flex.AlignContent.FlexStart,
      } as FlexElement
    }
    case ElementType.Block:
      return { elementType, ...DEFAULT_CHILD_SETTINGS } as BlockContainerElement
    case ElementType.Inline:
      return { elementType, ...DEFAULT_CHILD_SETTINGS } as InlineContainerElement
    case ElementType.Content:
      return { elementType, content: `Block #${logicalId}` }
  }
}
