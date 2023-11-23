const express = require('express')
const router = express.Router()
const Article = require('../models/Article')

router.get('/getEntities', async (req, res) => {
  pipeline = [
    { $unwind: '$sentences' },
    { $unwind: '$sentences.entities' },
    {
      $project: {
        entities: '$sentences.entities'
      }
    },
    {
      $addFields: {
        entities: {
          $arrayElemAt: ['$entities', 0]
        }
      }
    },
    {
      $group: {
        _id: '$entities',
        entity: {
          $first: '$entities'
        }
      }
    },
    {
      $project: {
        _id: 0
      }
    }
  ]
  try {
    const entities = await Article.aggregate(pipeline)
    res.json(entities.map((entity) => entity.entity))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
