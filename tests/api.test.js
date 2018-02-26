const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { listWithManyBlogs, nonExistingId, blogsInDb, usersInDb, filterBlogInfo } = require('./test_helper')
const bcrypt = require('bcrypt')



describe('users in api', async () => {

  beforeAll(async () => {
    await User.remove({})
    const user = new User({ username: 'root', passwordHash: 'sekret' })
    await user.save()
  })

  test('POST /api/users succeeds with a fresh username', async () => {
    const usersBeforeOperation = await usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length+1)
    const usernames = usersAfterOperation.map(u=>u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('POST /api/users fails with proper statuscode and message if username already taken', async () => {
    const usersBeforeOperation = await usersInDb()
  
    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen'
    }
  
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  
    expect(result.body).toEqual({ error: 'username must be unique'})
  
    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
  })

  test('POST /api/users fails with proper statuscode and message if password too short', async () => {
    const usersBeforeOperation = await usersInDb()
  
    const newUser = {
      username: 'newuser',
      name: 'toos hort password',
      password: 'a'
    }
  
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  
    expect(result.body).toEqual({ error: 'password too short'})
  
    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
  })


})




describe('blogs in api', () => {

  const blogWriter = {
    username: 'blogWriter',
    password: 'salainen'
  }

  const addUser = async () => {
    try {
      const response = await api
        .post('/api/users')
        .send(blogWriter)
    //console.log(response)
    } catch (error) {
      console.log(error)
    }
  }


  const getToken = async () => {
    const response = await api
      .post('/api/login')
      .send(blogWriter)
    return response.body
  }

  beforeAll(async () => {
    await Blog.remove({})
    await addUser()
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
    expect(response.body.length).toBe(blogsInDatabase.length)
    const returnedContents = response.body.map(filterBlogInfo)
    blogsInDatabase.forEach(blog => {
      expect(returnedContents).toContainEqual(filterBlogInfo(blog))
    })
  })
  
  test('a specific blog is within the returned notes', async () => {
    const response = await api.get('/api/blogs')
    const returnedContents = response.body.map(filterBlogInfo)
    expect(returnedContents).toContainEqual(filterBlogInfo(listWithManyBlogs[0]))
  })

  test('a valid blog can be added ', async () => {
    const blogsInDatabaseBefore = await blogsInDb()
    const tokenInfo = await getToken()
    //console.log(tokenInfo)
    const newBlog = {
      title: 'title',
      author: 'author',
      url: 'url',
      likes: 3
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', 'bearer ' + tokenInfo.token)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const blogsInDatabaseAfter = await blogsInDb()
    expect(blogsInDatabaseAfter.length).toBe(blogsInDatabaseBefore.length + 1)
    expect(blogsInDatabaseAfter.map(filterBlogInfo)).toContainEqual(filterBlogInfo(newBlog))
  })


  test('a valid blog without likes can be added ', async () => {
    const blogsInDatabaseBefore = await blogsInDb()
    const tokenInfo = await getToken()
    const newBlog = {
      title: 'new title',
      author: 'new author',
      url: 'new url'
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('authorization', 'bearer ' + tokenInfo.token)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const blogsInDatabaseAfter = await blogsInDb()
    expect(blogsInDatabaseAfter.length).toBe(blogsInDatabaseBefore.length + 1)
    const contents = blogsInDatabaseAfter.map(filterBlogInfo)
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
