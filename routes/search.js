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
  try {
    const entities = await Article.aggregate([
      {
        // $match: { 'sentences.text': { $regex: search_terms, $options: 'i' } }
        $match: { $text: { $search: search_terms, $language: 'es' } }
      },
      {
        $match: source
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
      },
      {
        $match: { sentences: { $ne: [] } }
      },
      {
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
      },
      {
        $sort: {
          yearMonthDay: -1,
          hour: -1,
          rank: 1,
          minute: -1
        }
      },
      { $sort: { score: { $meta: 'textScore' }, date: -1 } }
    ])
      .skip((page - 1) * limit)
      .limit(limit)

    res.json(entities)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
