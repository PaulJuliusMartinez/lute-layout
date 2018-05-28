import * as React from "react"
import { connect } from "react-redux"

import * as TreeActions from "elements-actions"
import { Dispatch, Store } from "store"

enum Axis {
  Horizontal,
  Vertical,
}

interface ConnectStateProps {
  axis: Axis
}

interface ConnectDispatchProps {
  [fn: string]: () => void
}

type TreeControlProps = ConnectStateProps & ConnectDispatchProps

function hv(horizontal: string, vertical: string): (axis: Axis) => string {
  return (axis: Axis) => axis === Axis.Horizontal ? horizontal : vertical
}

const KEY_FN_MAP: { [fn: string]: any } = {
  O: "addSiblingBefore",
  o: "addSiblingAfter",
  i: "addChildStart",
  a: "addChildEnd",
  n: "addChildEnd",

  d: {
    c: "removeChildren",
    n: "deleteElement",
  },

  f: "flatten",
  w: "wrap",

  m: {
    h: hv("moveLeft", "moveUp"),
    j: hv("moveDown", "moveRight"),
    k: hv("moveUp", "moveLeft"),
    l: hv("moveRight", "moveDown"),
    0: "moveToFirst",
    $: "moveToLast",
  },

  h: hv("moveFocusLeft", "moveFocusUp"),
  j: hv("moveFocusDown", "moveFocusRight"),
  k: hv("moveFocusUp", "moveFocusLeft"),
  l: hv("moveFocusRight", "moveFocusDown"),

  ArrowLeft: hv("moveFocusLeft", "moveFocusUp"),
  ArrowDown: hv("moveFocusDown", "moveFocusRight"),
  ArrowUp: hv("moveFocusUp", "moveFocusLeft"),
  ArrowRight: hv("moveFocusRight", "moveFocusDown"),

  0: "moveFocusToFirst",
  $: "moveFocusToLast",

  H: hv("moveLeft", "moveUp"),
  J: hv("moveDown", "moveRight"),
  K: hv("moveUp", "moveLeft"),
  L: hv("moveRight", "moveDown"),
}

function mapStateToProps(store: Store): ConnectStateProps {
  let { focusedLeaf, elements } = store.elements
  if (!focusedLeaf.parent) return { axis: Axis.Vertical }
  let parentId = focusedLeaf.parent.logicalId
  let parent = elements[parentId]

  let axis = Axis.Vertical
  if (parent.styles.display === "flex") {
    let flexDirection = parent.styles.flexDirection || parent.styles["flex-direction"]
    if (!flexDirection || flexDirection === "row" || flexDirection === "row-reverse") {
      axis = Axis.Horizontal
    }
  }

  return { axis }
}

function mapDispatchToProps(dispatch: Dispatch): ConnectDispatchProps {
  return {
      addChildStart: () => { dispatch(TreeActions.addChildStart()) },
      addChildEnd: () => { dispatch(TreeActions.addChildEnd()) },
      addSiblingBefore: () => { dispatch(TreeActions.addSiblingBefore()) },
      addSiblingAfter: () => { dispatch(TreeActions.addSiblingAfter()) },

      deleteElement: () => { dispatch(TreeActions.deleteNode()) },
      removeChildren: () => { dispatch(TreeActions.removeChildren()) },
      flatten: () => { dispatch(TreeActions.flatten()) },
      wrap: () => { dispatch(TreeActions.wrap()) },

      moveToFirst: () => { dispatch(TreeActions.moveToFirst()) },
      moveUp: () => { dispatch(TreeActions.moveUp()) },
      moveDown: () => { dispatch(TreeActions.moveDown()) },
      moveLeft: () => { dispatch(TreeActions.moveLeft()) },
      moveRight: () => { dispatch(TreeActions.moveRight()) },
      moveToLast: () => { dispatch(TreeActions.moveToLast()) },

      duplicate: () => { dispatch(TreeActions.duplicate()) },
      shallowDuplicate: () => { dispatch(TreeActions.shallowDuplicate()) },
      deepDuplicate: () => { dispatch(TreeActions.deepDuplicate()) },
      dissociate: () => { dispatch(TreeActions.dissociate()) },
      copy: () => { dispatch(TreeActions.copy()) },
      paste: () => { dispatch(TreeActions.paste()) },

      moveFocusToFirst: () => { dispatch(TreeActions.moveFocusToFirst()) },
      moveFocusUp: () => { dispatch(TreeActions.moveFocusUp()) },
      moveFocusDown: () => { dispatch(TreeActions.moveFocusDown()) },
      moveFocusLeft: () => { dispatch(TreeActions.moveFocusLeft()) },
      moveFocusRight: () => { dispatch(TreeActions.moveFocusRight()) },
      moveFocusToLast: () => { dispatch(TreeActions.moveFocusToLast()) },
  }
}

interface TreeControlState {
  inputs: string[]
}

class TreeControl extends React.Component<TreeControlProps, TreeControlState> {
  ref: HTMLElement

  constructor(props: TreeControlProps) {
    super(props)
    this.state = { inputs: [] }
  }

  initRef = (elem: HTMLInputElement | null) => {
    if (elem) this.ref = elem
  }

  handleKeyDown = (e: KeyboardEvent) => {
    let activeElement = document.activeElement
    if (activeElement && activeElement.tagName === "INPUT") return

    if (e.repeat) return
    if (e.key === "Shift") return

    if (e.key === "Escape") {
      this.setState({ inputs: [] })
      return
    }


    let map = KEY_FN_MAP
    let { inputs } = this.state
    for (let input of inputs) {
      map = map[input]
    }
    let action = map[e.key]
    if (action == null) {
      this.setState({ inputs: [] })
      return
    }

    e.preventDefault()

    if (typeof action === "string") {
      this.setState({ inputs: [], }, this.props[action])
    } else if (typeof action === "function") {
      this.setState({ inputs: [], }, this.props[action(this.props.axis)])
    } else if (typeof action === "object") {
      this.setState({ inputs: [...inputs, e.key] })
    }
  }

  componentDidMount() {
    window.addEventListener("keydown", this.handleKeyDown)
    this.ref.focus()
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown)
  }

  render() {
    return <span ref={this.initRef} tabIndex={-1} />
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TreeControl)
