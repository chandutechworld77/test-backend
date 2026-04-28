require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

let items = [
  { id: 1, name: "Item 1", status: "active" },
  { id: 2, name: "Item 2", status: "inactive" }
];

app.get("/api/items", (req, res) => {
  res.status(200).json({
    message: "Items fetched successfully",
    data: items
  });
});

app.post("/api/items", (req, res) => {
  const { name, status = "active" } = req.body;

  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }

  const newItem = {
    id: items.length ? items[items.length - 1].id + 1 : 1,
    name,
    status
  };

  items.push(newItem);

  return res.status(201).json({
    message: "Item created successfully",
    data: newItem
  });
});

app.put("/api/items/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name, status } = req.body;
  const itemIndex = items.findIndex((item) => item.id === id);

  if (itemIndex === -1) {
    return res.status(404).json({ message: "Item not found" });
  }

  if (!name || !status) {
    return res
      .status(400)
      .json({ message: "name and status are required for PUT" });
  }

  const updatedItem = { id, name, status };
  items[itemIndex] = updatedItem;

  return res.status(200).json({
    message: "Item replaced successfully",
    data: updatedItem
  });
});

app.patch("/api/items/:id", (req, res) => {
  const id = Number(req.params.id);
  const item = items.find((entry) => entry.id === id);

  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  const { name, status } = req.body;

  if (name !== undefined) {
    item.name = name;
  }

  if (status !== undefined) {
    item.status = status;
  }

  return res.status(200).json({
    message: "Item updated successfully",
    data: item
  });
});

app.delete("/api/items/:id", (req, res) => {
  const id = Number(req.params.id);
  const itemExists = items.some((item) => item.id === id);

  if (!itemExists) {
    return res.status(404).json({ message: "Item not found" });
  }

  items = items.filter((item) => item.id !== id);

  return res.status(200).json({
    message: "Item deleted successfully"
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
