/* eslint-disable no-unused-vars */

let active

let watch = function(cb) {
  active = cb
  active()
  active = null
}

// let queue =[];

class Dep {
  constructor() {
    this.deps = new Set()
  }
  depend() {
    if (active) {
      this.deps.add(active)
    }
  }
  notify() {
    this.deps.forEach((dep) => dep())
  }
}

// let ref = (initValue) => {
//   let value = initValue
//   let dep = new Dep()
//   return Object.defineProperty({}, "value", {
//     get() {
//       dep.depend()
//       return value
//     },
//     set(newValue) {
//       value = newValue
//       dep.notify()
//     },
//   })
// }

let createReactive = (target, prop, value) => {
  let dep = new Dep()

  return Object.defineProperty(target, prop, {
    get() {
      // 依赖的收集
      dep.depend()
      return value
    },
    set(newValue) {
      value = newValue
      // 依赖的通知
      dep.notify()
    },
  })
}

export let reactive = (obj) => {
  // let dep = new Dep()
  Object.keys(obj).forEach((key) => {
    let value = obj[key]
    createReactive(obj, key, value)
  })

  return obj
}

// 引入vux
import { Store } from "./vuex"
let store = new Store({
  state: {
    count: 0,
  },
  mutations: {
    addCount(state, payload) {
      state.count += payload || 1
    },
  },
  // vux的插件机制
  plugins: [
    (store) =>
      // 监听日志上报什么的可以在这里完成
      store.subscribe((mutation, state) => {
        console.log(mutation)
      }),
  ],
})

document.getElementById("add").addEventListener("click", function() {
  // 对count进行操作就会去依赖的通知 就会触发收集起来的watch中的函数
  store.commit("addCount", 1)
})
let str

watch(() => {
  // 有个对count读的操作就会把依赖给收集起来
  str = `hello${store.state.count}`
  document.getElementById("app").innerText = str
})
