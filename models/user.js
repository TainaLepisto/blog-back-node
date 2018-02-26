const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  username: String,
  name: String,
  passwordHash: String,
  adult: Boolean,
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }]
})

UserSchema.statics.format = (user) => {
  return {
    id: user._id,
    username: user.username,
    //passwordHash: user.passwordHash, 
    name: user.name,
    adult: user.adult,
    blogs: user.blogs
  }
}

const User = mongoose.model('User', UserSchema)

module.exports = User
