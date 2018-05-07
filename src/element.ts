import { CSSProperties } from "react"

import * as Flex from "flex"
import { NodeId } from "tree"

export enum ElementType {
  Flex = "flex",
  InlineFlex = "inline-flex",
  Block = "block",
  Inline = "inline",
}

export interface Element {
  styles: React.CSSProperties
  content: string
}

const DEFAULT_CHILD_SETTINGS: CSSProperties = {
  margin: "16px",
  borderWidth: "16px",
  borderColor: "#808080",
  padding: "16px",
}

const FLEX_DEFAULT_STYLES: CSSProperties = Object.assign(
  { display: "flex" },
  DEFAULT_CHILD_SETTINGS,
)
const INLINE_FLEX_DEFAULT_STYLES: CSSProperties = Object.assign(
  { display: "inline-flex" },
  DEFAULT_CHILD_SETTINGS,
)
const BLOCK_DEFAULT_STYLES: CSSProperties = Object.assign(
  { display: "block" },
  DEFAULT_CHILD_SETTINGS,
)
const INLINE_DEFAULT_STYLES: CSSProperties = Object.assign(
  { display: "inline" },
  DEFAULT_CHILD_SETTINGS,
)

export function createElement(elementType: ElementType, logicalId: NodeId): Element {
  let content = `Block #${logicalId}`
  switch (elementType) {
    case ElementType.Flex:
      return { styles: FLEX_DEFAULT_STYLES, content }
    case ElementType.InlineFlex:
      return { styles: INLINE_FLEX_DEFAULT_STYLES, content }
    case ElementType.Block:
      return { styles: BLOCK_DEFAULT_STYLES, content }
    case ElementType.Inline:
      return { styles: INLINE_DEFAULT_STYLES, content }
  }
}
