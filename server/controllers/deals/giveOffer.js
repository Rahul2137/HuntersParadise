const LiveDeals = require('../../models/LiveDeals');
const DealOffers = require('../../models/dealOffers');
const User = require('../../models/User');
const giveOffer = async (req, res) => {
    const userId = req.user.userId;
    const newOffer = new DealOffers({
        deal: req.body.deal,
        sellerName: req.body.sellerName,
        offered_by: userId,
        offered_by_name: req.user.username,
        offeredPrice: req.body.offeredPrice,
        askedPrice: req.body.askedPrice
    });
    const deal = req.body.deal;
    await newOffer.save()
    .then((offerCreated) => {
        LiveDeals.findOneAndUpdate(
            { _id: deal },
            { $push: { offers: { offer: offerCreated._id } } },
            { new: true}
        ).then(async (dealUpdated) => {
            console.log(dealUpdated.topOffer);
            if(!dealUpdated.topOffer || dealUpdated.topOffer.offeredPrice < req.body.offeredPrice){
                dealUpdated.topOffer = {
                    offeredPrice: req.body.offeredPrice,
                    offer: offerCreated._id
                };
                return await dealUpdated.save();
            }
            return dealUpdated;
        }).catch((err) => {
            console.log(err);
            DealOffers.findOneAndDelete({ _id: offerCreated._id});
            res.status(500).send("Internal Server Error Retry");
            return;
        });
        User.findOneAndUpdate(
            { _id: req.user.userId },
            { $push: { offers: { offerid: offerCreated._id } } }
        ).then((userUpdated) => {
            res.status(200).send({userOffer: req.body.offeredPrice});
            return;
        }).catch((err) => {
            console.log(err);
            DealOffers.findOneAndDelete({ _id: offerCreated._id});
            LiveDeals.findOneAndUpdate(
                { _id: dealId },
                { $pull: { offers: { offer: offerCreated._id } } },
            );
            res.status(500).send("Internal Server Error Retry");
            return;
        });
    }).catch((err) => {
        console.log(err);
        res.status(500).send("Internal Server Error Retry");
    });
    
}
module.exports = giveOffer;
