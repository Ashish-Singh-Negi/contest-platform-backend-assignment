import express from "express";
import Routes from "./routes/index";

export const app = express();

// middleware
app.use(express.json());

app.use("/api", Routes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`server is listening at http://localhost:${PORT}`);
});
