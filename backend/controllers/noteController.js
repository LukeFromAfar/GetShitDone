const Note = require("../models/NoteSchema");

const noteController = {
  getAllNotes: async (req, res) => {
    try {
      const notes = await Note.find();
      res.status(200).json(notes);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error getting notes" });
    }
  },
  getNoteById: async (req, res) => {
    try {
      const note = await Note.findById(req.params.id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.status(200).json(note);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error getting note" });
    }
  },
  createNote: async (req, res) => {
    try {
      const { title, content } = req.body;
      const note = new Note({ title, content, user: req.user._id });
      await note.save();
      res.status(201).json({ message: "Note created", note });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error creating note" });
    }
  },
  updateNote: async (req, res) => {
    try {
      const { title, content } = req.body;
      const note = await Note.findByIdAndUpdate(req.params.id, { title, content });
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.status(200).json({ message: "Note updated", note });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error updating note" });
    }
  },
  deleteNote: async (req, res) => {
    try {
      const note = await Note.findByIdAndDelete(req.params.id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.status(200).json({ message: "Note deleted", note });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error deleting note" });
    }
  },
};

module.exports = noteController;