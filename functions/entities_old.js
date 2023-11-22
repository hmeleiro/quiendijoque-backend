if (entities) {
  pipeline.push(
    { $unwind: '$sentences' },
    { $unwind: '$sentences.entities' },
    {
      $match: {
        'sentences.entities.0': RegExp(entities.replace(',', '|'), 'i')
      }
    },
    {
      $group: {
        _id: { docId: '$_id', sentId: '$sentences.text' }, // Grouping based on the 'text' attribute
        headline: { $first: '$headline' },
        date: { $first: '$date' },
        rank: { $first: '$rank' },
        url: { $first: '$url' },
        entities: { $addToSet: '$sentences.entities' } // Pushing 'entities' for each unique 'text'
      }
    },
    {
      $project: {
        _id: 0,
        headline: 1,
        url: 1,
        date: 1,
        rank: 1,
        text: '$_id.sentId',
        entities: 1,
        yearMonthDay: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$date'
          }
        }
      }
    },
    {
      $group: {
        _id: '$headline',
        date: { $first: '$date' },
        rank: { $first: '$rank' },
        yearMonthDay: { $first: '$yearMonthDay' },
        sentences: {
          $push: { text: '$text', entities: '$entities' }
        },
        url: { $first: '$url' }
      }
    },
    {
      $project: {
        _id: 0,
        headline: '$_id',
        url: 1,
        rank: 1,
        sentences: 1,
        date: 1,
        yearMonthDay: 1
      }
    }
  )
}
