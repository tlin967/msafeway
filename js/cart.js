var maxQuantity = 20

document.querySelectorAll("tr button.decrementQuantity").forEach(ele =>{
    ele.addEventListener("click",function(evt){
        changeQuantity(evt,-1)
    })
})
document.querySelectorAll("tr button.incrementQuantity").forEach(ele =>{
    ele.addEventListener("click", function(evt){
        changeQuantity(evt,1)   
    })
})

document.querySelectorAll("tr input[name=quantity]").forEach(ele =>{
    ele.addEventListener("change", function(evt){
        var oldQuantity = evt.target.dataset["prevValue"]
        console.log(evt.target.dataset["prevValue"])

        var newQuantity = evt.currentTarget.value
        console.log(newQuantity)
        var change = newQuantity - oldQuantity

        changeQuantity(evt, change)
    })
})


document.querySelector("button.discountButton").addEventListener("click",applyDiscount)

document.querySelectorAll("button.removeItemFromCart").forEach(ele=>{
    ele.addEventListener("click", removeItemFromCart)
})


function changeQuantity(event, change){
    

    var td = event.target.parentElement
    var tr = td.parentElement 
    var productID = tr.dataset["productId"]
    var inputField = td.querySelector("input")
    var currentValue = parseInt(inputField.value)
    var prevValue = parseInt(inputField.dataset["prevValue"])
    console.log(productID)
    console.log(`change is ${change}`)
    

    if ( (currentValue == 0) && (change == -1) ){
        console.log("decrement max")
        return
    }
    else if ( ( currentValue >= maxQuantity ) && (change == 1) ){
        console.log("increment maxed")
        // do not allow add item since max reached
        return
    }
    if( currentValue > maxQuantity){
        console.log("over")
        change = maxQuantity - prevValue
    }
    else if (currentValue < 0){
        console.log("under")
        change = -prevValue
    }

    
        // change quantity for this item
        inputField.value = prevValue + parseInt(change)
        inputField.dataset["prevValue"] = inputField.value

        // update local storage
        var cartOrderJSON = localStorage.getItem("cartOrder")
        // console.log(`cartOrder is ${cartOrderJSON}`)
        var cartOrder = []
        if( cartOrderJSON){
            cartOrder = JSON.parse(cartOrderJSON)
        }

        
        var cartJSON = localStorage.getItem("cart")
        // console.log(`cartJSON is ${cartJSON}`)
        // if cart exists
        if (cartJSON){
            var cart = JSON.parse(cartJSON)
            // console.log(cart)
            // if product already in cart, increase quantity
            if (productID in cart){
                // console.log("product is in cart already")
                cart[productID] = inputField.value

                if (cart[productID] == 0){
                    // remove from local storage
                    delete cart[productID]
                    cartOrder = cartOrder.filter( item => item != productID)
                }
            }
            // else create product entry in cart
            else{
                cart[productID] = inputField.value
                cartOrder.push(productID)
            }

        }
        else{
            console.log("cart is empty")
            var cart = {}
            cart[productID] = inputField.value
            cartOrder.push(productID)
        }
        localStorage.setItem("cart", JSON.stringify(cart) )
        localStorage.setItem("cartOrder", JSON.stringify(cartOrder) )
        // console.log(`cart modified, is  ${JSON.stringify(cart)}`)
        // console.log(`cart order modified, is  ${JSON.stringify(cartOrder)}`)



        // update item total price
        var itemTotalPrice = tr.querySelector("td.itemTotalPrice")
        var itemPrice = parseFloat(tr.querySelector("td.cartPrice").innerHTML)
        itemTotalPrice.innerHTML = (inputField.value * itemPrice).toFixed(2)

        // update order total price
        var orderTotalPriceDiv = document.querySelector("div.orderTotalPrice")
        console.log(orderTotalPriceDiv)

        var orderTotalPrice = 0
        document.querySelectorAll("tr.lineItem").forEach(ele=>{
            var quantity = ele.querySelector("td input[name=quantity]").value
            var price = ele.querySelector("td.cartPrice").dataset["price"]

            // console.log(`quantity is ${quantity}`)
            // console.log(`price is ${price}`)
            orderTotalPrice += quantity* price
            // console.log(orderTotalPrice)
        })
        orderTotalPriceDiv.querySelector("span#totalPrice").innerHTML = orderTotalPrice.toFixed(2)
    
    
    

}

// script.

function applyDiscount() {
    var myForm = document.querySelector("div.promo form")
    console.log(myForm)
    if (myForm.promocode.value == "")								 
		{ 
			window.alert("Missing a promocode."); 
			myForm.promocode.focus(); 
			return false; 
		}

        
        var formData = new FormData(myForm)

		axios({
		  method: 'post',
		  url: '/promo',
		  data: formData,
		  config: { headers: { 'Content-Type': 'multipart/form-data' } } //singlepart?
		})
		.then( (server_response)=>{
		  console.log(server_response)
		  console.log(server_response.data)

          var discounter = server_response.data
          var total = parseFloat(document.getElementById("totalPrice").innerHTML)
          console.log(total)

          var discountLineHTML = document.getElementById("discounts")
            var couponAppliedHTML = document.getElementById("couponApplied")
            var finalPriceHTML = document.getElementById("finalPrice")
          var deduction = total * (discounter/100)


            if(server_response.statusCode == 400){
                discountLineHTML.innerHTML = ""
            
            couponAppliedHTML.innerHTML = "This coupon is invalid"
            finalPriceHTML.innerHTML = total
            }
            else{
                discountLineHTML.innerHTML = "- " + deduction.toFixed(2);
            
            couponAppliedHTML.innerHTML = "A " + discounter + "% Discount Of " + deduction.toFixed(2) + " Was Applied";
            finalPriceHTML.innerHTML = (total-deduction).toFixed(2)
            }
            
            console.log(`promoCode is ${myForm.promocode.value}`)
            localStorage.setItem("promoCode", myForm.promocode.value)

            
		}, rejectResult=>{
        //     console.log("reject")
            console.log(rejectResult.response)
        //     console.log(JSON.stringify(rejectResult))
            
          var discountLineHTML = document.getElementById("discounts")
          var couponAppliedHTML = document.getElementById("couponApplied")
          var finalPriceHTML = document.getElementById("finalPrice")


          if(rejectResult.response.status == 400){
              discountLineHTML.innerHTML = ""
          
          couponAppliedHTML.innerHTML = "This coupon is invalid"
          finalPriceHTML.innerHTML = total
          }
        })
}

function removeItemFromCart(event){
    console.log(`removing ${event.target}`)
    var td = event.target.parentElement
    var tr = td.parentElement
    var productID = tr.dataset["productId"]

    var table = tr.parentElement

    table.removeChild(tr)
    // update local storage
    var cartOrderJSON = localStorage.getItem("cartOrder")
    // console.log(`cartOrder is ${cartOrderJSON}`)
    var cartOrder = []
    if( cartOrderJSON){
        cartOrder = JSON.parse(cartOrderJSON)
        var index = cartOrder.indexOf(productID)
        console.log(`cart order index to remove ${index}`)
        cartOrder.splice(index,1)
        console.log(`cartOrder is now ${cartOrder}`)
    }

    
    var cartJSON = localStorage.getItem("cart")
    // console.log(`cartJSON is ${cartJSON}`)
    // if cart exists
    if (cartJSON){
        var cart = JSON.parse(cartJSON)
        delete cart[productID]
        
    }

    localStorage.setItem("cart", JSON.stringify(cart) )
    localStorage.setItem("cartOrder", JSON.stringify(cartOrder) )

     var orderTotalPriceDiv = document.querySelector("div.orderTotalPrice")
        console.log(orderTotalPriceDiv)

        var orderTotalPrice = 0
        document.querySelectorAll("tr.lineItem").forEach(ele=>{
            var quantity = ele.querySelector("td input[name=quantity]").value
            var price = ele.querySelector("td.cartPrice").dataset["price"]

            // console.log(`quantity is ${quantity}`)
            // console.log(`price is ${price}`)
            orderTotalPrice += quantity* price
            // console.log(orderTotalPrice)
        })
        orderTotalPriceDiv.querySelector("span#totalPrice").innerHTML = orderTotalPrice.toFixed(2)
    
}


// script.
function getAddress() {
    var addressStreet = document.getElementById("addressStreet").value;
    var addressCity = document.getElementById("addressCity").value;
    var addressState = document.getElementById("addressState").value;
    var addressZipCode = document.getElementById("addressZipCode").value;
    var addressInfo = { 'addressStreet': addressStreet, 'addressCity': addressCity, 'addressState': addressState, 'addressZipCode': addressZipCode };
    localStorage.setItem('addressInfo', JSON.stringify(addressInfo));
    console.log(localStorage.getItem('addressInfo'));
}

document.querySelector("div.checkout form button").addEventListener("click", function(event){

    var cartJSON = localStorage.getItem("cart")
    var cart = JSON.parse(cartJSON)
    console.log(`cart is ${cart}`)

 

    var cartOrderJSON = localStorage.getItem("cartOrder")
    var cartOrder = JSON.parse(cartOrderJSON)

    
    var cartSubmitForm = document.querySelector("div.checkout form")
    var cartSubmitFormInputCart = cartSubmitForm.querySelector("input[name=cart]")
    console.log(`cartJSON is ${cartJSON}`)

    cartSubmitFormInputCart.value = cartJSON

    var cartSubmitFormInputCartOrder = cartSubmitForm.querySelector("input[name=cartOrder]")
    cartSubmitFormInputCartOrder.value = cartOrderJSON

    var cartOrderJSON = localStorage.getItem("promoCode")
    var cartSubmitFormInputPromoCode = cartSubmitForm.querySelector("input[name=promoCode]")
    cartSubmitFormInputPromoCode.value = cartOrderJSON

    cartSubmitForm.submit()
})


// // //checkout page
// // script.
// var cartJSON = localStorage.getItem("cart")
// console.log(cartJSON)
// if (cartJSON) {
//     var cart = JSON.parse(cartJSON)
//     var totalPrice = 0;
//     var cartSize = Object.keys(cart).length
//     console.log(cartSize)
//     //- document.getElementById("cartNumber").innerHTML = cartSize;
//     for (key in cart) {
//         console.log(`key is ${key}`)


//         var table = document.getElementById("cartBody");
//         var row = table.insertRow();
//         var cell1 = row.insertCell(0);
//         var cell2 = row.insertCell(1);
//         var cell3 = row.insertCell(2);
//         var cell4 = row.insertCell(3);
//         var cell5 = row.insertCell(4);
//         var image = "abc"
//         var name = key
//         var price = 100;
//         var stringPrice = "100"

//         console.log(stringPrice);
//         var parsePrice = parseFloat(stringPrice);
//         console.log(parsePrice);
//         totalPrice += parsePrice;
//         cell1.innerHTML = image;
//         cell2.innerHTML = name;
//         cell3.innerHTML = '<div class="quantity"><div class="quantity-select"><div class="entry value-minus">' + "-" + '</div><div class="entry value"><span>' + 1 + '</span></div><div class="entry value-plus active">' + '+' + '</div></div></div>'
//         cell4.innerHTML = price;
//         cell5.innerHTML = '<div class="rem"><div class="close2">Remove </div></div>'
//         cell5.onclick = function () {
//             removeRow(this);

//             console.log("Yee");
//             totalPrice = totalPrice - parsePrice;
//             var total = document.getElementById("totalPrice");
//             total.innerHTML = "Total Price " + totalPrice;

//             document.getElementById("cartNumber").innerHTML = cartSize;
//         };
//     }

// }
// var total = document.getElementById("totalPrice");
// total.innerHTML += totalPrice;
// cartSize = localStorage.length;
// document.getElementById("cartNumber").innerHTML = cartSize;

// console.log("no cart")


// function removeRow(row) {
//     var i = row.parentNode.rowIndex;
//     console.log(i);
//     document.getElementById("cartBody").deleteRow(i);
// }
// // js-files
// // jquery
// script(src = '/public/js/jquery-2.1.4.min.js')
// // //jquery
// // popup modal (for signin & signup)
// script(src = '/public/js/jquery.magnific-popup.js')
// script.
//     $(document).ready(function () {
//         $('.popup-with-zoom-anim').magnificPopup({
//             type: 'inline',
//             fixedContentPos: false,
//             fixedBgPos: true,
//             overflowY: 'auto',
//             closeBtnInside: true,
//             preloader: false,
//             midClick: true,
//             removalDelay: 300,
//             mainClass: 'my-mfp-zoom-in'
//         });
//     });
// // Large modal
// //
// //<script>
// //    $('#').modal('show');
// //</script>
// // //popup modal (for signin & signup)
// // cart-js
// script(src = '/public/js/minicart.js')
// script.
//     paypalm.minicartk.render(); //use only unique class names other than paypal1.minicart1.Also Replace same class name in css and minicart.min.js
// paypalm.minicartk.cart.on('checkout', function (evt) {
//     var items = this.items(),
//         len = items.length,
//         total = 0,
//         i;
//     // Count the number of each item in the cart
//     for (i = 0; i < len; i++) {
//         total += items[i].get('quantity');
//     }
//     if (total < 3) {
//         alert('The minimum order quantity is 3. Please add more to your shopping cart before checking out');
//         evt.preventDefault();
//     }
// });
// // //cart-js
// // quantity
// //- script.
// //-     $('.value-plus').on('click', function () {
// //-     var divUpd = $(this).parent().find('.value'),
// //-     newVal = parseInt(divUpd.text(), 10) + 1;
// //-     divUpd.text(newVal);
// //-     });
// //-     $('.value-minus').on('click', function () {
// //-     var divUpd = $(this).parent().find('.value'),
// //-     newVal = parseInt(divUpd.text(), 10) - 1;
// //-     if (newVal >= 1) divUpd.text(newVal);
// //-     });
// //- // quantity
// //- script.
// //-     $(document).ready(function (c) {
// //-     $('.close1').on('click', function (c) {
// //-     $('.rem1').fadeOut('slow', function (c) {
// //-     $('.rem1').remove();
// //-     });
// //-     });
// //-     });
// //- script.
// //-     $(document).ready(function (c) {
// //-     $('.close2').on('click', function (c) {
// //-     $('.rem2').fadeOut('slow', function (c) {
// //-     $('.rem2').remove();
// //-     });
// //-     });
// //-     });
// //- script.
// //-     $(document).ready(function (c) {
// //-     $('.close3').on('click', function (c) {
// //-     $('.rem3').fadeOut('slow', function (c) {
// //-     $('.rem3').remove();
// //-     });
// //-     });
// //-     });
// // //quantity
// // password-script
// script.
//     window.onload = function () {
//         document.getElementById("password1").onchange = validatePassword;
//         document.getElementById("password2").onchange = validatePassword;
//     }
// function validatePassword() {
//     var pass2 = document.getElementById("password2").value;
//     var pass1 = document.getElementById("password1").value;
//     if (pass1 != pass2)
//         document.getElementById("password2").setCustomValidity("Passwords Don't Match");
//     else
//         document.getElementById("password2").setCustomValidity('');
//     //empty string means no validation error
// }
// // //password-script
// // smoothscroll
// script(src = '/public/js/SmoothScroll.min.js')
// // //smoothscroll
// // start-smooth-scrolling
// // //end-smooth-scrolling
// // smooth-scrolling-of-move-up
// script.
//     $(document).ready(function () {
//         /*
//         var defaults = {
//         containerID: 'toTop', // fading element id
//         containerHoverID: 'toTopHover', // fading element hover id
//         scrollSpeed: 1200,
//         easingType: 'linear'
//         };
//         */
//         $().UItoTop({
//             easingType: 'easeOutQuart'
//         });
//     });
// // //smooth-scrolling-of-move-up
// // for bootstrap working
// script(src = '/public/js/bootstrap.js')
// // //for bootstrap working
// // //js-files