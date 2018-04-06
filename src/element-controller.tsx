import * as React from "react"

import * as Flex from "flex"
import {
  Callbacks,
  Display,
  ElementState,
  FocusInfo,
  State,
} from "flex-element"

interface Props {
  focusInfo: FocusInfo
}

export default class ElementController extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {} as any
  }

  setContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let content = e.currentTarget.value
    this.props.focusInfo.callbacks.setContent(content)
    this.setState({ content })
  }

  setFlexBasis = (e: React.ChangeEvent<HTMLInputElement>) => {
    let flexBasis = e.currentTarget.value
    this.props.focusInfo.callbacks.setFlexBasis(flexBasis)
    this.setState({ flexBasis })
  }

  createSetSelect(
    stateKey: keyof State,
    callbackKey: keyof Callbacks,
  ): ((e: React.ChangeEvent<HTMLSelectElement>) => void) {
    return e => {
      let value = e.currentTarget.value
      let fn = this.props.focusInfo.callbacks[callbackKey] as (enumValue: string) => void
      fn(value)
      this.setState({ [stateKey]: value } as any)
    }
  }

  formatNumberInput(text: string, stateKey: keyof State, callbackKey: keyof Callbacks) {
    let handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let num = Number(e.currentTarget.value)
      if (!Number.isNaN(num)) {
        let fn = this.props.focusInfo.callbacks[callbackKey] as (num: number) => void
        fn(num)
        this.setState({ [stateKey]: num } as any)
      }
    }

    return (
      <div>
        {text}
        <input
          type="number"
          value={this.state[stateKey] as any}
          onChange={handleChange}
        />
      </div>
    )
  }

  formatColorInput(text: string, stateKey: keyof State, callbackKey: keyof Callbacks) {
    let handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let color = e.currentTarget.value
      let fn = this.props.focusInfo.callbacks[callbackKey] as (color: string) => void
      fn(color)
      this.setState({ [stateKey]: color } as any)
    }

    return (
      <div>
        {text}
        <input type="color" value={this.state[stateKey] as any} onChange={handleChange} />
      </div>
    )
  }

  /**************
   * Formatters *
   **************/

  formatAppearance() {
    return (
      <div>
        <h4>Appearance:</h4>
        {this.formatNumberInput("Margin Width: ", "marginWidth", "setMargin")}
        {this.formatNumberInput("Border Width: ", "borderWidth", "setBorderWidth")}
        {this.formatColorInput("Border Color: ", "borderColor", "setBorderColor")}
        {this.formatNumberInput("Padding Width: ", "paddingWidth", "setPadding")}
        {this.formatColorInput("Text Color: ", "color", "setColor")}
        {this.formatColorInput(
          "Background Color: ",
          "backgroundColor",
          "setBackgroundColor",
        )}
      </div>
    )
  }

  formatElementStateControls() {
    return (
      <div>
        Element Type:{" "}
        <select
          value={this.state.elementState}
          onChange={this.createSetSelect("elementState", "setElementState")}
        >
          <option value={ElementState.FlexContainer}>display: flex</option>
          <option value={ElementState.BlockContainer}>display: block</option>
          <option value={ElementState.Content}>Content</option>
        </select>
        <button onClick={this.props.focusInfo.callbacks.remove} value="Remove Element" />
        <input
          type="button"
          onClick={this.props.focusInfo.callbacks.addSiblingBefore}
          value="Add Sibling Before"
        />
        <input
          type="button"
          onClick={this.props.focusInfo.callbacks.addSiblingAfter}
          value="Add Sibling After"
        />
      </div>
    )
  }

  formatContainerControls() {
    return (
      <div>
        <h4>Children:</h4>
        <input
          type="button"
          onClick={this.props.focusInfo.callbacks.addChild}
          value="Add Child"
        />
        <input
          type="button"
          onClick={this.props.focusInfo.callbacks.clearChildren}
          value="Clear Children"
        />
        {this.formatNumberInput(
          "Child Margin Width: ",
          "childMarginWidth",
          "setChildMargin",
        )}
        {this.formatNumberInput(
          "Child Border Width: ",
          "childBorderWidth",
          "setChildBorderWidth",
        )}
        {this.formatColorInput(
          "Child Border Color: ",
          "childBorderColor",
          "setChildBorderColor",
        )}
        {this.formatNumberInput(
          "Child Padding Width: ",
          "childPaddingWidth",
          "setChildPadding",
        )}
        <input
          type="button"
          onClick={this.props.focusInfo.callbacks.resetChildStyles}
          value="Reset Child Styles"
        />
      </div>
    )
  }

  formatFlexContainerControls() {
    return (
      <div>
        {this.formatContainerControls()}
        <div>
          Flex Direction:{" "}
          <select
            value={this.state.flexDirection}
            onChange={this.createSetSelect("flexDirection", "setFlexDirection")}
          >
            <option value={Flex.Direction.Row}>row</option>
            <option value={Flex.Direction.Column}>column</option>
            <option value={Flex.Direction.RowReverse}>row-reverse</option>
            <option value={Flex.Direction.ColumnReverse}>column-reverse</option>
          </select>
        </div>
        <div>
          Justify Content:{" "}
          <select
            value={this.state.justifyContent}
            onChange={this.createSetSelect("justifyContent", "setJustifyContent")}
          >
            <option value={Flex.JustifyContent.FlexStart}>flex-start</option>
            <option value={Flex.JustifyContent.FlexEnd}>flex-end</option>
            <option value={Flex.JustifyContent.Center}>center</option>
            <option value={Flex.JustifyContent.SpaceBetween}>space-between</option>
            <option value={Flex.JustifyContent.SpaceAround}>space-around</option>
            <option value={Flex.JustifyContent.SpaceEvenly}>space-evenly</option>
          </select>
        </div>
        <div>
          Align Items:{" "}
          <select
            value={this.state.alignItems}
            onChange={this.createSetSelect("alignItems", "setAlignItems")}
          >
            <option value={Flex.AlignItems.FlexStart}>flex-start</option>
            <option value={Flex.AlignItems.FlexEnd}>flex-end</option>
            <option value={Flex.AlignItems.Center}>center</option>
            <option value={Flex.AlignItems.Stretch}>stretch</option>
          </select>
        </div>
      </div>
    )
  }

  formatBlockContainerControls() {
    return <div>{this.formatContainerControls()}</div>
  }

  formatFlexItemControls() {
    return (
      <div>
        <h4>Flex Item Properties:</h4>
        {this.formatNumberInput("Flex Grow: ", "flexGrow", "setFlexGrow")}
        {this.formatNumberInput("Flex Shrink: ", "flexShrink", "setFlexShrink")}
        <div>
          FlexBasis:{" "}
          <input type="text" value={this.state.flexBasis} onChange={this.setFlexBasis} />
        </div>
        <div>
          Align Self:{" "}
          <select
            value={this.state.alignSelf}
            onChange={this.createSetSelect("alignSelf", "setAlignSelf")}
          >
            <option value={"auto"}>auto</option>
            <option value={Flex.AlignItems.FlexStart}>flex-start</option>
            <option value={Flex.AlignItems.FlexEnd}>flex-end</option>
            <option value={Flex.AlignItems.Center}>center</option>
            <option value={Flex.AlignItems.Stretch}>stretch</option>
          </select>
        </div>
      </div>
    )
  }

  formatBlockItemControls() {
    return (
      <div>
        Display:{" "}
        <select
          value={this.state.display}
          onChange={this.createSetSelect("display", "setDisplay")}
        >
          <option value={Display.Block}>block</option>
          <option value={Display.Inline}>inline</option>
        </select>
      </div>
    )
  }

  formatContentControls() {
    return (
      <div>
        Content:
        <textarea value={this.state.content} onChange={this.setContent} />
        {this.props.focusInfo.parentFlex ? this.formatFlexItemControls() : undefined}
        {this.props.focusInfo.parentFlex ? undefined : this.formatBlockItemControls()}
      </div>
    )
  }

  /************
   * Lifecyle *
   ************/

  componentWillReceiveProps(nextProps: Props) {
    this.setState(nextProps.focusInfo.currentState)
  }

  render() {
    if (!this.props.focusInfo) return <span>Initializing...</span>

    let { elementState } = this.state
    let { id } = this.props.focusInfo

    let controls: React.ReactNode = undefined

    if (elementState === ElementState.FlexContainer) {
      controls = this.formatFlexContainerControls()
    } else if (elementState === ElementState.BlockContainer) {
      controls = this.formatBlockContainerControls()
    } else {
      controls = this.formatContentControls()
    }

    return (
      <div>
        <h3>Element {id}</h3>
        {this.formatElementStateControls()}
        {this.formatAppearance()}
        {controls}
      </div>
    )
  }
}
