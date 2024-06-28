import Vue from 'vue'
import App from './App.vue'
import Highlight from './helpers/highlight'

import actions from './helpers/actions'

Vue.config.productionTip = false
Vue.use(Highlight)

let instance = null

function render (props = {}) {
  if (props) {
    actions.setActions(props)
  }
  const { container } = props
  instance = new Vue({
    render: (h) => h(App)
  }).$mount(container ? container.querySelector('#app') : '#app')
}

if (!window.__POWERED_BY_QIANKUN__) {
  // 这里是子应用独立运行的环境
  render()
}

export async function bootstrap () {
  // console.log('[vue] vue app bootstraped')
}

export async function mount (props) {
  // console.log('[vue] props from main framework', props)
  render(props)
}

export async function unmount () {
  instance.$destroy()
  instance.$el.innerHTML = ''
  instance = null
}
