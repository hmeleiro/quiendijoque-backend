const e = require('cors')

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
  entities = null,
  start_date = null,
  end_date = null
} = {}) => {
  const pipeline = []

  if (search_terms) {
    pipeline.push(
      {
        $match: { $text: { $search: search_terms } }
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

  if (start_date || end_date) {
    const date_filter = {}
    if (start_date) {
      date_filter['$gte'] = start_date
    }

    if (end_date) {
      date_filter['$lte'] = end_date
    }

    pipeline.push(
      {
        $addFields: {
          dateStr: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          }
        }
      },
      {
        $match: {
          dateStr: date_filter
        }
      }
    )
  }

  if (source) {
    pipeline.push({ $match: source })
  }

  // if (is_quote) {
  //   pipeline.push({ $match: { 'sentences.is_quote': is_quote }})
  // }

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
    const entities_accent_insensitive = entities
      .map((entity) => (entity = createAccentInsensitiveRegex(entity.trim())))
      .join('|')
    console.log(entities_accent_insensitive)
    pipeline.push(
      { $unwind: '$sentences' },
      {
        $addFields: {
          matchingEntities: {
            $filter: {
              input: '$sentences.entities',
              as: 'entity',
              cond: {
                $regexMatch: {
                  input: { $arrayElemAt: ['$$entity', 0] },
                  regex: RegExp(entities_accent_insensitive, 'i')
                }
              }
            }
          }
        }
      },
      { $match: { 'matchingEntities.0': { $exists: true } } },
      {
        $group: {
          _id: '$_id',
          headline: { $first: '$headline' },
          date: { $first: '$date' },
          rank: { $first: '$rank' },
          url: { $first: '$url' },
          sentences: { $push: '$sentences' }
          // incluya aquí otros campos que desee conservar
        }
      },
      {
        $project: {
          _id: 0,
          headline: 1,
          date: 1,
          yearMonthDay: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$date'
            }
          },
          rank: 1,
          sentences: 1,
          url: 1
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
