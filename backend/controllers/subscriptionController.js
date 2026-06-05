import Subscription from "../models/Subscription.js";

const createSubscription = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, price, billingCycle, nextBillingDate, category, isActive } =
      req.body;

    if (!name || !price || !billingCycle || !nextBillingDate || !category) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    const newSubscription = new Subscription({
      name,
      price,
      billingCycle,
      nextBillingDate,
      category,
      isActive,
      user: userId,
    });

    await newSubscription.save();

    res.status(201).json({
      message: "Subscription created successfully",
      subscription: newSubscription,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getSubscriptions = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const subscriptions = await Subscription.find({ user: userId });
    res.status(200).json(subscriptions);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const updateSubscription = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { name, price, billingCycle, nextBillingDate, category, isActive } =
      req.body;

    const updatedSubscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { name, price, billingCycle, nextBillingDate, category, isActive },
      { new: true },
    );

    if (!updatedSubscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.status(200).json({
      message: "Subscription updated successfully",
      subscription: updatedSubscription,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteSubscription = async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const deleted = await Subscription.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.status(200).json({ message: "Subscription deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export {
  createSubscription,
  getSubscriptions,
  updateSubscription,
  deleteSubscription,
};
