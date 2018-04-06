import * as React from "react"
import * as ReactDOM from "react-dom"
import { Provider } from "react-redux"

import FlexLayoutTool from "flex-layout-tool"
import store from "store"

import "stylesheets/app.styl"

ReactDOM.render(
  <Provider store={store}>
    <FlexLayoutTool />
  </Provider>,
  document.getElementById("app"),
)
