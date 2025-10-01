import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req) {
    try {
        const cookieStore = cookies();
        const token = await cookieStore.get('token');

        if (!token) {
            return NextResponse.json({ items: [] });
        }

        const decoded = verifyToken(token.value);
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ items: [] });
        }

        await connectDB();
        
        const cart = await Cart.findOne({ user: decoded.userId })
            .populate({
                path: 'items.product',
                select: 'name price image category'
            });

        return NextResponse.json({ items: cart?.items || [] });
    } catch (error) {
        console.error('Cart fetch error:', error);
        return NextResponse.json({ items: [] });
    }
}

export async function POST(req) {
    try {
        const cookieStore = cookies();
        const token = await cookieStore.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' }, 
                { status: 401 }
            );
        }

        const decoded = verifyToken(token.value);
        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { error: 'Invalid token' }, 
                { status: 401 }
            );
        }

        const { product } = await req.json();
        if (!product) {
            return NextResponse.json(
                { error: 'Product data is required' }, 
                { status: 400 }
            );
        }

        await connectDB();

        let cart = await Cart.findOne({ user: decoded.userId });
        
        if (!cart) {
            cart = new Cart({
                user: decoded.userId,
                items: [{
                    product: product.id.toString(),
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: 1
                }]
            });
        } else {
            const existingItemIndex = cart.items.findIndex(
                item => item.product === product.id.toString()
            );

            if (existingItemIndex > -1) {
                cart.items[existingItemIndex].quantity += 1;
            } else {
                cart.items.push({
                    product: product.id.toString(),
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: 1
                });
            }
        }

        await cart.save();

        return NextResponse.json({ 
            items: cart.items,
            message: 'Cart updated successfully' 
        });
    } catch (error) {
        console.error('Cart update error:', error);
        return NextResponse.json(
            { error: 'Failed to update cart' }, 
            { status: 500 }
        );
    }
}