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

  pageNumber = parseInt(page) || 1
  pageSize = parseInt(limit) || 10

  source = source ? { source: req.query.source } : {}
  const params = {
    search_terms,
    is_quote,
    source,
    entities,
    start_date,
    end_date,
    pageNumber,
    pageSize
  }
  // console.log(params)
  const pipeline = generate_pipeline(params)
  // Pipeline for count
  try {
    const [result] = await Article.aggregate(pipeline)
    res.json({
      results: result.results,
      totalCount: result.totalCount[0].count
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
