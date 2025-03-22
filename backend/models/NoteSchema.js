const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const noteSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    default: "", // Set a default empty string instead of making it required
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  dueDate: {
    type: Date,
    default: null, // Allow null for tasks without due dates
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