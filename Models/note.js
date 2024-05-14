const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const NoteSchema = new Schema(
    {
      content: {
        type: String,
        require: true,
      },
      name: {
        type: String,
      },
  
      noteId: {
        type: String,
        unique: true,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      authorId: {
        type: String,
        required: true,
      },
    },
    { timestamps: true }
  );
  module.exports=mongoose.model('Note',NoteSchema);