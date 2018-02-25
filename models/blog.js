const mongoose = require('mongoose')

const BlogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

BlogSchema.statics.format = function(blog) {
  return {
    id: blog._id,
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes
  }
}

const Blog = mongoose.model('Blog', BlogSchema)

module.exports = Blog




