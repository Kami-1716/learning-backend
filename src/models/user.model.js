import mongoose, {Schema} from "mongoose";
import jwt  from "jsonwebtoken";
import bcrypt from 'bcrypt'

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
      unique: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      lowercase: true,
      index: true
    },
    avatar: {
      type: String, // cloudinary image url
      required: true,
    },
    coverImage: {
      type: String, // cloudinary image url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Video'
      }
    ],
    password: {
      type: String,
      required: [true, 'Please enter your password'],
      trim: true,
      minlength: 6,
    },
    refreshToken: {
      type: String,
    },
  },
  {
      timestamps: true,
  }
)

userSchema.pre('save',  async function(next) {
  if(!this.isModified('password')) return next()

  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.createAccessToken = function ( ) {
  return  jwt.sign({
    _id: this._id,
    email: this.email,
    username: this.username,
    fullName: this.fullName,
  }, 
  process.env.ACCESS_TOKEN_SECRET,
  {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
  })
}

userSchema.methods.createRefreshToken = function ( ) {
  return  jwt.sign({
    _id: this._id
  }, 
  process.env.REFRESH_TOKEN_SECRET,
  {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
  })

}

export const User = mongoose.model('User', userSchema)