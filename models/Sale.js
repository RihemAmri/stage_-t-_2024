mongoose = require("mongoose");
const Sale = mongoose.model("Sale ", {
  id_produit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  quantity: {
    type: Number,
  },
});
module.exports = Sale;
