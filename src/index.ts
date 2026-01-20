import express from "express";

export const app = express();

app.use(express.json());

// routes

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`server is listening at http://localhost:${PORT}`);
});
