const result = {
  headline:
    'Así hemos contado el debate en el Congreso sobre el nuevo anuncio de Sánchez sobre la vivienda de alquiler',
  date: '2023-11-23T13:57:43.211Z',
  rank: 0,
  url: 'https://elpais.com/espana/2023-04-19/comparecencia-de-pedro-sanchez-en-el-congreso.html',
  sentences: [
    {
      text: 'Cuca Gamarra, portavoz del PP, ha criticado las últimas políticas del Ejecutivo en materia de vivienda, como el empleo de 50.000 pisos procedentes de la Sociedad de Gestión de Activos Procedentes de la Reestructuración Bancaria (Sareb, o banco malo), también para alquiler asequible, que Sánchez comprometió este domingo.',
      entities: [
        ['Cuca Gamarra', 0, 12, 'PER'],
        ['PP', 27, 29, 'ORG'],
        ['Ejecutivo', 70, 79, 'ORG'],
        ['Sociedad de Gestión de Activos Procedentes', 153, 195, 'ORG'],
        ['Reestructuración Bancaria', 202, 227, 'ORG'],
        ['Sareb', 229, 234, 'ORG'],
        ['Sánchez', 288, 295, 'PER']
      ],
      is_quote: false
    },
    {
      text: 'El Gobierno busca el contraste ideológico con el PP en cuestiones decisivas como la política de vivienda y la representante popular le ha dado la réplica acusándole de “blindar a los okupas” con la nueva ley de vivienda.',
      entities: [
        ['Gobierno', 3, 11, 'LOC'],
        ['PP', 49, 51, 'ORG']
      ],
      is_quote: true
    },
    {
      text: '“La propuesta del PP es echarles a las 24 horas”, ha incidido Gamarra, que ha insistido en el desgaste del presidente socialista.',
      entities: [
        ['PP', 18, 20, 'ORG'],
        ['Gamarra', 62, 69, 'PER']
      ],
      is_quote: true
    }
  ],
  yearMonthDay: '2023-11-23'
}

const addSpanTags = (text, start, end) => {
  const spanStart = `<span>`
  const spanEnd = `</span>`

  const modifiedText =
    text.slice(0, start) +
    spanStart +
    text.slice(start, end) +
    spanEnd +
    text.slice(end)

  return modifiedText
}

const x = result.sentences.map((sentence) => {
  const charIndexes = (sentence.entities = sentence.entities.map((entity) => {
    return { start: entity[1], end: entity[2] }
  }))

  let text = sentence.text

  charIndexes.map((charIndex) => {
    const start = charIndex.start
    const end = charIndex.end

    text = addSpanTags(text, start, end)

    return text
  })

  return text
})

console.log(x)
