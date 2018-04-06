import * as React from "react"

import * as Flex from "flex"

export enum ElementState {
  FlexContainer = "flex",
  BlockContainer = "block",
  Content = "content",
}

export enum Display {
  Block = "block",
  Inline = "inline",
}

type ColorSetter = (color: string) => void
type WidthSetter = (width: number) => void

export interface FocusInfo {
  id: number
  parentFlex: boolean
  currentState: State
  callbacks: Callbacks
}

export interface Callbacks {
  setElementState: (elementState: ElementState) => void // Done

  // When it's a container or content
  setMargin: WidthSetter // Done
  setBorderWidth: WidthSetter // Done
  setBorderColor: ColorSetter // Done
  setPadding: WidthSetter // Done

  setColor: ColorSetter
  setBackgroundColor: ColorSetter

  remove: () => void // Done

  // When it's a flex container
  setFlexDirection: (direction: Flex.Direction) => void // Done
  setJustifyContent: (justifyContent: Flex.JustifyContent) => void // Done
  setAlignItems: (alignItems: Flex.AlignItems) => void // Done

  addChild: () => void // Done
  clearChildren: () => void // Done

  setChildMargin: WidthSetter // Done
  setChildBorderWidth: WidthSetter // Done
  setChildBorderColor: ColorSetter // Done
  setChildPadding: WidthSetter // Done
  resetChildStyles: () => void // Done

  // When it's content
  setFlexGrow: (grow: number) => void
  setFlexShrink: (shrink: number) => void
  setFlexBasis: (basis: string) => void
  setAlignSelf: (alignSelf: Flex.AlignItems | undefined) => void

  setContent: (content: string) => void // Done
  setDisplay: (display: Display) => void // Done
  addSiblingBefore: () => void // Done
  addSiblingAfter: () => void // Done
}

interface Props {
  id: number

  addSiblingBefore: () => void
  addSiblingAfter: () => void
  remove: () => void

  marginWidth: number
  borderWidth: number
  borderColor: string
  paddingWidth: number

  // When this gets incremented we reset clear our state styles.
  resetStyleCounter: number

  focus: (focusInfo: FocusInfo) => void
  parentFlex: boolean
}

export interface State {
  // Flex container properties
  flexDirection: Flex.Direction
  justifyContent: Flex.JustifyContent
  alignItems: Flex.AlignItems

  // Flex item properties
  flexGrow: number
  flexShrink: number
  flexBasis: string
  alignSelf: Flex.AlignItems | undefined

  // Visual properties
  marginWidth?: number | undefined
  borderWidth?: number | undefined
  borderColor?: string | undefined
  paddingWidth?: number | undefined

  color?: string | undefined
  backgroundColor?: string | undefined

  // Child properties
  childMarginWidth: number
  childBorderWidth: number
  childBorderColor: string
  childPaddingWidth: number

  children: number[]
  elementState: ElementState
  display: Display
  content: string
  resetStyleCounter: number
}

let elemId = 0

function nextId() {
  elemId += 1
  return elemId
}

export const DEFAULT_WIDTH = 16
export const DEFAULT_COLOR = "#888888"

const FLEX_CONTAINER_DEFAULTS = {
  flexDirection: Flex.Direction.Row,
  justifyContent: Flex.JustifyContent.FlexStart,
  alignItems: Flex.AlignItems.FlexStart,
}

const FLEX_ITEM_DEFAULTS = {
  flexGrow: 0,
  flexShrink: 1,
  flexBasis: "auto",
  alignSelf: undefined,
}

const VISUAL_DEFAULTS = {
  marginWidth: undefined,
  borderWidth: undefined,
  borderColor: undefined,
  paddingWidth: undefined,
}

const CHILD_VISUAL_DEFAULTS = {
  childMarginWidth: DEFAULT_WIDTH,
  childBorderWidth: DEFAULT_WIDTH,
  childBorderColor: DEFAULT_COLOR,
  childPaddingWidth: DEFAULT_WIDTH,
}

export default class FlexElement extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      ...FLEX_CONTAINER_DEFAULTS,
      ...FLEX_ITEM_DEFAULTS,
      ...VISUAL_DEFAULTS,
      ...CHILD_VISUAL_DEFAULTS,

      children: [],
      elementState: props.id === 0 ? ElementState.FlexContainer : ElementState.Content,
      display: Display.Block,
      content: `I'm block number ${props.id}`,
      resetStyleCounter: 0,
    }
  }

  /************
   * ON FOCUS *
   ************/

  focus = (e?: React.MouseEvent<HTMLElement>) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }

    let callbacks: Callbacks = {
      setElementState: this.setElementState,
      setMargin: this.setMargin,
      setBorderWidth: this.setBorderWidth,
      setBorderColor: this.setBorderColor,
      setPadding: this.setPadding,

      setColor: this.setColor,
      setBackgroundColor: this.setBackgroundColor,

      remove: this.props.remove,

      // When it's a flex container
      setFlexDirection: this.setFlexDirection,
      setJustifyContent: this.setJustifyContent,
      setAlignItems: this.setAlignItems,

      addChild: this.addChild,
      clearChildren: this.clearChildren,

      setChildMargin: this.setChildMargin,
      setChildBorderWidth: this.setChildBorderWidth,
      setChildBorderColor: this.setChildBorderColor,
      setChildPadding: this.setChildPadding,
      resetChildStyles: this.resetChildStyles,

      // When it's content
      setFlexGrow: this.setFlexGrow,
      setFlexShrink: this.setFlexShrink,
      setFlexBasis: this.setFlexBasis,
      setAlignSelf: this.setAlignSelf,

      setContent: this.setContent,
      setDisplay: this.setDisplay,
      addSiblingBefore: this.props.addSiblingBefore,
      addSiblingAfter: this.props.addSiblingAfter,
    }
    let currentState = Object.assign({}, this.state)

    this.props.focus({
      currentState,
      callbacks,
      parentFlex: this.props.parentFlex,
      id: this.props.id,
    })
  }

  /**************************
   * CHANGING ELEMENT TYPES *
   **************************/

  setElementState = (elementState: ElementState) => {
    let currentElementState = this.state.elementState
    if (elementState === currentElementState) return
    let newState: Partial<State> = {}

    if (elementState === ElementState.FlexContainer) {
      // Restore flex defaults
      newState = { elementState, ...FLEX_CONTAINER_DEFAULTS }
      // Clear children and children visuals if coming from content element state.
      if (currentElementState === ElementState.Content) {
        Object.assign(newState, { children: [], ...CHILD_VISUAL_DEFAULTS })
      }
    } else if (elementState === ElementState.BlockContainer) {
      newState = { elementState }
      // Clear children and children visuals if coming from content element state.
      if (currentElementState === ElementState.Content) {
        Object.assign(newState, { children: [], ...CHILD_VISUAL_DEFAULTS })
      }
    } else if (elementState === ElementState.Content) {
      newState = { elementState, content: `I'm block number ${this.props.id}` }
    }

    this.setState(newState as any) // setState types are weird.
  }

  setDisplay = (display: Display) => {
    this.setState({ display })
  }

  setContent = (content: string) => {
    this.setState({ content })
  }

  /*************************
   * DEALING WITH CHILDREN *
   *************************/

  addChild = () => {
    let newChildren = [...this.state.children, nextId()]
    this.setState({ children: newChildren })
  }

  addChildBefore = (id: number) => {
    let index = this.state.children.indexOf(id)
    let newChildren = [...this.state.children]
    newChildren.splice(index, 0, nextId())
    this.setState({ children: newChildren })
  }

  addChildAfter = (id: number) => {
    let index = this.state.children.indexOf(id)
    let newChildren = [...this.state.children]
    newChildren.splice(index + 1, 0, nextId())
    this.setState({ children: newChildren })
  }

  removeChild = (id: number) => {
    let index = this.state.children.indexOf(id)
    let newChildren = [...this.state.children]
    newChildren.splice(index, 1)
    this.setState({ children: newChildren })
    this.focus()
  }

  clearChildren = () => {
    this.setState({ children: [] })
  }

  /*******************
   * FLEX PROPERTIES *
   *******************/

  // Flex Containers
  setFlexDirection = (flexDirection: Flex.Direction) => this.setState({ flexDirection })
  setJustifyContent = (justifyContent: Flex.JustifyContent) =>
    this.setState({ justifyContent })
  setAlignItems = (alignItems: Flex.AlignItems) => this.setState({ alignItems })

  // Flex items
  setFlexGrow = (flexGrow: number) => this.setState({ flexGrow })
  setFlexShrink = (flexShrink: number) => this.setState({ flexShrink })
  setFlexBasis = (flexBasis: string) => this.setState({ flexBasis })
  setAlignSelf = (alignSelf: Flex.AlignItems | undefined) => this.setState({ alignSelf })

  /*********************
   * VISUAL APPEARANCE *
   *********************/

  setColor = (color: string) => this.setState({ color })
  setBackgroundColor = (backgroundColor: string) => this.setState({ backgroundColor })

  setMargin = (width: number) => this.setState({ marginWidth: width })
  setBorderWidth = (width: number) => this.setState({ borderWidth: width })
  setBorderColor = (color: string) => this.setState({ borderColor: color })
  setPadding = (width: number) => this.setState({ paddingWidth: width })

  setChildMargin = (width: number) => this.setState({ childMarginWidth: width })
  setChildBorderWidth = (width: number) => this.setState({ childBorderWidth: width })
  setChildBorderColor = (color: string) => this.setState({ childBorderColor: color })
  setChildPadding = (width: number) => this.setState({ childPaddingWidth: width })

  resetChildStyles = () => {
    this.setState({ resetStyleCounter: this.state.resetStyleCounter + 1 })
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.resetStyleCounter !== nextProps.resetStyleCounter) {
      this.setState({
        marginWidth: undefined,
        borderWidth: undefined,
        borderColor: undefined,
        paddingWidth: undefined,
      })
    }
  }

  /*************
   * RENDERING *
   *************/

  getElemStyles(): React.CSSProperties {
    let { props, state } = this
    let style: React.CSSProperties = {}

    // Set display
    let { elementState, display } = state
    if (elementState === ElementState.FlexContainer) {
      style.display = "flex"

      style.flexDirection = state.flexDirection as any
      style.justifyContent = state.justifyContent as any
      style.alignItems = state.alignItems as any
    } else if (elementState === ElementState.Content) {
      if (props.parentFlex) {
        style.flexGrow = state.flexGrow
        style.flexShrink = state.flexShrink
        style.flexBasis = state.flexBasis
        style.alignSelf = state.alignSelf || "auto"
      }

      if (display === Display.Inline) {
        style.display = "inline"
      }
    }

    let marginWidth = state.marginWidth != null ? state.marginWidth : props.marginWidth
    let borderWidth = state.borderWidth != null ? state.borderWidth : props.borderWidth
    let borderColor = state.borderColor != null ? state.borderColor : props.borderColor
    let paddingWidth =
      state.paddingWidth != null ? state.paddingWidth : props.paddingWidth

    style.margin = `${marginWidth}px`

    style.borderWidth = `${borderWidth}px`
    style.borderStyle = "solid"
    style.borderColor = borderColor
    if (state.color) style.color = state.color
    if (state.backgroundColor) style.backgroundColor = state.backgroundColor

    style.padding = `${paddingWidth}px`

    return style
  }

  formatChildren(): React.ReactNode[] {
    return this.state.children.map(childId => {
      return (
        <FlexElement
          key={childId}
          id={childId}
          addSiblingBefore={() => this.addChildBefore(childId)}
          addSiblingAfter={() => this.addChildAfter(childId)}
          remove={() => this.removeChild(childId)}
          marginWidth={this.state.childMarginWidth}
          borderWidth={this.state.childBorderWidth}
          borderColor={this.state.childBorderColor}
          paddingWidth={this.state.childPaddingWidth}
          resetStyleCounter={this.state.resetStyleCounter}
          parentFlex={this.state.elementState === ElementState.FlexContainer}
          focus={this.props.focus}
        />
      )
    })
  }

  componentDidMount() {
    if (this.props.id === 0) this.focus()
  }

  render() {
    let content =
      this.state.elementState === ElementState.Content
        ? this.state.content
        : this.formatChildren()

    return (
      <div style={this.getElemStyles()} onClick={this.focus}>
        {content}
      </div>
    )
  }
}
