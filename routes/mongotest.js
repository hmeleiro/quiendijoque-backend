const express = require('express')
const router = express.Router()
const Article = require('../models/Article')

router.get('/test', async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const source = req.query.source ? { source: req.query.source } : {}
  try {
    const articles = await Article.find(source)
      //   .sort({ date: -1, rank: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
    console.log(articles)
    res.json(articles)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
