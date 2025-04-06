const stripe = require("stripe")(require("../config").stripeSecretKey);
const GuideBooking = require("../models/GuideBooking");
const VehicleBooking = require("../models/VehicleBooking");
const Transaction = require("../models/Transaction");
const Guide = require("../models/Guide");
const Vehicle = require("../models/Vehicle");
const mongoose = require("mongoose");

/**
 * Create a payment intent for a booking
 * @param {string} bookingId - Booking ID
 * @param {string} bookingType - Type of booking ('guide' or 'vehicle')
 * @param {string} userId - User ID making the payment
 * @returns {Promise<Object>} - Payment intent
 */
exports.createPaymentIntent = async (bookingId, bookingType, userId) => {
  try {
    let booking;
    let amount;
    let description;
    let serviceProvider;

    // Get booking details based on type
    if (bookingType === "guide") {
      booking = await GuideBooking.findById(bookingId);

      if (!booking) {
        throw new Error("Guide booking not found");
      }

      if (booking.tourist.toString() !== userId) {
        throw new Error(
          "Unauthorized: This booking does not belong to the current user"
        );
      }

      // Get guide details for description
      const guide = await Guide.findById(booking.guide).populate(
        "user",
        "username"
      );

      // Calculate total amount (in cents for Stripe)
      amount = Math.round(booking.amount * 100);
      description = `Guide booking with ${guide.user.username}`;
      serviceProvider = guide.user.username;
    } else if (bookingType === "vehicle") {
      booking = await VehicleBooking.findById(bookingId);

      if (!booking) {
        throw new Error("Vehicle booking not found");
      }

      if (booking.tourist.toString() !== userId) {
        throw new Error(
          "Unauthorized: This booking does not belong to the current user"
        );
      }

      // Get vehicle details for description
      const vehicle = await Vehicle.findById(booking.vehicle).populate(
        "owner",
        "business_name"
      );

      // Calculate total amount (in cents for Stripe)
      amount = Math.round(booking.amount * 100);
      description = `Vehicle booking: ${vehicle.model} from ${vehicle.owner.business_name}`;
      serviceProvider = vehicle.owner.business_name;
    } else {
      throw new Error("Invalid booking type");
    }

    // Check if payment already exists
    const existingTransaction = await Transaction.findOne({
      booking_id: bookingId,
      booking_type: bookingType,
    });

    if (existingTransaction && existingTransaction.status === "completed") {
      throw new Error("Payment has already been completed for this booking");
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      description,
      metadata: {
        booking_id: bookingId,
        booking_type: bookingType,
        user_id: userId,
        service_provider: serviceProvider,
      },
    });

    // Record transaction
    const transaction = new Transaction({
      user: userId,
      booking_id: bookingId,
      booking_type: bookingType,
      payment_intent_id: paymentIntent.id,
      amount: amount / 100, // Store in dollars
      currency: "usd",
      status: "pending",
      description,
    });

    await transaction.save();

    return {
      clientSecret: paymentIntent.client_secret,
      amount: amount / 100,
      transaction_id: transaction._id,
    };
  } catch (error) {
    console.error("Payment intent creation error:", error.message);
    throw error;
  }
};

/**
 * Confirm payment success
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<Object>} - Updated transaction
 */
exports.confirmPayment = async (paymentIntentId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the transaction
    const transaction = await Transaction.findOne({
      payment_intent_id: paymentIntentId,
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Update transaction status
    transaction.status = "completed";
    transaction.completed_at = new Date();
    await transaction.save({ session });

    // Update booking status based on booking type
    if (transaction.booking_type === "guide") {
      await GuideBooking.findByIdAndUpdate(
        transaction.booking_id,
        {
          payment_status: "paid",
          status: "confirmed",
        },
        { session }
      );
    } else if (transaction.booking_type === "vehicle") {
      await VehicleBooking.findByIdAndUpdate(
        transaction.booking_id,
        {
          payment_status: "paid",
          status: "confirmed",
        },
        { session }
      );
    }

    await session.commitTransaction();

    return transaction;
  } catch (error) {
    await session.abortTransaction();
    console.error("Payment confirmation error:", error.message);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Handle payment failure
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<Object>} - Updated transaction
 */
exports.handlePaymentFailure = async (paymentIntentId) => {
  try {
    // Find the transaction
    const transaction = await Transaction.findOne({
      payment_intent_id: paymentIntentId,
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Update transaction status
    transaction.status = "failed";
    await transaction.save();

    return transaction;
  } catch (error) {
    console.error("Payment failure handling error:", error.message);
    throw error;
  }
};

/**
 * Process refund for a booking
 * @param {string} transactionId - Transaction ID
 * @param {string} userId - User ID requesting the refund
 * @param {string} reason - Reason for refund
 * @returns {Promise<Object>} - Refund result
 */
exports.processRefund = async (transactionId, userId, reason) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the transaction
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.status !== "completed") {
      throw new Error("Can only refund completed transactions");
    }

    if (transaction.refunded) {
      throw new Error("Transaction has already been refunded");
    }

    // Check if user is authorized (either the customer or admin would be allowed)
    if (transaction.user.toString() !== userId) {
      throw new Error(
        "Unauthorized: You do not have permission to refund this transaction"
      );
    }

    // Process refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: transaction.payment_intent_id,
      reason: "requested_by_customer",
    });

    // Update transaction
    transaction.refunded = true;
    transaction.refund_id = refund.id;
    transaction.refund_reason = reason;
    transaction.refunded_at = new Date();
    await transaction.save({ session });

    // Update booking status
    if (transaction.booking_type === "guide") {
      await GuideBooking.findByIdAndUpdate(
        transaction.booking_id,
        {
          payment_status: "refunded",
          status: "cancelled",
        },
        { session }
      );
    } else if (transaction.booking_type === "vehicle") {
      await VehicleBooking.findByIdAndUpdate(
        transaction.booking_id,
        {
          payment_status: "refunded",
          status: "cancelled",
        },
        { session }
      );
    }

    await session.commitTransaction();

    return {
      success: true,
      transaction,
      refund,
    };
  } catch (error) {
    await session.abortTransaction();
    console.error("Refund processing error:", error.message);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get transaction history for a user
 * @param {string} userId - User ID
 * @param {number} page - Page number
 * @param {number} limit - Number of transactions per page
 * @returns {Promise<Object>} - Transactions with pagination
 */
exports.getTransactionHistory = async (userId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ user: userId })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const totalTransactions = await Transaction.countDocuments({
      user: userId,
    });

    return {
      transactions,
      total: totalTransactions,
      page,
      totalPages: Math.ceil(totalTransactions / limit),
    };
  } catch (error) {
    console.error("Transaction history error:", error.message);
    throw error;
  }
};
