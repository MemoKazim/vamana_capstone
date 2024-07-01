const dotenv = require("dotenv");
const app = require("./app");
const PORT = process.env.APPLICATION_PORT || 5353;
const mongoose = require("mongoose");
const DB = process.env.MONGODB_CLOUD;
// const DB = process.env.MONGODB_LOCAL;

dotenv.config("./.env");

mongoose.set("strictQuery", true);
mongoose
  .connect(DB, {
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB successfully connected!");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(PORT, () => {
  console.log(`Server is open at ${PORT}`);
});
