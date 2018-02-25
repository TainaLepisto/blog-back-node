const Blog=require('../models/blog')


const dummy = (blogs) => {
  console.log(blogs)
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    return sum + blog.likes
  }
  return blogs.length === 0 ? 0 : blogs.reduce(reducer, 0)
}

const favouriteLikes = (blogs) => {
  if (blogs.length === 0){
    return null 
  }
  let favorite = blogs[0]
  blogs.forEach(function(blog) {
    if(favorite.likes < blog.likes){
      favorite = blog
    }
  })
  return Blog.format(favorite)
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0){
    return null 
  }
  
  let howManyBlogs = 
  blogs
    .map((blog) => {
      return {count: 1, author: blog.author}
    })
    .reduce((a, b) => {
      a[b.author] = (a[b.author] || 0) + b.count
      return a
    }, {})

  let sorted = Object.keys(howManyBlogs).sort((a, b) => howManyBlogs[a] < howManyBlogs[b])

  return {
    author: sorted[0], 
    blogs: howManyBlogs[sorted[0]]
  }

}

const mostLikes = (blogs) => {
  if (blogs.length === 0){
    return null 
  }
  
  let howManyLikes = 
  blogs
    .reduce((a, b) => {
      a[b.author] = (a[b.author] || 0) + b.likes
      return a
    }, {})

  //console.log(howManyLikes)

  let sorted = Object.keys(howManyLikes).sort((a, b) => howManyLikes[a] < howManyLikes[b])

  return {
    author: sorted[0], 
    likes: howManyLikes[sorted[0]]
  }

}


module.exports = {
  dummy,
  totalLikes,
  favouriteLikes,
  mostBlogs,
  mostLikes
}