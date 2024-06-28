function emptyAction () {
  // 警告：提示当前使用的是空 Action
  console.warn('Current execute action is empty!')
}

// 我们首先设置一个用于通信的Actions类

class Actions {
  actions = {
    onGlobalStateChange: emptyAction,
    setGlobalState: emptyAction
  }
  // 默认值为空Action

  // 设置actions
  setActions (actions) {
    this.actions = actions
  }

  // 映射
  onGlobalStateChange (...args) {
    if (this.actions && typeof this.actions.onGlobalStateChange === 'function') {
      return this.actions.onGlobalStateChange(...args)
    }
  }
  // 映射
  setGlobalState (...args) {
    if (this.actions && typeof this.actions.setGlobalState === 'function') {
      return this.actions.setGlobalState(...args)
    }
  }
}

const actions = new Actions()
export default actions
