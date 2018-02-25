const blogsRouter = require('express').Router()

const Blog = require('../models/blog')
const User = require('../models/user')

const jwt = require('jsonwebtoken')


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', {username: 1 , name: 1 })
  response.json(blogs.map(Blog.format)) 
})

blogsRouter.post('/', async (request, response) => {
  try {
    const body = request.body

    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    if (body.likes === undefined) {
      body.likes = 0 
    }

    const userThatCreated = await User.findById(decodedToken.id)
    
    const blog = new Blog(body)
    blog.user = userThatCreated.id

    const savedBlog = await blog.save()

    userThatCreated.blogs = userThatCreated.blogs.concat(savedBlog.id)
    await userThatCreated.save()

    response.status(201).json(blog)

  } catch (exception) {
    console.log(exception)
    if (exception.name === 'JsonWebTokenError' ) {
      response.status(401).json({ error: exception.message })
    } else {
      response.status(500).json({ error: 'something went wrong...' })
    }
  }
})


blogsRouter.put('/:id', async (req, res) => {
  try {
    const blog = req.body

    const updateBlog = {
      likes: blog.likes
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updateBlog, { new: true } )
    res.json(Blog.format(updatedBlog))
  } catch(error) {
    console.log(error)
    res.status(400).send({ error: 'malformatted id' })
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const blogToBeRemoved = await Blog.findById(request.params.id)

    if (blogToBeRemoved.user.toString() !== decodedToken.id) {
      return response.status(401).json({ error:  'not allowed'  })
    }

    blogToBeRemoved.remove()

    response.status(204).end()

  } catch (exception) {
    console.log(exception)
    if (exception.name === 'JsonWebTokenError' ) {
      response.status(401).json({ error: exception.message })
    } else {
      response.status(500).json({ error: exception.message })
    }
  }
})

module.exports = blogsRouter
