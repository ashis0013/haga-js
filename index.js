const zero = '+[]'
const one = '+!![]'
const table = {}


const digit = (n) => n ? Array(n).fill(one).join(' + ') : zero
const num = (n) => n > 9 ? `+(${Array.from(n+[]).map((d) => '[' + digit(+d) + ']').join(' + ')})` : digit(n)

const getString = (str) => (Array.from(str).map((ch) => table[ch]).join(' + '))

const fillMap = (val, exp) => Array.from(val).forEach(
  (c,i) => (table[c] && `(${exp})[${digit(i)}]`.length > table[c].length) || (table[c] = `(${exp})[${num(i)}]`)
)

Array.from('0123456789').forEach((d,i) => table[d] = `(${digit(i)} + [])`)

fillMap(![] + [], '![] + []')
fillMap(!![] + [], '!![] + []')
fillMap([][[]] + [], '[][[]] + []')
fillMap([]['at'] + [], `[][${getString('at')}] + []`)
fillMap([]['entries']() + [], `[][${getString('entries')}]() + []`)
fillMap((![])['constructor'] + [], `(![])[${getString('constructor')}] + []`)
fillMap((+[])['constructor'] + [], `(+[])[${getString('constructor')}] + []`)
fillMap(([] + [])['constructor'] + [], `([] + [])[${getString('constructor')}] + []`)
fillMap(([]['at'])['constructor'] + [], `([][${getString('at')}])[${getString('constructor')}] + []`)

table.func = `([][${getString('at')}])[${getString('constructor')}]`
table['.'] = `(+(${getString('11e100')}) + [])[${one}]`
table['+'] = `(+(${getString('11e100')}) + [])[${num(4)}]`
table[','] = `([[]][${getString('concat')}]([[]]) + [])[${zero}]`

Array.from('abcdefghijklmnopqrstuvwxyz').filter((x) => !table[x]).forEach((ch) => {
  const value = ch.charCodeAt(0) - 'a'.charCodeAt(0) + 10
  table[ch] = `(${num(value)})[${getString('toString')}](+(${num(36)}))`
})

// For Reference Error
const code = 'try{String()[f](false)}catch(f){return f}'
table.R = `(${table.func}(${getString(code)})()+[])[${zero}]`
table.E = `(${table.func}(${getString(code)})()+[])[${digit(9)}]`
table.regexp = `${table.func}(${getString('return RegExp')})()`

table['/'] = `(${table.regexp}() + [])[${zero}]`
table['?'] = `(${table.regexp}() + [])[${digit(2)}]`
table[':'] = `(${table.regexp}() + [])[${digit(3)}]`
table['\\'] = `(${table.regexp}(${table['/']})+[])[${one}]`

table["'"] = `(${table.func}(${getString("try{Function([]+[[]].concat([[]]))()}catch(f){return f}")})() + [])[${num(30)}]`

const unicoded = (char) => {
  const hex = char.codePointAt(0).toString(16);
  const unicode = "0000".substring(0, 4 - hex.length) + hex;
  const code = `return '\\u${unicode}'`
  return `${table.func}(${getString(code)})()`
}

const stringify = (str) => Array.from(str).map(
  (char) => table[char] || unicoded(char)
).join(' + ')

const transpile = (str) => `${table.func}(${stringify(str)})()`

console.log(transpile('console.log("Hello, World!")'))
