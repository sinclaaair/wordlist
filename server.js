const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const wordRoutes = express.Router()
const PORT = process.env.PORT || 4000

const Word = require('./word.model')
require('dotenv').config()

app.use(cors())
app.use(bodyParser.json())

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/words', { useNewUrlParser: true })
const connection = mongoose.connection
connection.once('open', function() {
    console.log("MongoDB database connection established successfully")
})

// find by regex
wordRoutes.route('/find/:regex').get(({params: {regex}}, res) => {
    Word.find({"_id": {$regex: new RegExp(`^${regex}$`, 'i')}}, '_id', (err, words) => {
        if (err) res.status(400).send(err)
        else res.status(200).json({words: words.map(word => word._id)})
    })
})

// get a word's clues
wordRoutes.route('/:id').get(({params: {id}}, res) => {
    Word.findById(id, (err, word) => {
        if (!word) {
            res.status(400).send('Word not found')
        } else {
            res.status(200).json({clues: word.clues})
        }
    })
})

// add word and/or add clues to word
wordRoutes.route('/:id').post(({params: {id}, body: {clues}}, res) => {
    Word.findById(id, (err, word) => {
        if (!word) {
            const word = new Word({_id: id, clues: clues});
            word.save()
                .then(word => {
                    res.status(200).send('Word added!')
                })
                .catch(err => {
                    res.status(400).send('Adding word failed')
                })
        } else {
            if (clues) {
                word.clues = word.clues.concat(clues)
                word.save().then(word => {
                    res.json('Clues updated!')
                })
                .catch(err => {
                    res.status(400).send('Updating clues failed')
                })
            } else 
                res.status(400).send('No clues in request')
        }
    })
})

// delete clue from word
wordRoutes.route('/:id/:index').delete(({params: {id, index}}, res) => {
    Word.findById(id, (err, word) => {
        if (!word) res.status(400).send('Word not found')
        else {
            if (!word.clues || !word.clues[index]) res.status(400).send('Clue not found')
            else {
                word.clues = word.clues.slice(0, index).concat(word.clues.slice(index + 1))
                word.save().then(word => {
                    res.json('Clue deleted!')
                })
                .catch(err => {
                    res.status(400).send('Deleting clue failed')
                })
            }
        }
    })
})

// delete word
wordRoutes.route('/:id').delete(({params: {id}}, res) => {
    Word.findByIdAndRemove(id, (err, word) => {
        if (!word) res.status(400).send('Word not found')
        else {
            res.status(200).send('Word deleted!')
        }
    })
})

// get all words, why not
wordRoutes.route('/').get(function(req, res) {
    Word.find(function(err, words) {
        if (err) {
            console.log(err);
        } else {
            res.json(words);
        }
    })
})


app.use('/words', wordRoutes)
app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT)
})