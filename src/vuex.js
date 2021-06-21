import { reactive } from "./index"

export class Store {
  constructor(options = {}) {
    // getter什么的都里面
    let { state, mutations, plugins } = options
    // this._vm = state 关键是做一个响应式更新 用definProperty 做一个相应的劫持
    this._vm = reactive(state)
    this._mutations = mutations
    this._subscribe = []
    // 插件遍历执行 把一个store传进去了
    plugins.forEach((plugin) => plugin(this))
  }

  get state() {
    return this._vm
  }

  commit(type, payload) {
    // 去除对应的mutation
    const entry = this._mutations[type]
    // 没有就返回
    if (!entry) {
      return
    }
    // 有就去执行
    entry(this.state, payload)
    this._subscribe.forEach((sub) => sub({ type, payload }, this.state))
  }
  subscribe(fn) {
    if (!this._subscribe.includes(fn)) {
      this._subscribe.push(fn)
    }
  }
}
