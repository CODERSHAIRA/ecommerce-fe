import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] =[];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);
  
  //storage: Storage = sessionStorage;
  storage: Storage = localStorage;

  constructor() {
    // read the data from the storage
    let data = JSON.parse(this.storage.getItem('cartItems')!);

    if(data!=null){
      this.cartItems = data;

      // compute totals based on the data that is read from storage
      this.computeCartTotals();
    }
   }

  addToCart(theCartItem: CartItem){

     // Check if we already have item in our cart
     let alreadyExistsInCart: boolean = false;
     let existingCartItem: CartItem | null = null;
     
     if(this.cartItems.length > 0){
     // find the item in the cart based on the item id
    /*
    for(let tempCartItem of this.cartItems){
      if(tempCartItem.id === theCartItem.id){
        existingCartItem = tempCartItem;
        break;
      }
    }
    */
    existingCartItem = this.cartItems.find( tempCartItem => tempCartItem.id === theCartItem.id) || null;
     // Check if we found it
     alreadyExistsInCart = (existingCartItem != null);
  }
     if(alreadyExistsInCart){
      //increament the quantity
      existingCartItem!.quantity++;
    }
     else{
      //just add the item to an array
      this.cartItems.push(theCartItem);
     }
     this.computeCartTotals();
}
  computeCartTotals() {
  
      let totalPriceValue: number =0;
      let totalQuantityValue: number=0;

      for(let currentCartItem of this.cartItems){
        totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice;
        totalQuantityValue += currentCartItem.quantity;
      }
      //publish the new values ... all suscribers will receive the new data
      this.totalPrice.next(totalPriceValue);
      this.totalQuantity.next(totalQuantityValue);
      
      //log cart data just for debugging purposes
      this.logCartData(totalPriceValue, totalQuantityValue);
      
      //persist the cart data
      this.persistCartItems();
  }

  persistCartItems(){
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    
    console.log('Contents of the cart');
    for(let tempCartItem of this.cartItems){
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(`name: ${tempCartItem.name}, quantity=${tempCartItem.quantity}, unitPrice=${tempCartItem.unitPrice}, subTotalPrice=${subTotalPrice}`);
    }
    console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, totalQuantity: ${totalQuantityValue}`);
    console.log('----');
  }

  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;

    if(theCartItem.quantity === 0){
      this.remove(theCartItem);
    }
    else{
      this.computeCartTotals();
    }
  }
  remove(theCartItem: CartItem) {
    
    //get index of the item in the array
    const itemIndex= this.cartItems.findIndex( tempCartItem => tempCartItem.id === theCartItem.id);
    
    //if found, remove the item from the array at the given index
    if(itemIndex > -1){
      this.cartItems.splice(itemIndex, 1);

      this.computeCartTotals();
    }
  }
}