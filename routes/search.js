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

  // const source = req.query.source ? { source: req.query.source } : {}
  // const search_terms = req.query.q
  // const entities = req.query.entities
  // const is_quote = req.query.is_quote === 'true'
  // const start_date = req.query.start_date
  // const end_date = req.query.end_date

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
  console.log(pipeline)
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
