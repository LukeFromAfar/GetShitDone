const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const noteSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    default: null,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, 
  important: {
    type: Boolean,
    default: false,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Note = model("Note", noteSchema);

module.exports = Note;