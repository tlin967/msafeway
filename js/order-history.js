document.querySelectorAll(".add-to-cart-order").forEach(ele=>{
    ele.addEventListener("click", addToCart)
})

function addToCart(event){
    console.log(event)
    console.log(event.target.dataset["productId"])
    var cartJSON = localStorage.getItem("cart")
    console.log(`cartJSON is ${cartJSON}`)
    var productID = event.target.dataset["productId"]
    var cartOrderJSON = localStorage.getItem("cartOrder")
    var cartOrder = []
    if( cartOrderJSON){
        cartOrder = JSON.parse(cartOrderJSON)
    }
        

    // if cart exists
    if (cartJSON){
        var cart = JSON.parse(cartJSON)
        console.log(cart)
        var quantity = 1
        // if product already in cart, increase quantity
        if (productID in cart){
            console.log("product is in cart already")
            ++cart[productID]
        }
        // else create product entry in cart
        else{
            cart[productID] = 1
            cartOrder.push(productID)
        }

    }
    else{
        console.log("cart is empty")
        var cart = {}
        cart[productID] = 1
        cartOrder.push(productID)
    }
    localStorage.setItem("cart", JSON.stringify(cart) )
    localStorage.setItem("cartOrder", JSON.stringify(cartOrder) )
    console.log(`cart modified, is  ${JSON.stringify(cart)}`)
    console.log(`cart order modified, is  ${JSON.stringify(cartOrder)}`)
}