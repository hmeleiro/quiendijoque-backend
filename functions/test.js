function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

function createAccentInsensitiveRegex(string) {
  const accents = [
    { base: 'a', chars: '[àáâãäåa]' },
    { base: 'e', chars: '[èéêëe]' },
    { base: 'i', chars: '[ìíîïi]' },
    { base: 'o', chars: '[òóôõöo]' },
    { base: 'u', chars: '[ùúûüu]' }
  ]
  let result = escapeRegExp(string)
  for (let i = 0; i < accents.length; i++) {
    result = result.replace(new RegExp(accents[i].base, 'g'), accents[i].chars)
  }
  return result
}

let x = '"psicopatas sin limites eticos"'

x = x
  .split(' ')
  .map((word) => createAccentInsensitiveRegex(word))
  .join('|')
console.log(x)
