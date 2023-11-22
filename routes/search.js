const express = require('express')
const router = express.Router()
const Article = require('../models/Article')
const generate_pipeline = require('../functions/pipeline')

router.get('/search', async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const source = req.query.source ? { source: req.query.source } : {}
  // console.log(req.query)
  const search_terms = req.query.q
  const entities = req.query.entities
  const is_quote = req.query.is_quote === 'true'
  const start_date = req.query.start_date
  const end_date = req.query.end_date

  const pipeline = generate_pipeline({
    search_terms,
    is_quote,
    source,
    entities,
    start_date,
    end_date
  })

  // console.log(pipeline)

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
