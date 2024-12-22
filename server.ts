import express from "express";
import path from "path";

const app = express();
app.use(express.static("dist"));

// Serve index.html for all routes (for SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
