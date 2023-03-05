require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())
app.use(express.static('build'))

// Hakee kaikki kontaktit tietokannasta
app.get('/api/persons', (req, res) => {
	Person.find({}).then(persons => {
		res.json(persons)
	})
})

// Hakee tiedot infosivulta
app.get('/info', (req, res) => {
	const date = new Date()
	Person.countDocuments({}, function (err, count) {
		if (err) {
			console.log(err)
			res.send('Error occured')
		}
		else {
			res.send(`<p>Phonebook has info for ${count} people</p>` + date)
		}
	})
})

// Hakee kontaktin id:llä
app.get('/api/persons/:id', (req, res, next) => {
	Person.findById(req.params.id)
		.then(person => {
			if (person) {
				res.json(person)
			}
			else {
				res.status(404).send({ error: 'HTTP ERROR 404' })
			}
		})
		.catch(error => next(error))
})

// Poistaa kontaktin
app.delete('/api/persons/:id', (req, res, next) => {
	Person.findByIdAndRemove(req.params.id)
		.then(() => {
			res.status(204).end()
		})
		.catch(error => next(error))
})

// Lisää uuden kontaktin
app.post('/api/persons', (req, res, next) => {
	const body = req.body

	// Luodaan uusi kontakti annetuista tiedoista
	const person = new Person ({
		name: body.name,
		number: body.number,
	})

	// Lisätään kontakti listaan ja palautetaan lisätty kontakti
	person.save()
		.then(savedPerson => {
			res.json(savedPerson)
		})
		.catch(error => next(error))
})

// Päivittää olemassaolevan kontaktin
app.put('/api/persons/:id', (req, res, next) => {
	const body = req.body

	const person = {
		name: body.name,
		number: body.number
	}

	Person.findByIdAndUpdate(
		req.params.id,
		person,
		{ new: true, runValidators: true, context: 'query' }
	)

		.then(updatedPerson => {
			res.json(updatedPerson)
		})
		.catch(error => next(error))
})

// Käsittelee 404-virheet
const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: 'Unknown endpoint' })
}

app.use(unknownEndpoint)

// Virheidenkäsittelijä
const errorHandler = (error, req, res, next) => {
	console.log(error.name)
	console.log(error.message)
	if (error.name === 'CastError') {
		return res.status(400).send( { error: 'malformatted id' } )
	}
	else if (error.name === 'ValidationError') {
		return res.status(400).json({ error: error.message })
	}
	next(error)
}

app.use(errorHandler)

// Sovelluksen käyttämä portti
const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})
