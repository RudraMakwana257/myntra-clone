const express = require("express");
const Transaction = require("../models/Transaction");
const Order = require("../models/Order");
const router = express.Router();
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Get all transactions for a user with filtering and sorting
 * Query params:
 * - type: Filter by type (Online, COD, Refund)
 * - status: Filter by status (Completed, Pending, Failed, Refunded)
 * - startDate: Filter transactions from this date (ISO string)
 * - endDate: Filter transactions until this date (ISO string)
 * - sortBy: Sort field (date, amount) - default: date
 * - sortOrder: Sort order (asc, desc) - default: desc
 * - page: Page number for pagination
 * - limit: Items per page
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      type,
      status,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    // Build query
    const query = { userId };

    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Build sort object
    const sort = {};
    const sortField = sortBy === "date" ? "createdAt" : sortBy;
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get transactions with pagination
    const transactions = await Transaction.find(query)
      .populate("orderId")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * Get a single transaction by ID
 */
router.get("/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findById(transactionId).populate(
      "orderId"
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * Create a transaction (typically called when an order is placed)
 * This can also be called manually for refunds or other transactions
 */
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      orderId,
      type,
      amount,
      status = "Pending",
      paymentMethod,
      paymentDetails,
      description,
    } = req.body;

    // Generate unique transaction ID
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Generate receipt number for completed transactions
    let receiptNumber = null;
    if (status === "Completed") {
      receiptNumber = `RCP${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }

    const transaction = new Transaction({
      userId,
      orderId,
      transactionId,
      type,
      amount,
      status,
      paymentMethod,
      paymentDetails: paymentDetails || {},
      description: description || "",
      receiptNumber,
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * Update transaction status (e.g., mark as completed, refunded, etc.)
 */
router.patch("/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;
    const updates = req.body;

    // Generate receipt number if status is being changed to Completed
    if (updates.status === "Completed") {
      const existingTransaction = await Transaction.findById(transactionId);
      if (!existingTransaction.receiptNumber) {
        updates.receiptNumber = `RCP${Date.now()}${Math.floor(
          Math.random() * 1000
        )}`;
      }
    }

    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      updates,
      { new: true }
    ).populate("orderId");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * Export transactions as CSV
 */
router.get("/user/:userId/export/csv", async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, status, startDate, endDate } = req.query;

    // Build query (same as list endpoint)
    const query = { userId };
    if (type) query.type = type;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate("orderId")
      .sort({ createdAt: -1 });

    // Generate CSV
    const csvHeader =
      "Transaction ID,Date,Type,Amount,Status,Payment Method,Description,Receipt Number\n";
    const csvRows = transactions.map((txn) => {
      const date = new Date(txn.createdAt).toLocaleString();
      const amount = txn.amount.toFixed(2);
      const description = (txn.description || "").replace(/,/g, ";");
      return `${txn.transactionId},${date},${txn.type},${amount},${txn.status},${txn.paymentMethod},${description},${txn.receiptNumber || "N/A"}`;
    });

    const csv = csvHeader + csvRows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=transactions_${userId}_${Date.now()}.csv`
    );
    res.send(csv);
  } catch (error) {
    console.error("Error exporting CSV:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * Export transactions as PDF
 */
router.get("/user/:userId/export/pdf", async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, status, startDate, endDate } = req.query;

    // Build query
    const query = { userId };
    if (type) query.type = type;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate("orderId")
      .sort({ createdAt: -1 });

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    const filename = `transactions_${userId}_${Date.now()}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${filename}`
    );

    doc.pipe(res);

    // PDF Header
    doc.fontSize(20).text("Transaction History", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: "center" });
    doc.moveDown(2);

    // Transaction details
    transactions.forEach((txn, index) => {
      if (index > 0) {
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
      }

      doc.fontSize(14).text(`Transaction ${index + 1}`, { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(10);
      doc.text(`Transaction ID: ${txn.transactionId}`);
      doc.text(`Date: ${new Date(txn.createdAt).toLocaleString()}`);
      doc.text(`Type: ${txn.type}`);
      doc.text(`Amount: ₹${txn.amount.toFixed(2)}`);
      doc.text(`Status: ${txn.status}`);
      doc.text(`Payment Method: ${txn.paymentMethod}`);
      if (txn.receiptNumber) {
        doc.text(`Receipt Number: ${txn.receiptNumber}`);
      }
      if (txn.description) {
        doc.text(`Description: ${txn.description}`);
      }

      // Add page break if needed
      if (doc.y > 700) {
        doc.addPage();
      }
    });

    // Summary
    doc.addPage();
    doc.fontSize(16).text("Summary", { underline: true });
    doc.moveDown();

    const totalAmount = transactions.reduce(
      (sum, txn) => sum + (txn.status === "Completed" ? txn.amount : 0),
      0
    );
    const completedCount = transactions.filter(
      (txn) => txn.status === "Completed"
    ).length;
    const pendingCount = transactions.filter(
      (txn) => txn.status === "Pending"
    ).length;

    doc.fontSize(12);
    doc.text(`Total Transactions: ${transactions.length}`);
    doc.text(`Completed: ${completedCount}`);
    doc.text(`Pending: ${pendingCount}`);
    doc.text(`Total Amount: ₹${totalAmount.toFixed(2)}`);

    doc.end();
  } catch (error) {
    console.error("Error exporting PDF:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

/**
 * Download receipt for a specific transaction
 */
router.get("/:transactionId/receipt", async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findById(transactionId).populate([
      "orderId",
      "userId",
    ]);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.status !== "Completed") {
      return res
        .status(400)
        .json({ message: "Receipt only available for completed transactions" });
    }

    // Create PDF receipt
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt_${transaction.receiptNumber}.pdf`
    );

    doc.pipe(res);

    // Receipt Header
    doc.fontSize(24).text("Payment Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text("Myntra Clone", { align: "center" });
    doc.moveDown(2);

    // Receipt Number
    doc.fontSize(14).text(`Receipt Number: ${transaction.receiptNumber}`, {
      align: "center",
    });
    doc.moveDown();

    // Transaction Details
    doc.fontSize(12);
    doc.text(`Transaction ID: ${transaction.transactionId}`);
    doc.text(`Date: ${new Date(transaction.createdAt).toLocaleString()}`);
    doc.text(`Payment Method: ${transaction.paymentMethod}`);
    doc.text(`Type: ${transaction.type}`);
    doc.moveDown();

    // Amount (highlighted)
    doc.fontSize(18).text(`Amount: ₹${transaction.amount.toFixed(2)}`, {
      underline: true,
    });
    doc.moveDown(2);

    // Order details if available
    if (transaction.orderId) {
      doc.fontSize(14).text("Order Details", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      doc.text(`Order ID: ${transaction.orderId._id}`);
      if (transaction.orderId.shippingAddress) {
        doc.text(`Shipping Address: ${transaction.orderId.shippingAddress}`);
      }
    }

    // Footer
    doc.moveDown(3);
    doc.fontSize(10).text("Thank you for your purchase!", {
      align: "center",
    });

    doc.end();
  } catch (error) {
    console.error("Error generating receipt:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;

