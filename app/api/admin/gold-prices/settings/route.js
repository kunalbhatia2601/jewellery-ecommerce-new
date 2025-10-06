import { NextResponse } from 'next/server';

// Default pricing settings for the jewelry business
const DEFAULT_SETTINGS = {
  goldPurity: 22, // 22K gold default
  makingChargePercent: 15, // 15% making charges
  gstPercent: 3, // 3% GST on gold
  minimumMakingCharge: 500, // Minimum making charge in INR
  priceBufferPercent: 2, // 2% buffer for price fluctuations
  autoUpdateInterval: 5, // Update prices every 5 minutes
  currency: 'INR',
  priceRounding: 'nearest10' // Round to nearest 10
};

export async function GET(request) {
  try {
    // In a real implementation, you would fetch these from a database
    // For now, returning default settings
    return NextResponse.json({
      success: true,
      data: DEFAULT_SETTINGS,
      message: 'Pricing settings retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching pricing settings:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate the settings
    const validatedSettings = validateSettings(body);
    
    if (!validatedSettings.valid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid settings provided',
        details: validatedSettings.errors
      }, { status: 400 });
    }

    // In a real implementation, you would save these to a database
    // For now, just return success with the validated settings
    return NextResponse.json({
      success: true,
      data: validatedSettings.settings,
      message: 'Pricing settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating pricing settings:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

function validateSettings(settings) {
  const errors = [];
  const validatedSettings = { ...DEFAULT_SETTINGS };

  // Validate gold purity (10K to 24K)
  if (settings.goldPurity !== undefined) {
    const purity = Number(settings.goldPurity);
    if (isNaN(purity) || purity < 10 || purity > 24) {
      errors.push('Gold purity must be between 10K and 24K');
    } else {
      validatedSettings.goldPurity = purity;
    }
  }

  // Validate making charge percent (5% to 50%)
  if (settings.makingChargePercent !== undefined) {
    const charge = Number(settings.makingChargePercent);
    if (isNaN(charge) || charge < 5 || charge > 50) {
      errors.push('Making charge must be between 5% and 50%');
    } else {
      validatedSettings.makingChargePercent = charge;
    }
  }

  // Validate GST percent (0% to 18%)
  if (settings.gstPercent !== undefined) {
    const gst = Number(settings.gstPercent);
    if (isNaN(gst) || gst < 0 || gst > 18) {
      errors.push('GST must be between 0% and 18%');
    } else {
      validatedSettings.gstPercent = gst;
    }
  }

  // Validate minimum making charge
  if (settings.minimumMakingCharge !== undefined) {
    const minCharge = Number(settings.minimumMakingCharge);
    if (isNaN(minCharge) || minCharge < 0) {
      errors.push('Minimum making charge must be a positive number');
    } else {
      validatedSettings.minimumMakingCharge = minCharge;
    }
  }

  // Validate price buffer percent (0% to 10%)
  if (settings.priceBufferPercent !== undefined) {
    const buffer = Number(settings.priceBufferPercent);
    if (isNaN(buffer) || buffer < 0 || buffer > 10) {
      errors.push('Price buffer must be between 0% and 10%');
    } else {
      validatedSettings.priceBufferPercent = buffer;
    }
  }

  // Validate auto update interval (1 to 60 minutes)
  if (settings.autoUpdateInterval !== undefined) {
    const interval = Number(settings.autoUpdateInterval);
    if (isNaN(interval) || interval < 1 || interval > 60) {
      errors.push('Auto update interval must be between 1 and 60 minutes');
    } else {
      validatedSettings.autoUpdateInterval = interval;
    }
  }

  // Validate currency
  if (settings.currency !== undefined) {
    const validCurrencies = ['INR', 'USD', 'EUR', 'GBP'];
    if (!validCurrencies.includes(settings.currency)) {
      errors.push(`Currency must be one of: ${validCurrencies.join(', ')}`);
    } else {
      validatedSettings.currency = settings.currency;
    }
  }

  // Validate price rounding
  if (settings.priceRounding !== undefined) {
    const validRounding = ['none', 'nearest10', 'nearest50', 'nearest100'];
    if (!validRounding.includes(settings.priceRounding)) {
      errors.push(`Price rounding must be one of: ${validRounding.join(', ')}`);
    } else {
      validatedSettings.priceRounding = settings.priceRounding;
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors,
    settings: validatedSettings
  };
}