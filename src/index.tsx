import * as React from "react"
import * as ReactDOM from "react-dom"
import { Provider } from "react-redux"

import store from "store"

import "stylesheets/app.styl"

ReactDOM.render(
  <Provider store={store}>
    <div className="hello-world">Hello, world</div>
  </Provider>,
  document.getElementById("app"),
)
