import express from "express";
import cors from "cors";
import citiesRouter from "./routes/cities.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use("/api/cities", citiesRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Weather API server running on http://localhost:${PORT}`);
});
