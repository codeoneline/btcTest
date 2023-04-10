function sleep(time) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve();
    }, time);
  })
}

let s = 'ss'
async function b() {
  s  = s + ' bs '
  await sleep(1)
  s  = s + ' be '
}
async function a() {
  s  = s + ' as '
  await b()
  s  = s + ' ae '
}

async function c() {
  s  = s + ' cs '
  await b()
  s  = s + ' ce '
}

async function main() {
  await a()
  await c()

  console.log(` main    ${s}`)
}

// package ss as  bs 
//  main    ss as  bs  be  ae  cs  bs  be  ce
setTimeout(async () => {
  await main()
  console.log(` package ${s}`)
}, 0)