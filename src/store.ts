import {
  applyMiddleware,
  combineReducers,
  compose,
  createStore,
  Dispatch as ReduxDispatch,
  Middleware,
} from "redux"
import { createLogger } from "redux-logger"

import { elements, ElementsState } from "elements-reducer"
import { mode, ModeState } from "keyboard/modes"

export interface Store {
  elements: ElementsState
  mode: ModeState
}

export type Dispatch = ReduxDispatch<Store>

const rootReducer = combineReducers<Store>({
  elements,
  mode,
})

const logger = createLogger({
  level: "info",
  collapsed: false,
  logger: console,
})

let middlewares: Middleware[] = [logger]
const enhancer = compose(applyMiddleware(...middlewares))
const store = createStore<Store>(rootReducer, enhancer)
export default store
