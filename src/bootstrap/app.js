const express = require('express')
const bodyParser = require('body-parser')

const app = express()

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

/**
 * USSD Endpoint
 */
app.post('/ussd', (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body

  let response = ''
  const inputs = text ? text.split('*') : []

  console.log({
    sessionId,
    serviceCode,
    phoneNumber,
    text,
    inputs,
  })

  /**
   * MENU PRINCIPAL
   */
  if (inputs.length === 0) {
    response = `CON Bienvenue au service USSD
1. Consulter le solde
2. Support
3. Quiz`
  }

  /**
   * OPTION 1 : SOLDE
   */
  else if (inputs[0] === '1') {
    response = `END Votre solde est de 5 USD`
  }

  /**
   * OPTION 2 : SUPPORT
   */
  else if (inputs[0] === '2') {
    response = `END Contactez le support au 100`
  }

  /**
   * OPTION 3 : QUIZ
   */
  else if (inputs[0] === '3') {
    if (inputs.length === 1) {
      response = `CON Quiz
1. Commencer
2. Quitter`
    } 
    else if (inputs[1] === '1') {
      response = `CON Question 1
Quelle est la capitale de la RDC ?
1. Kinshasa
2. Lubumbashi`
    }
    else if (inputs[1] === '2') {
      response = `END Merci et à bientôt`
    }
    else if (inputs.length === 3) {
      if (inputs[2] === '1') {
        response = `END Bonne réponse 🎉`
      } else {
        response = `END Mauvaise réponse ❌`
      }
    }
    else {
      response = `END Choix invalide`
    }
  }

  /**
   * CHOIX INVALIDE
   */
  else {
    response = `END Choix invalide`
  }

  res
    .set('Content-Type', 'text/plain')
    .send(response)
})

module.exports = app
