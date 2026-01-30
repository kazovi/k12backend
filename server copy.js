require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;



// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST","PUT","DELETE","PATCH","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));
app.use(express.json());

// MongoDB Connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch(err => console.error("MongoDB error:", err));

// Model
const CustomerDetail = require("./models/CustomerDetail");

// Route
app.post("/users", async (req, res) => {
  try {
    console.log("Received body:", req.body);

    const order = new CustomerDetail(req.body);
    const savedOrder = await order.save();
    console.log("DB",savedOrder);

    res.status(201).json({
      message: "Order saved to MongoDB",
      data: savedOrder
    });

  } catch (error) {
    console.error("Insert error:", error);
    res.status(500).json({ message: "Database insert failed" });
  }
});


app.get("/newusers", async (req, res) => {
  try {
    const orders = await CustomerDetail
      .find({ read: "0" })
      .sort({ createdAt: -1 });

  res.status(200).json(orders);
  } 
    catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
});



app.put("/updateusers", async (req, res) => {
  const { vehicle } = req.body; 
  try {
    // Find the order by vehicle and read = "0" (new order)
    const updatedOrder = await CustomerDetail.findOneAndUpdate(
      { vehicle: vehicle, read: "0" },
      { read: "1"},    
      { new: true }                   
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found or already read" });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update order",
      error: error.message,
    });
  }
});



app.get("/readusers", async (req, res) => {
  try {
    const orders = await CustomerDetail
      .find({ read: "1" })
      .sort({ createdAt: -1 });

  res.status(200).json(orders);


  } 
    catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
});




app.get("/", (req, res) => {
  // handle the route
  res.send("Hello, world!"); // example response
});



mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  })
  .catch(err => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });
