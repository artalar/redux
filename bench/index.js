const redux = require('./redux')
const reduxPatch = require('./redux-patch')
const { performance } = require('perf_hooks')

const times = 1000
const complexity = 300
console.log('redux')
console.log(bench(redux, { times, complexity }).toFixed(3), 'ms')
console.log('reduxPatch')
console.log(bench(reduxPatch, { times, complexity }).toFixed(3), 'ms')

function bench({ createStore, combineReducers }, { times, complexity }) {
  let sideEffect = 0
  const createReducer = target => (state = 0, action) => {
    if (action.type === target) return state + 1
    return state
  }

  const reducer = combineReducers({
    count1: createReducer('1'),
    count2: createReducer('2'),
    count3: createReducer('3'),
    count4: createReducer('4'),
    count5: createReducer('5'),
    count6: createReducer('6'),
    count7: createReducer('7')
  })

  const results = []
  let i = 0
  while (i++ < times) {
    const store = createStore(reducer)
    let _complexity = complexity
    const unsubscribers = []
    const start = performance.now()

    while (_complexity--) {
      store.dispatch({
        type: (10 * Math.random()).toFixed(0)
      })
      unsubscribers.push(store.subscribe(() => sideEffect++))
    }
    unsubscribers.forEach(fn => fn())

    results.push(performance.now() - start)
  }
  results.push(sideEffect)
  results.pop()

  return median(results)
}

function median(values) {
  if (values.length === 0) return 0

  values = values.map(v => +v)

  values.sort((a, b) => (a - b ? 1 : -1))

  var half = Math.floor(values.length / 2)

  if (values.length % 2) return values[half]

  return (values[half - 1] + values[half]) / 2.0
}
