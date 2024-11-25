mongoose = require("mongoose");
const Product = mongoose.model("Product ", {
  name: {
    type: String,
  },
  prix: {
    type: Number,
  },
});
module.exports = Product;
