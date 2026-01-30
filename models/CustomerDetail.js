const mongoose = require("mongoose");

const customerDetailSchema = new mongoose.Schema({
  size: { type: String },
  quantity: { type: String },
  arrival: { type: String },
  mobile: { type: String },
  vehicle: { type: String },
  payment: { type: String },
  totalcost: { type: String },
  status: { type: String },
  read: { type: String },
  createdAt: { type: String }
});

module.exports = mongoose.model(
  "customerdetail",
  customerDetailSchema
);
