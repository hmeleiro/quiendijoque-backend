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
  console.log(params)
  const pipeline = generate_pipeline(params)
  try {
    const results = await Article.aggregate(pipeline)
      .skip((page - 1) * limit)
      .limit(limit)

    res.json(results)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
