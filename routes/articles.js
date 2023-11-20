const express = require('express')
const router = express.Router()
const Article = require('../models/Article')

router.get('/articles', async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const source = req.query.source ? { source: req.query.source } : {}
  try {
    const articles = await Article.aggregate([
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
      console.log(articles)
    res.json(articles)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
