const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')

app.use(express.json())
app.use(bodyParser.json())

// Apply cors middleware first
const cors = require('cors')
app.use(cors())

app.use(express.static('dist'))

// Define a custom token for JSON.stringify of the response body
morgan.token('response-json', (req, res) => {
    return JSON.stringify(req.body)
})

const format = ':method :url :status :res[content-length] - :response-time ms :response-json'
app.use(morgan(format))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

// READ REQUESTS
app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/info', (req, res) => {
    res.send(
        `<p> Phonebook has info for 2 people <br/> ${new Date()}</p>`
    )
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

// DELETE REQUEST
app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)

    res.status(204).end()
})

// CREATE REQUEST
const generateId = () => {
    return Math.floor(Math.random() * 10000)
}

app.post('/api/persons', (req, res) => {
    const body = req.body

    // Error handling
    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'name or number missing'
        })
    }

    if (persons.find(person => person['name'] === body.name)) {
        return res.status(400).json({
            error: 'name must be unique'
        })
    }

    const newPerson = {
        "id": generateId(),
        "name": body['name'],
        "number": body['number'],
    }

    persons = persons.concat(newPerson)

    res.json(newPerson)

})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})