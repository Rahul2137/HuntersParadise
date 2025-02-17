const CategoryInfo = require("../../models/CategoryInfo");
const CompletedDeal = require("../../models/CompletedDeal");
const LiveDeals = require("../../models/LiveDeals");
const DealOffers = require("../../models/dealOffers");
const completedDeal = (req, res) => {
  console.log("offerId", req.body.offerId);
  DealOffers.findOne({ _id: req.body.offerId })
    .populate("deal")
    .then(async (offer) => {
      console.log("offer", offer);
      const newCompletedDeal = new CompletedDeal({
        productName: offer.deal.productName,
        productImage: offer.deal.productImage,
        category: offer.deal.category,
        dealDescription: offer.deal.dealDescription,
        price: offer.offeredPrice,
        seller: req.user.userId,
        sellerName: offer.sellerName,
        buyer: offer.offered_by,
        buyerName: offer.offered_by_name,
        status: "Completed",
      });
      await newCompletedDeal.save().then(async (newdeal) => {
        await CategoryInfo.findOneAndUpdate(
          { category: offer.deal.category },
          {
            $inc: {
              numberDeals: 1,
              valuation: parseInt(offer.offeredPrice),
              numberLiveDeals: -1,
            },
          }
        );
        await DealOffers.deleteMany({ deal: offer.deal }).catch((err) => {
          if (err) {
            console.error("Error deleting offers:", err);
            return;
          }
        });
        await LiveDeals.deleteOne({ _id: offer.deal }).catch((err) => {
          if (err) {
            console.error("Error deleting offers:", err);
            return;
          }
        });
      });
      res.status(200).send("Offer updated Successfully");
      return;
    })
    .catch((err) => {
      console.log("Error while Completing the Deal", err);
      res.status(501).send("Failed to Complete the Deal");
    });
};
module.exports = completedDeal;
