const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const { listWithManyBlogs, nonExistingId, blogsInDb } = require('./test_helper')


describe('blogs in api', () => {

  beforeAll(async () => {
    await Blog.remove({})
    const blogObjects = listWithManyBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })
  
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const blogsInDatabase = await blogsInDb()

    const response = await api.get('/api/blogs')
    //console.log(response)
    expect(response.body.length).toBe(blogsInDatabase.length)

    const returnedContents = response.body.map(b => b.content)
    blogsInDatabase.forEach(blog => {
      expect(response.body).toContain(blog)
    })
  })
  
  test('a specific blog is within the returned notes', async () => {
    const response = await api.get('/api/blogs')
    const returnedContents = response.body.map(b => b.content)

    console.log(response.body)
    expect(response.body).toContain({
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12
    })
  })

  test('a valid blog can be added ', async () => {
    const blogsInDatabaseBefore = await blogsInDb()

    const newBlog = {
      title: 'title',
      author: 'author',
      url: 'url',
      likes: 3
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsInDatabaseAfter = await blogsInDb()
    expect(blogsInDatabaseAfter.length).toBe(blogsInDatabaseBefore.length + 1)
    expect(blogsInDatabaseAfter).toContainEqual(newBlog)

  })


  test('a valid blog without likes can be added ', async () => {
    const blogsInDatabaseBefore = await blogsInDb()

    const newBlog = {
      title: 'new title',
      author: 'new author',
      url: 'new url'
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsInDatabaseAfter = await blogsInDb()
    expect(blogsInDatabaseAfter.length).toBe(blogsInDatabaseBefore.length + 1)

    const contents = blogsInDatabaseAfter.map(r => r.content)
    expect(contents).toContainEqual({
      title: 'new title',
      author: 'new author',
      url: 'new url',
      likes: 0
    })

  })


  afterAll(() => {
    server.close()
  })

})
