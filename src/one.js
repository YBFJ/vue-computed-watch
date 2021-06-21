// let x
// let y
// let f = (n) => n * 100 + 100

// x = 1
// y = f(x)
// console.log(y)

// x = 2
// y = f(x)
// console.log(y)

// x = 3
// y = f(x)
// console.log(y)

let x
let y
let f = (n) => n * 100 + 100
let onXChanged = (cb) => {}

onXChanged(() => {
  y = f(x)
  console.log(y)
})

x = 1
x = 2
x = 3
