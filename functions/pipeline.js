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
// const filter_empty_sentences = { $match: { sentences: { $ne: [] } } }

const generate_pipeline = ({
  search_terms = undefined,
  is_quote = null,
  source = undefined,
  entities = null
} = {}) => {
  const pipeline = []

  if (search_terms) {
    pipeline.push(
      {
        $match: { $text: { $search: search_terms, $language: 'es' } }
      },
      {
        $addFields: {
          sentences: {
            $filter: {
              input: '$sentences',
              as: 'item',
              cond: {
                $regexMatch: {
                  input: '$$item.text',
                  regex: createAccentInsensitiveRegex(search_terms),
                  options: 'i'
                }
              }
            }
          }
        }
      }
    )
  }

  if (source) {
    pipeline.push({ $match: source })
  }

  if (is_quote) {
    pipeline.push(is_quote)
  }

  //   If is_quote filter
  if (is_quote) {
    pipeline.push({
      $addFields: {
        sentences: {
          $filter: {
            input: '$sentences',
            as: 'sentence',
            cond: {
              $eq: ['$$sentence.is_quote', is_quote]
            }
          }
        }
      }
    })
  }

  //   If there are entities filter unwind the entities field, search for the entities and group back the results
  if (entities) {
    pipeline.push(
      { $unwind: '$sentences' },
      { $unwind: '$sentences.entities' },
      {
        $match: {
          'sentences.entities.0': RegExp(entities.replace(',', '|'), 'i')
        }
      },
      {
        $group: {
          _id: { docId: '$_id', sentId: '$sentences.text' }, // Grouping based on the 'text' attribute
          headline: { $first: '$headline' },
          date: { $first: '$date' },
          rank: { $first: '$rank' },
          url: { $first: '$url' },
          entities: { $addToSet: '$sentences.entities' } // Pushing 'entities' for each unique 'text'
        }
      },
      {
        $project: {
          _id: 0,
          headline: 1,
          url: 1,
          date: 1,
          rank: 1,
          text: '$_id.sentId',
          entities: 1,
          yearMonthDay: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$date'
            }
          }
        }
      },
      {
        $group: {
          _id: '$headline',
          date: { $first: '$date' },
          rank: { $first: '$rank' },
          yearMonthDay: { $first: '$yearMonthDay' },
          sentences: {
            $push: { text: '$text', entities: '$entities' }
          },
          url: { $first: '$url' }
        }
      },
      {
        $project: {
          _id: 0,
          headline: '$_id',
          url: 1,
          rank: 1,
          sentences: 1,
          date: 1,
          yearMonthDay: 1
        }
      }
    )
  } else {
    pipeline.push({
      $project: {
        yearMonthDay: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$date'
          }
        },
        date: 1,
        rank: 1,
        headline: 1,
        sentences: 1,
        url: 1
      }
    })
  }

  //   If there are search_terms order results based on fulltext search score
  if (search_terms) {
    pipeline.push({
      $sort: {
        score: { $meta: 'textScore' },
        yearMonthDay: -1,
        date: -1
      }
    })
  } else {
    pipeline.push({
      $sort: {
        yearMonthDay: -1,
        date: -1
      }
    })
  }

  return pipeline
}

module.exports = generate_pipeline


"entities": [
        [
          "Díaz",
          10,
          14,
          "PER"
        ],
        [
          "Gobierno",
          35,
          43,
          "ORG"
        ],
        [
          "Ejecutivo",
          154,
          163,
          "ORG"
        ]
      ]