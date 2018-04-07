import {
  applyMiddleware,
  combineReducers,
  compose,
  createStore,
  Dispatch as ReduxDispatch,
  Middleware,
} from "redux"
import { createLogger } from "redux-logger"

// import { stubState, StubState } from "stub-state"
interface StubState {}
const defaultStubState: StubState = {}
function stubState(state = defaultStubState, action: any): StubState {
  return state
}

export interface Store {
  stubState: StubState
}

export type Dispatch = ReduxDispatch<Store>

const rootReducer = combineReducers<Store>({
  stubState,
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
