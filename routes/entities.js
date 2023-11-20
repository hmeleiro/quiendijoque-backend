const express = require('express')
const router = express.Router()
const Article = require('../models/Article')

router.get('/entities', async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const source = req.query.source ? { source: req.query.source } : {}
  const search_entity = req.query.search_entity
  try {
    const entities = await Article.aggregate([
      { $unwind: '$sentences' },
      { $unwind: '$sentences.entities' },
      { $match: { 'sentences.entities.0': search_entity } },
      {
        $match: source
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
      }
    ])
      .skip((page - 1) * limit)
      .limit(limit)
    res.json(entities)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
