import Vue from "vue"
import App from "./App.vue"

Vue.config.productionTip = false

new Vue({
  render: (h) => h(App),
}).$mount("#app")

// let x
// let y
let active
// , options = {}
// 不包裹effect可能会造成fn函数的污染 另外就是加参数
let effect = (fn, options = {}) => {
  // 副作用 本身也是一个函数
  let effect = (...args) => {
    // active = effect
    // return fn(...args)
    // 调用一次这个函数 对应x.value 会进入get方法 增加依赖
    // active()
    // 保证active的唯一性
    // active = null
    try {
      active = effect
      return fn(...args)
    } finally {
      // 为了在return之后置空active
      active = null
    }
  }
  // 数据发生变化的时候去通知options的执行
  effect.options = options
  // 为了方便查找依赖
  effect.deps = []
  return effect
}
// let watchEffect = function(cb) {
//   // 函数被调用的时候active = cb
//   active = cb
//   // 调用一次这个函数 对应x.value 会进入get方法 增加依赖
//   active()
//   // 保证active的唯一性
//   active = null
// }
// 对应的是stop函数
// let cleanUpEffect = (effect) => {
//   const { deps } = effect
//   if (deps.length) {
//     for (let i = 0; i < deps.length; i++) {
//       deps[i].delete(effect)
//     }
//   }
// }
let watchEffect = function(cb) {
  // 就是调用effect函数
  let runner = effect(cb)
  runner()
  // return () => {
  //   cleanUpEffect(runner)
  // }
}
// let f = (n) => n * 100 + 100
// let onXChanged = function(cb) {
//   // 函数被调用的时候active = cb
//   active = cb
//   // 调用一次这个函数 对应x.value 会进入get方法 增加依赖
//   active()
//   // 保证active的唯一性
//   active = null
// }

// 如果有很多的change函数的时候active就会不够用，所以增加这个函数用来缓存依赖
class Dep {
  deps = new Set()
  depend() {
    if (active) {
      this.deps.add(active)
      // 进行双向的索引
      active.deps.push(this.deps)
    }
  }
  notify() {
    // 在count的value改变的时候会去set方法 notify又在set方法中
    // 所以dirty要变成true需要在notify中改
    this.deps.forEach((dep) => dep())
    // 在schedular这里去改dirty和watch里面的操作 如果注掉computed就会不起作用
    this.deps.forEach((dep) => {
      dep.options && dep.options.schedular && dep.options.schedular()
    })
  }
}
// 先顺应vue的传统操作 defineProperty
let ref = (initValue) => {
  let value = initValue
  let dep = new Dep()
  return Object.defineProperty({}, "value", {
    get() {
      // 添加依赖
      dep.depend()
      return value
    },
    set(newValue) {
      value = newValue
      // active()
      // 使用
      dep.notify()
    },
  })
}

// x = ref(1)

// onXChanged(() => {
//   y = f(x.value)
//   console.log(y)
// })
// x.value = 2 // 300
// x.value = 3 // 400
let computed = (fn) => {
  let value
  // 关于computed的缓存
  let dirty = true
  let runner = effect(fn, {
    // 日程表
    schedular: () => {
      if (!dirty) {
        dirty = true
      }
    },
  })
  return {
    get value() {
      // dirty是为了增加缓存
      if (dirty) {
        // value = fn()
        value = runner()
        // 作为一个flag
        dirty = false
      }
      return value
    },
  }
}
// eslint-disable-line no-unused-vars
// , options = {}  watch 源 回调函数 可选参数

let watch = (source, cb, options = {}) => {
  const { immediate } = options
  let getter = () => {
    // 数据源可能是个函数
    return source()
  }
  let oldValue
  const runner = effect(getter, {
    // schedular: () => {
    //   let newValue = runner()
    //   if (newValue !== oldValue) {
    //     cb(newValue, oldValue)
    //     oldValue = newValue
    //   }
    // },
    // 其实就是依赖变化之后去执行的日程表
    schedular: () => applyCb(),
  })
  // 其实applyCb就是schedular
  const applyCb = () => {
    let newValue = runner()
    if (newValue !== oldValue) {
      cb(newValue, oldValue)
      oldValue = newValue
    }
  }
  if (immediate) {
    applyCb()
  } else {
    oldValue = runner()
  }
  // oldValue = runner()
}
let count = ref(0)
// 在get进行依赖收集(count.value+3)
let computedValue = computed(() => count.value + 3)
document.getElementById("add").addEventListener("click", function() {
  count.value++
})
let str
// let stop = watchEffect(() => {
//   str = `hello:${count.value}computedValue:${computedValue.value}`
//   document.getElementById("app").innerHTML = str
// })
// setTimeout(() => {
//   stop()
// }, 3000)
// Watch 响应式刷新
watchEffect(() => {
  str = `hello:${count.value}computedValue:${computedValue.value}`
  document.getElementById("app").innerHTML = str
})
// watch(() => count.value, (currentValue, preValue) =>{

//},{deep, immediate: true cb会被默认执行一次})
watch(
  () => count.value,
  (newValue, oldValue) => {
    console.log(newValue, oldValue)
  },
  { immediate: true }
)
