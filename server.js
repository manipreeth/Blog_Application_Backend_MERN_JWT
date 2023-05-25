require("dotenv").config(".env");
const express = require("express");
const app = express();
const MongoStore = require("connect-mongo");
const session = require("express-session");

//* Routes import
const userRoutes = require("./routes/users/users");
const postRouter = require("./routes/posts/posts");
const commentRouter = require("./routes/comments/comments");

//* Error handler
const globalErrHandler = require("./middlewares/globalHandler");

require("./config/dbConnect"); //* Database Connection

app.use(express.json()); //* pass incoming data

//* pass incoming form data
app.use(express.urlencoded({ extended: true }));

const cors = require("cors");
app.use(cors());

//* Session Config
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      mongoUrl: process.env.MONGO_URL,
      ttl: 24 * 60 * 60, //1 day
    }),
  })
);

//* middlewares
//*  ----- users route ----
app.use("/users", userRoutes);

//* --------posts route-----
app.use("/posts", postRouter);

//* -------comments Route---------
app.use("/comments", commentRouter);

//* Error Handler middlewares
app.use(globalErrHandler);

//* Listen Server
const PORT = process.env.PORT || 9000;
app.listen(PORT, console.log(`Server is Awake on port ${PORT}`));
