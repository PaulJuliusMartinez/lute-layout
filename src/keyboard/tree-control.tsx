import * as React from "react"
import { connect } from "react-redux"

import * as TreeActions from "elements-actions"
import { Dispatch } from "store"

interface TreeControlProps {
  [fn: string]: () => void
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
    h: "moveUp",
    j: "moveRight",
    k: "moveLeft",
    l: "moveDown",
    0: "moveToFirst",
    $: "moveToLast",
  },

  h: "moveFocusUp",
  j: "moveFocusRight",
  k: "moveFocusLeft",
  l: "moveFocusDown",

  ArrowLeft: "moveFocusUp",
  ArrowDown: "moveFocusRight",
  ArrowUp: "moveFocusLeft",
  ArrowRight: "moveFocusDown",

  0: "moveFocusToFirst",
  $: "moveFocusToLast",

  H: "moveUp",
  J: "moveRight",
  K: "moveLeft",
  L: "moveDown",
}

function mapDispatchToProps(dispatch: Dispatch) {
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
  } as TreeControlProps
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

export default connect(undefined, mapDispatchToProps)(TreeControl)
