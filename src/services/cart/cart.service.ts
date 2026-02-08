import { AddToCartDto, UpdateCartItemDto } from "../../dtos/cart.dtos";
import { HttpError } from "../../errors/http-error";
import { ICart } from "../../models/cart.model";
import { IUser } from "../../models/user.model";
import { CartRepository } from "../../repositories/cart.repositories";
import { ProductRepository } from "../../repositories/product.repositories";
import { CartResponse } from "../../types/cart.type";

const cartRepository = new CartRepository();
const productRepository = new ProductRepository();

export class CartService {
    private calculateCartTotal(cart: ICart): number {
        return cart.items.reduce((total, item) => {
            return total + item.price * item.quantity;

        }, 0);
    }

    private calculateItemCount(cart: ICart): number {
        return cart.items.reduce((count, item) => count + item.quantity, 0);
    }

    private formatCartResponse(cart: ICart): CartResponse {
        return {
            _id: cart._id.toString(),
            userId: cart.userId?.toString(),
            items: cart.items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
            })),
            total: this.calculateCartTotal(cart),
            itemCount: this.calculateItemCount(cart),
            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt,


        };
    }

    async addToCart(
        user: IUser,
        cartData: AddToCartDto
    ): Promise<CartResponse> {
        const {productId, quantity} = cartData;

        const product = await productRepository.getProductById(productId);

        if(!product) {
            throw new HttpError(404, "Product not found")
        }

        // check if the prodcut has enough stack
        if(product.stock < 1) {
            throw new HttpError(404, "Product out of stock");
        }

        // get existing cart to check current quatity
        const existingCart = await cartRepository.getCartByUserId(user._id.toString());

        let currentQuantityInCart = 0;

        if(existingCart){
            const existingItem = existingCart.items.find(
                (item) => item.productId.toString() === productId)
            
              
        }

        // caclulate the new total quanity
        const newTotalQuantity = currentQuantityInCart + quantity;

        // check if new total excceds stock
        if(newTotalQuantity > product.stock) {
            const availableToAdd = product.stock - currentQuantityInCart;

            if(availableToAdd <= 0) {
                throw new HttpError(400, `You already have the maximum available (${product.stock}) in your cart`); 
            }

            throw new HttpError(400, `Cannot add ${quantity} items. Only ${availableToAdd} more available (${product.stock} total in stock, ${currentQuantityInCart} already in cart)`);

        }

        // add to cart with current price(price snapshot)
        const cart = await cartRepository.addItemToCart(
            user._id .toString(),
            productId,
            quantity,
            product.price,


        );

        return this.formatCartResponse(cart);
    }

    async getCart(user: IUser): Promise<CartResponse> {
        let cart = await cartRepository.getCartByUserId(user._id.toString());

        if(!cart) {
            cart = await cartRepository.createCart(user._id.toString());
        }

        return this.formatCartResponse(cart);
    }

    async updateCartItem(
        user: IUser,
        productId: string,
        updateData: UpdateCartItemDto
    ) : Promise<CartResponse> {
        const {quantity} = updateData;

        if(quantity > 0) {
            const product = await productRepository.getProductById(productId);

            if(!product) {
                throw new HttpError(404, "Product not found" );
            }

            if(product.stock < quantity) {
                throw new HttpError(400, `Cannot set quantity to ${quantity}. Only ${product.stock} items available in stock`);

            }
        }

        const cart = await cartRepository.updateItemQuantity(
            user._id.toString(),
            productId,
            quantity,
        );

        if(!cart) {
            throw new HttpError(404, "Cart or item not found");
        }

        return this.formatCartResponse(cart);
    }

    async removeFromCart(user: IUser, productId: string): Promise<CartResponse> {
        const cart = await cartRepository.removeItemFromCart(
            user._id.toString(),
            productId
        );

        if(!cart) {
            throw new HttpError(404, "Cart or item not found");
        }

        return this.formatCartResponse(cart);
    }

    async clearCart(user: IUser): Promise<CartResponse> {
        const cart = await cartRepository.clearCart(user._id.toString());

        if(!cart) {
            throw new HttpError(404, "Cart not found")

        }
        return this.formatCartResponse(cart);
    }


}
