const app = require("./src/app");
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Backend starts with port ${PORT}`);
});

// SIGINT = Ctrl + C
process.on("SIGINT", () => {
  server.close(() => {
    console.log("Exit Server Express");
  });
});
