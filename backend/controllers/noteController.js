const Note = require("../models/NoteSchema");

const noteController = {
  getAllNotes: async (req, res) => {
    try {
      const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
      res.status(200).json(notes);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error getting notes" });
    }
  },
  
  getNoteById: async (req, res) => {
    try {
      const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.status(200).json(note);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error getting note" });
    }
  },
  
  getMyDayNotes: async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const notes = await Note.find({
        user: req.user._id,
        dueDate: {
          $gte: today,
          $lt: tomorrow
        }
      }).sort({ createdAt: -1 });
      
      res.status(200).json(notes);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error getting today's notes" });
    }
  },
  
  getImportantNotes: async (req, res) => {
    try {
      const notes = await Note.find({
        user: req.user._id,
        important: true
      }).sort({ createdAt: -1 });
      
      res.status(200).json(notes);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error getting important notes" });
    }
  },
  
  getPlannedNotes: async (req, res) => {
    try {
      const notes = await Note.find({
        user: req.user._id,
        dueDate: { $ne: null }
      }).sort({ dueDate: 1 });
      
      res.status(200).json(notes);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error getting planned notes" });
    }
  },

  searchNotes: async (req, res) => {
    try {
      const query = req.query.q;
      
      if (!query) {
        // Return all notes if no query is provided
        const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
        return res.status(200).json(notes);
      }
      
      // Create a regex for case-insensitive search
      const searchRegex = new RegExp(query, 'i');
      
      // Search in both title and note fields
      const notes = await Note.find({
        user: req.user._id,
        $or: [
          { title: { $regex: searchRegex } },
          { note: { $regex: searchRegex } }
        ]
      }).sort({ createdAt: -1 });
      
      console.log(`Found ${notes.length} notes matching query: "${query}"`);
      res.status(200).json(notes);
    } catch (error) {
      console.error("Error searching notes:", error);
      res.status(500).json({ message: "Error searching notes" });
    }
  },
  
  createNote: async (req, res) => {
    try {
      const { title, note, dueDate, important } = req.body;
      
      const newNote = new Note({ 
        title, 
        note: note || "", // Ensure note is empty string if not provided
        user: req.user._id,
        dueDate: dueDate || null, // Ensure dueDate is null if not provided
        important: important || false
      });
      
      await newNote.save();
      res.status(201).json({ message: "Note created", note: newNote });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error creating note" });
    }
  },
  
  updateNote: async (req, res) => {
    try {
      const { title, note, dueDate, important, completed } = req.body;
      
      const updatedNote = await Note.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { title, note, dueDate, important, completed },
        { new: true }
      );
      
      if (!updatedNote) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.status(200).json({ message: "Note updated", note: updatedNote });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error updating note" });
    }
  },
  
  deleteNote: async (req, res) => {
    try {
      const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
      
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