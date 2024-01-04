const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const Person = require('./models/person')

// Middleware definitions

// Define a custom token for JSON.stringify of the response body
morgan.token('response-json', (request, response) => {
  return JSON.stringify(request.body)
})
const format = ':method :url :status :res[content-length] - :response-time ms :response-json'

// handler of requests with unknown endpoint
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// Error-handling middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// Middleware Applications
app.use(cors())
app.use(express.json())
app.use(morgan(format))
app.use(express.static('dist'))

// Get all people
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

// Create a person
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  // Error handling
  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name or number missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

// Find a person
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

// Delete a person
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// Update a person
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findOneAndUpdate(
    { name },
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.get('/info', (req, res) => {
  res.send(
    `<p> Phonebook has info for 2 people <br/> ${new Date()}</p>`
  )
})

app.use(unknownEndpoint)
app.use(errorHandler)

// Handle unknown endpoints
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})