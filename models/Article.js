const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
  rank: Number,
  headline: String,
  source: String,
  date: Date,
  yearMonthDay: Date,
  sentences: Array,
  url: String
})

const Article = mongoose.model('Article', articleSchema)

module.exports = Article
