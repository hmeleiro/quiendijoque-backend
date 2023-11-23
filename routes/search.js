const express = require('express')
const router = express.Router()
const Article = require('../models/Article')
const generate_pipeline = require('../functions/pipeline')

router.post('/search', async (req, res) => {
  let {
    search_terms,
    is_quote,
    source,
    entities,
    start_date,
    end_date,
    page,
    limit
  } = req.body

  page = parseInt(page) || 1
  limit = parseInt(limit) || 10

  source = source ? { source: req.query.source } : {}
  const params = {
    search_terms,
    is_quote,
    source,
    entities,
    start_date,
    end_date
  }
  // console.log(params)
  const pipeline = generate_pipeline(params)
  // Pipeline for count
  const countPipeline = [...pipeline, { $count: 'count' }]
  try {
    let results = await Article.aggregate(pipeline)
      .skip((page - 1) * limit)
      .limit(limit)

    // Get the count
    let countResult = await Article.aggregate(countPipeline)
    let totalCount = 0
    if (countResult.length > 0) {
      totalCount = countResult[0].count
    }
    res.json({ results, totalCount })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
