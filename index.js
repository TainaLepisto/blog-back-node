//const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const blogsRouter = require('./controlles/blogs')


if ( process.env.NODE_ENV !== 'production' ) {
  require('dotenv').config()
}

mongoose
  .connect(process.env.MONGODB)
  .then( () => {
    console.log('we have database connection')
  })
  .catch( error => {
    console.log(error)
  })

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use('/api/blogs', blogsRouter)


const PORT= process.env.PORT || 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
