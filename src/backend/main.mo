import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Option "mo:core/Option";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";

actor {
  type Product = {
    name : Text;
    price : Nat;
    category : Category;
    description : Text;
  };

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Nat.compare(product1.price, product2.price);
    };
  };

  type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  type Cart = {
    items : [CartItem];
  };

  type Address = {
    recipient : Text;
    street : Text;
    city : Text;
    state : Text;
    postalCode : Nat;
    country : Text;
  };

  type OrderItem = {
    productId : Nat;
    quantity : Nat;
    price : Nat;
  };

  type Order = {
    orderId : Nat;
    items : [OrderItem];
    totalAmount : Nat;
    timestamp : Int;
    shippingAddress : Address;
  };

  public type Category = {
    #jeans;
    #shirts;
    #tshirts;
  };

  let productCatalog = Map.empty<Nat, Product>();
  let userCarts = Map.empty<Principal, Cart>();
  let userOrders = Map.empty<Principal, [Order]>();

  var currentProductId = 0;
  var currentOrderId = 0;

  public query ({ caller }) func getCart() : async Cart {
    switch (userCarts.get(caller)) {
      case (?cart) { cart };
      case (null) { { items = [] } };
    };
  };

  func getCartInternal(user : Principal) : Cart {
    switch (userCarts.get(user)) {
      case (?cart) { cart };
      case (null) { { items = [] } };
    };
  };

  func isProductInCatalog(productId : Nat) : Bool {
    productCatalog.containsKey(productId);
  };

  public shared ({ caller }) func checkProductExists(productId : Nat) : async Bool {
    isProductInCatalog(productId);
  };

  public shared ({ caller }) func addProduct(product : Product) : async () {
    let productId = currentProductId;
    productCatalog.add(productId, product);
    currentProductId += 1;
  };

  public shared ({ caller }) func addItemsToCart(newItems : [CartItem]) : async () {
    if (newItems.any(func(item) { not isProductInCatalog(item.productId) })) {
      Runtime.trap("One or more products do not exist");
    };
    let currentCart = getCartInternal(caller);
    let updatedItems = currentCart.items.concat(newItems);
    userCarts.add(caller, { items = updatedItems });
  };

  func removeItem(cart : Cart, productId : Nat) : Cart {
    let filteredItems = cart.items.filter(func(item) { item.productId != productId });
    { cart with items = filteredItems };
  };

  public shared ({ caller }) func removeItemFromCart(productId : Nat) : async () {
    let cart = getCartInternal(caller);
    let updatedCart = removeItem(cart, productId);
    userCarts.add(caller, updatedCart);
  };

  public shared ({ caller }) func clearCart() : async () {
    userCarts.add(caller, { items = [] });
  };

  public shared ({ caller }) func placeOrder(shippingAddress : Address) : async {
    orderId : Nat;
    totalAmount : Nat;
  } {
    let cart = getCartInternal(caller);

    if (cart.items.size() == 0) {
      Runtime.trap("Cart is empty");
    };

    let orderId = currentOrderId;
    currentOrderId += 1;

    var totalAmount : Nat = 0;

    let orderItems = cart.items.map(func(cartItem) {
      let product = switch (productCatalog.get(cartItem.productId)) {
        case (null) { Runtime.trap("Product does not exist") };
        case (?product) { product };
      };

      let price = product.price * cartItem.quantity;
      totalAmount += price;

      {
        productId = cartItem.productId;
        quantity = cartItem.quantity;
        price;
      };
    });

    let newOrder : Order = {
      orderId;
      items = orderItems;
      totalAmount;
      timestamp = Time.now();
      shippingAddress;
    };

    let existingOrders = userOrders.get(caller).get([]);
    userOrders.add(caller, existingOrders.concat([newOrder]));
    userCarts.remove(caller);
    {
      orderId;
      totalAmount;
    };
  };

  public shared ({ caller }) func refillCatalog(newProducts : [Product]) : async () {
    productCatalog.clear();
    for (product in newProducts.values()) {
      let productId = currentProductId;
      productCatalog.add(productId, product);
      currentProductId += 1;
    };
  };

  public query func getProductsByCategory(category : Category) : async [Product] {
    productCatalog.values().toArray().sort().filter(func(product) { product.category == category });
  };
};
