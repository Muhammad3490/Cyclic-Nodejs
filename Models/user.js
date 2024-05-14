const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const UserSchema = new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      userId: {
        type: String,
        unique: true,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      emailVerified: {
        type: Boolean,
      },
      picture: {
        type: String,
      },
    },
    { timestamps: true }
  );
  module.exports=mongoose.model('User',UserSchema);