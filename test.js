// function arrayToObject(keys, values) {
//   const eventParams = keys.reduce((reduced, next, index) => {
//     const [paramName, paramType] = next.split(":");
//     reduced[paramName] = {};
//     reduced[paramName].type = paramType;
//     reduced[paramName].value = values[index];
//     return reduced;
//   }, {});

//   return eventParams
// }

// const a = arrayToObject(["e:uint256","b:string"], [5,"haha"])
// console.log(JSON.stringify(a, null, 2))

const A = require('./testA')
const B = require('./testB')
const C = require('./testC')

let ga = require('./testBA')

const a = new A()
const b = new B()
const c = new C()

console.log(`ga = ${ga}, a ${a.getGa()}, b ${b.getGa()}, c ${c.getGa()} `)