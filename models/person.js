const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URL

// Yhdistää sovelluksen tietokantaan
console.log('Connecting to MongoDB:', url)
mongoose.connect(url)
	.then(() => {
		console.log('Connected to MongoDB')
	})
	.catch(error => {
		console.log('Error connecting to MongoDB:', error.message)
	})

// Luodaan person skeema ja määritetään validointi
const personSchema = new mongoose.Schema({
	name: {
		type: String,
		minlength: 3,
		required: true
	},
	number: {
		type: String,
		minlength: 8,
		maxlength: 12,
		validate: {
			validator: function(v) {
				return /^\d{2,3}-\d{4,9}$/.test(v)
			},
			message: props => `${props.value} is not a valid phone number!`
		},
		required: true
	}
})

// eslint-disable-next-line no-unused-vars
const Person = mongoose.model('Person', personSchema)

// Muutokset Person-skeemaan
personSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	}
})

module.exports = mongoose.model('Person', personSchema)