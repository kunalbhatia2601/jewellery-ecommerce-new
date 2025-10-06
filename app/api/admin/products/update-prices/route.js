import { NextResponse } from 'next/server';
import { adminAuth } from '@/middleware/adminAuth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { calculateJewelryPrice } from '@/lib/goldPrice';

export async function POST(request) {
  try {
    // Verify admin authentication
    const authError = await adminAuth(request);
    if (authError) {
      return authError;
    }

    await connectDB();

    const body = await request.json();
    const { productIds, currency = 'INR' } = body;

    let productsToUpdate;

    if (productIds && productIds.length > 0) {
      // Update specific products
      productsToUpdate = await Product.find({
        _id: { $in: productIds },
        isDynamicPricing: true,
        goldWeight: { $gt: 0 }
      });
    } else {
      // Update all products with dynamic pricing enabled
      productsToUpdate = await Product.find({
        isDynamicPricing: true,
        goldWeight: { $gt: 0 }
      });
    }

    if (productsToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No products found with dynamic pricing enabled',
        updated: 0
      });
    }

    const updateResults = [];
    const errors = [];

    for (const product of productsToUpdate) {
      try {
        const calculation = await calculateJewelryPrice({
          goldWeight: product.goldWeight,
          goldPurity: product.goldPurity,
          makingChargePercent: product.makingChargePercent,
          gstPercent: 3, // Default GST
          currency
        });

        if (calculation.success) {
          const newPrice = calculation.breakdown.finalPrice;
          const oldPrice = product.sellingPrice;

          // Update product prices
          await Product.findByIdAndUpdate(product._id, {
            price: newPrice,
            sellingPrice: newPrice,
            mrp: newPrice * 1.1, // 10% margin for MRP
            lastPriceUpdate: new Date(),
            $push: {
              priceHistory: {
                date: new Date(),
                goldPrice: calculation.goldPriceData.perGram.gold,
                calculatedPrice: newPrice,
                finalPrice: newPrice
              }
            }
          });

          updateResults.push({
            productId: product._id,
            name: product.name,
            oldPrice,
            newPrice,
            change: newPrice - oldPrice,
            changePercent: ((newPrice - oldPrice) / oldPrice * 100).toFixed(2)
          });
        } else {
          errors.push({
            productId: product._id,
            name: product.name,
            error: calculation.error
          });
        }
      } catch (error) {
        errors.push({
          productId: product._id,
          name: product.name,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updateResults.length} products`,
      updated: updateResults.length,
      errors: errors.length,
      results: updateResults,
      errorDetails: errors
    });

  } catch (error) {
    console.error('Bulk price update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Verify admin authentication
    const authError = await adminAuth(request);
    if (authError) {
      return authError;
    }

    await connectDB();

    // Get products with dynamic pricing enabled
    const dynamicProducts = await Product.find({
      isDynamicPricing: true
    }).select('name sku goldWeight goldPurity makingChargePercent lastPriceUpdate sellingPrice');

    return NextResponse.json({
      success: true,
      products: dynamicProducts,
      count: dynamicProducts.length
    });

  } catch (error) {
    console.error('Get dynamic products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}