const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

// MongoDB connection setup
mongoose.connect("mongodb://localhost:27017/your_database", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.use(express.json());
//middleware usage for authetication
const verifyUserByEmail = async (req, res, next) => {
  const userEmail = req.headers["x-user-email"];
  if (!userEmail) {
    return res.status(401).json({ message: "User email is required" });
  }

  try {
    // Check if the user with the provided email address exists in the database
    const user = await UserModal.findOne({ email: userEmail });
    if (!user) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    // Attach the user object to the request for further processing
    req.user = user;
    next();
  } catch (error) {
    console.error("Error verifying user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
//
app.use((req, res, next) => {
  if (req.path !== "/addUser") {
    verifyUserByEmail(req, res, next);
  } else {
    next();
  }
});
const UserSchema = new mongoose.Schema(
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

const NoteSchema = new mongoose.Schema(
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

const UserModal = mongoose.model("User", UserSchema);
const NoteModal = mongoose.model("Note", NoteSchema);

app.use(express.json());

// Add users
app.post("/addUser", async (req, res) => {
  try {
    const { name, email, picture, emailVerified, userId } = req.body;
    if (!name || !email || !picture || !emailVerified || !userId) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    const newUser = await UserModal.create({
      name,
      userId,
      email,
      picture,
      emailVerified,
    });
    const userWithEmail = await UserModal.findOne({ email: email });
    console.log("Result:", newUser);
    return res
      .status(201)
      .json({ status: "User added successfully", userId: userWithEmail._id });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/user", async (req, res) => {
  const id = req.headers["x-user-id"];
  if (!id) {
    return res.json({ Message: "The request must include user id." });
  } else {
    let user = await UserModal.findById(id);

    return res.json({ status: "Success", response: user });
  }
});
const updateUserField = async (userId, fieldName, fieldValue) => {
  try {
    const result = await UserModal.updateOne(
      { _id: userId },
      { $set: { [fieldName]: fieldValue } }
    );
    return result;
  } catch (error) {
    console.error("Error in updating the field", error);
    throw error; // Propagate the error
  }
};

const updateNoteField = async (noteId, fieldName, fieldValue) => {
  try {
    const result = await NoteModal.updateOne(
      { _id: noteId },
      { $set: { [fieldName]: fieldValue } }
    );
    return result;
  } catch (error) {
    console.error(`Unable to update ${fieldName}: `, error);
    throw error;
  }
};
app.patch("/edit/name", async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (userId) {
    const name = req.body.name; // Assuming the name is sent in the request body
    if (!name) {
      return res.json({ status: "Failed", message: "Name is required" });
    }

    await updateUserField(userId, "name", name)
      .then((result) => {
        return res.json({ status: "Success", message: result });
      })
      .catch((error) => {
        return res.json({ status: "Failed", message: error });
      });
  } else {
    return res.json({ status: "Failed", message: "User ID is required" });
  }
});

//add a note
app.post("/add/note", async (req, res) => {
  let userId = req.headers["x-user-id"];
  let user = await UserModal.findById(userId);
  const { content, authorId, noteId, name, createdAt, updatedAt } = req.body;
  if (user && content && authorId && noteId) {
    let note = await NoteModal.create({
      name,
      content,
      noteId,
      authorId,
      createdAt,
      updatedAt,
    });

    return res.json({ status: "Success", message: "Note added successfully" });
  } else {
    return res.json({ status: "Failed", message: "Unable to add note" });
  }
});
//edit note content
app.patch("/edit/note/content", async (req, res) => {
  let noteId = req.headers["x-note-id"];
  let note = await NoteModal.findById(noteId);
  if (note) {
    const { fieldName, fieldValue } = req.body;
    updateNoteField(noteId, fieldName, fieldValue)
      .then((result) => {
        return res.json({
          status: "Success",
          message: "Successfully updated the note",
          result: result,
        });
      })
      .catch((error) => {
        // Changed then to catch here
        return res.json({ Status: "Failed", message: error });
      });
  } else {
    return res.json({ status: "Failed", message: "Note not found" });
  }
});
//edit note name
app.patch("/edit/note/name", async (req, res) => {
  let noteId = req.headers["x-note-id"];
  let note = await NoteModal.findById(noteId);
  if (note) {
    let { fieldName, fieldValue } = req.body;
    updateNoteField(noteId, fieldName, fieldValue)
      .then((result) => {
        return res.json({
          status: "Success",
          message: `${fieldName} edited successfully.`,
          result: result,
        });
      })
      .catch((error) => {
        return res.json({
          status: "Failed",
          message: `Unable to edite ${fieldName}`,
          error: error,
        });
      });
  } else {
    return res.json({ status: "Failed", message: "Unable to find note." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


