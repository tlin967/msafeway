
var deliveryForm = document.querySelector("fieldset.delivery-address")



document.querySelector("div.preview button").addEventListener("click", function(event){

    var cartJSON = localStorage.getItem("cart")
    var cart = JSON.parse(cartJSON)
    console.log(`cart is ${cart}`)

    event.preventDefault()

    var cartOrderJSON = localStorage.getItem("cartOrder")
    var cartOrder = JSON.parse(cartOrderJSON)

    
    var cartSubmitForm = document.querySelector("div.preview")
    var cartSubmitFormInputCart = cartSubmitForm.querySelector("input[name=cart]")
    console.log(`cartJSON is ${cartJSON}`)

    cartSubmitFormInputCart.value = cartJSON

    var cartSubmitFormInputCartOrder = cartSubmitForm.querySelector("input[name=cartOrder]")
    cartSubmitFormInputCartOrder.value = cartOrderJSON

    var cartOrderJSON = localStorage.getItem("promoCode")
    var cartSubmitFormInputPromoCode = cartSubmitForm.querySelector("input[name=promoCode]")
    cartSubmitFormInputPromoCode.value = cartOrderJSON

    var form = document.querySelector("form.confirm-form")
    form.querySelectorAll("input").forEach(ele=>{
        ele.disabled = false
    })


    document.querySelector("form.confirm-form").submit()
})