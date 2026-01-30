require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const admin = require("./firebase");


const app = express();
const PORT = process.env.PORT || 5000;




// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST","PUT","DELETE","PATCH","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));
app.use(express.json());


const CustomerDetail = require("./models/CustomerDetail");

// Route

// app.post("/users", async (req, res) => {
//   try {
//     console.log("Received body:", req.body);

//     const order = new CustomerDetail(req.body);
//     const savedOrder = await order.save();
//     console.log("DB", savedOrder);

//     // === Send FCM notification ===
//     const message = {
//       notification: {
//         title: "Order Received",
//         body: `Order from ${savedOrder.name}: ${savedOrder.order} x ${savedOrder.quantity}`,
//       },
//       token: process.env.ANDROID_FCM_TOKEN,
//     };

//     try {
//       await admin.messaging().send(message);
//       console.log("FCM notification sent!");
//     } catch (notifErr) {
//       console.error("FCM error:", notifErr);
//     }

//     // === Response ===
//     res.status(201).json({
//       message: "Order saved and notification sent",
//       data: savedOrder
//     });

//   } catch (error) {
//     console.error("Insert error:", error);
//     res.status(500).json({ message: "Database insert failed" });
//   }
// });


const axios = require("axios");

app.post("/users", async (req, res) => {
  try {
    const order = new CustomerDetail(req.body);
    const savedOrder = await order.save();

    await axios.post("https://app.nativenotify.com/api/notification", {
      appId: process.env.NATIVENOTIFY_APP_ID,
      appToken: process.env.NATIVENOTIFY_APP_TOKEN,
      title: "Order Received",
      body: `Order recieved process it`,
    });

    res.status(201).json({
      message: "Order saved & notification sent",
      data: savedOrder
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed" });
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
  const { vehicle,action } = req.body; 
  try {
    // Find the order by vehicle and read = "0" (new order)
    const updatedOrder = await CustomerDetail.findOneAndUpdate(
      { vehicle: vehicle, read: "0" },
      { read: action},    
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
      // .find({ read: "1" })
      .find({ read: { $in: ["1", "2"] } })
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
  res.send("Hello, world!"); 
});




// app.get("/getStatus", async (req, res) => {
//   const { vehicle } = req.body;

//   if (!vehicle) {
//     return res.status(400).json({ message: "Vehicle number is required" });
//   }

//   try {
//     // Get latest order for this vehicle
//     const order = await CustomerDetail.findOne({ vehicle })
//       .sort({ createdAt: -1 });

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     res.status(200).json({
//       vehicle: order.vehicle,
//       read: order.read
//     });

//   } catch (error) {
//     console.error("getStatus error:", error);
//     res.status(500).json({
//       message: "Failed to fetch status",
//       error: error.message
//     });
//   }
// });


app.post("/getStatus", async (req, res) => {
  const { vehicle } = req.body;

  if (!vehicle) {
    return res.status(400).json({ message: "Vehicle number is required" });
  }

  try {
    const order = await CustomerDetail
      .findOne({ vehicle })
      .sort({ createdAt: -1 })


    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      vehicle: order.vehicle,
      read: order.read
    });

  } catch (error) {
    console.error("getStatus error:", error);
    res.status(500).json({
      message: "Failed to fetch status",
      error: error.message
    });
  }
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
