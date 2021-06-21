// ??? onYchanged? onZChanged? active不够用怎么办？
let x
let y
let z
// let f = (n) => n * 100 + 100
// 为了让onXchanged函数执行而设置的变量
let active

let watchValChange = (cb) => {
  active = cb
  active()
  // 为了保证依赖只被添加一次
  active = null
}
let queue = []
// 微任务会在宏任务的队列执行完毕之后立即执行
// value 赋值完成后
// 在下次DOM更新循环结束之后执行延迟回调
let nextTick = (cb) => Promise.resolve().then(cb)
/* eslint-disable*/
let queueJob = (job) => {
  if (!queue.includes(job)) {
    queue.push(job)
    nextTick(flushJobs)
    // flushJobs()
  }
}
let flushJobs = () => {
  let job
  while ((job = queue.shift()) !== undefined) {
    job()
  }
}
// 为了防止active不够用进行active收集
class Dep {
  // set 里面去缓存依赖
  deps = new Set()
  // 收集
  depend() {
    if (active) {
      this.deps.add(active)
    }
  }
  // 执行
  notify() {
    this.deps.forEach(
      // (dep) => dep()
      (dep) => queueJob(dep)
    )
  }
}
// 1. 先顺应vue的传统操作 defineProperty
let ref = (initValue) => {
  let value = initValue
  // 对每个ref初始化dep类收集依赖
  let dep = new Dep()
  return Object.defineProperty({}, "value", {
    get() {
      // 添加依赖
      dep.depend()
      return value
    },
    set(newValue) {
      value = newValue
      // 执行onXChanged()函数
      // active()
      // 使用依赖 相当于 active()
      dep.notify()
    },
  })
}
// 创建一个新的对象
x = ref(1) // 200
y = ref(2)
z = ref(3)
// x = 1
let temp
watchValChange(() => {
  // y = f(x)
  // y = f(x.value)
  // console.log(y)
  temp = `helloX${x.value},helloY${y.value},helloZ${z.value}<br/>`
  console.log(temp)
  document.write(temp)
  // <br/>
})

// 后续修改 通过x.value来修改
// x = 2
// x = 3
console.log("edit:", temp)
x.value = 2 // 300
x.value = 3 // 400

y.value = 4
z.value = 5
console.log("done", temp)

// 将回调延迟到下次DOM更新循环之后执行
// 通常在修改数据之后使用这个方法，在回调中获取更新后的DOM
// 在生命周期函数中直接执行的代码，不能保证子组件也完成了挂载和更新
// mounted(){
//   this.$nextTick(function(){})
// }
