require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const app = express();

connectDB();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => res.json({ message: "Welcome to the application." }));

app.use("/users", require("./routes/usersRouter"));
app.use("/posts", require("./routes/postsRouter"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}.`));
