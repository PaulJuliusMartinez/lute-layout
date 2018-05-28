export enum Mode {
  TreeModification,
  StyleEditing,
  None,
}

export interface ModeState {
  activeMode: Mode
}

const MODE_ACTION = "CHANGE_MODE"
type ModeActionType = typeof MODE_ACTION

export interface ModeAction {
  type: ModeActionType
  mode: Mode
}

const DEFAULT_STATE: ModeState = { activeMode: Mode.TreeModification }

export function mode(state: ModeState = DEFAULT_STATE, action: ModeAction): ModeState {
  if (action.type === MODE_ACTION) {
    if (state.activeMode === action.mode) return state

    return { ...state, activeMode: action.mode }
  }

  return state
}

export function switchToMode(mode: Mode): ModeAction {
  return { type: MODE_ACTION, mode }
}

const switchToTreeModification: ModeAction = {
  type: MODE_ACTION,
  mode: Mode.TreeModification,
}

const switchToStyleEditing: ModeAction = { type: MODE_ACTION, mode: Mode.StyleEditing }

export { switchToStyleEditing, switchToTreeModification }
