let x
let y
let f = (n) => n * 100 + 100
// 为了让onXchanged函数执行而设置的变量
let active

let watchChange = (cb) => {
  active = cb
  active()
}
// 1. 先顺应vue的传统操作 defineProperty
let ref = (initValue) => {
  let value = initValue
  // let dep = new Dep()
  return Object.defineProperty({}, "value", {
    get() {
      // 添加依赖
      // dep.depend()
      return value
    },
    set(newValue) {
      value = newValue
      // 执行onXChanged()函数
      active()
      // 使用 active()
      // dep.notify()
    },
  })
}
// 创建一个新的对象
x = ref(1) // 200
y = reft(2)
z = ref(3)
// x = 1
watchChange(() => {
  // y = f(x)
  // 此处进入get方法
  // y = f(x.value)
  // console.log(y)
  let temp = `helloX${x.value},helloY${y.value},helloZ${z.value}`
  console.log(temp)
  document.write(temp)
})

// 后续修改 通过x.value来修改
// x = 2
// x = 3
// 进入set方法
// 异步渲染 同时产生的API nextTick
// 模板多处变量依赖的时候，每一个变量改变的时候都会导致一次渲染
// 为了优化所以使用nextTick
x.value = 2
y.value = 2
z.value = 2
