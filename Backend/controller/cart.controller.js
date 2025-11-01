import Cart from "../model/cartModel.js";
import Product from "../model/productModel.js";
import { asyncHandler } from "../utils/async-handler.js";
import  { ApiError } from "../utils/api_Error.js";
import { ApiResponse } from "../utils/api_Response.js";
const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = new Cart({
            userId,
            items: []
        });
    }

    const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
    );

    if (existingItem) {
        existingItem.quantity += quantity || 1;
    } else {
        cart.items.push({ productId, quantity });
    }

    await cart.save();
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                cart,
                "Successfull Added"
            )
        )
});

const getCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const userCart = await Cart.findOne({ userId }).populate("items.productId", "name price image1");

    if (!userCart) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        items: []
                    },
                    "Cart is Empty"
                )
            );
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                userCart, 
                "Fetched cart successfully"
            ));
});

const updateCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
        throw new ApiError(400, "Product Id and quantity are required");
    }

    if (quantity < 1) {
        throw new ApiError(400, "Quantity must be at least 1");
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const existingItem = cart.items.find((item) => {
        return item.productId.toString() === productId
    });

    if (!existingItem) {
        throw new ApiError(404, "Product not found in cart");
    }

    existingItem.quantity = quantity;
    await cart.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                cart,
                "Cart item updated successfully"
            )
        );
});

const removeitem = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
        throw new ApiError(400, "Cart not found");
    }

    cart.items = cart.items.filter((item) => {
        return item.productId.toString() !== productId
    });

    await cart.save();
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                cart,
                "Product removed from cart successsfull"
            )
        );
});

const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    cart.items = [];
    await cart.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                cart,
                "Cart cleared successfully"
            )
        );
});

export {
    addToCart,
    getCart,
    updateCart,
    removeitem,
    clearCart
}