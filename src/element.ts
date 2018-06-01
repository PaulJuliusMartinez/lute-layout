import * as CSS from "csstype"

import * as Flex from "flex"
import { NodeId } from "tree"

export enum ElementType {
  Flex = "flex",
  InlineFlex = "inline-flex",
  Block = "block",
  Inline = "inline",
}

export interface Element {
  styles: CSS.Properties
  content: string
}

const DEFAULT_CHILD_SETTINGS: CSS.Properties = {
  margin: "4px",
  borderWidth: "4px",
  borderColor: "#eee",
  borderStyle: "solid",
  padding: "4px",
}

const FLEX_DEFAULT_STYLES: CSS.Properties = Object.assign(
  { display: "flex" },
  DEFAULT_CHILD_SETTINGS,
)
const INLINE_FLEX_DEFAULT_STYLES: CSS.Properties = Object.assign(
  { display: "inline-flex" },
  DEFAULT_CHILD_SETTINGS,
)
const BLOCK_DEFAULT_STYLES: CSS.Properties = Object.assign(
  { display: "block" },
  DEFAULT_CHILD_SETTINGS,
)
const INLINE_DEFAULT_STYLES: CSS.Properties = Object.assign(
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
