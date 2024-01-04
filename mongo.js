const mongoose = require('mongoose')

if (process.env.length < 5 && process.env.length !== 3) {
    console.log('missing arguments')
    process.exit(1)
}

const password = process.argv[2]
const url = 
    `mongodb+srv://fullstack2:${password}@cluster1.letvetc.mongodb.net/phonebook?retryWrites=true&w=majority`
const name = process.argv[3]
const number = process.argv[4]

mongoose.set('strictQuery', false)
mongoose.connect(url)

// Define Schema
const personSchema = new mongoose.Schema({
    id: Number,
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

// Display all people in phonebook
if (!name || !number) {
    Person.find({}).then(result => {
        console.log('phonebook: ')
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
}
// 
else {
    const person = new Person({
        name: name,
        number: number,
    })

    person.save().then(result => {
        console.log(`added ${name} number ${number} to the phonebook`)
        mongoose.connection.close()
    })
}
