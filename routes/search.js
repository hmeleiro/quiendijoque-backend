const express = require('express')
const router = express.Router()
const Article = require('../models/Article')

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

router.get('/search', async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const source = req.query.source ? { source: req.query.source } : {}
  const search_terms = req.query.q
  const is_quote = req.query.is_quote === 'true'

  const is_quote_stage = req.query.is_quote
    ? {
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
      }
    : ''

  let pipeline = [
    { $match: { $text: { $search: search_terms, $language: 'es' } } },
    { $match: source }
  ]

  const filter_search_terms = {
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
  const filter_empty_sentences = { $match: { sentences: { $ne: [] } } }
  const project_stage = {
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
      source: 1,
      sentences: 1,
      url: 1
    }
  }

  const sort_stage = {
    $sort: {
      score: { $meta: 'textScore' },
      yearMonthDay: -1,
      hour: -1,
      rank: 1,
      minute: -1
    }
  }

  if (is_quote_stage) {
    pipeline.push(is_quote_stage)
  }

  pipeline.push(
    filter_search_terms,
    filter_empty_sentences,
    project_stage,
    sort_stage
  )

  try {
    const entities = await Article.aggregate(pipeline)
      .skip((page - 1) * limit)
      .limit(limit)

    res.json(entities)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
