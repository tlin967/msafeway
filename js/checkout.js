document.querySelector("input[name=delivery-same-as-billing]").addEventListener("click", toggleDeliveryAddressCheckbox)

var deliveryForm = document.querySelector("fieldset.delivery-address")


function toggleDeliveryAddressCheckbox(event){
    var checkbox = event.currentTarget
    console.log(checkbox.checked)
    deliveryForm.querySelectorAll("input").forEach(ele=>{
        ele.disabled = checkbox.checked  

    // var style = {background:grey}

        if (checkbox.checked == true){
            ele.classList.add("style")
        }

        else{
            ele.classList.remove("style")
        }
    })



}

document.querySelector("div.preview button").addEventListener("click", function(event){

    event.preventDefault()

    var cartJSON = localStorage.getItem("cart")
    var cart = JSON.parse(cartJSON)
    console.log(`cart is ${cart}`)

 

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

    var stripeMessage = document.querySelector("#card-errors")
    var stripeForm = document.querySelector("html body div.content div.container form fieldset.credit-card div#payment-form div#card-element.StripeElement")
    console.log(`stripeMessage is ${stripeMessage.innerHTML}`)
    console.log(`stripeForm is ${stripeForm.className}`)

    if (stripeForm.className == "StripeElement StripeElement--invalid" || stripeForm.className == "StripeElement StripeElement--empty"){
        document.querySelector("label.submit-error").innerHTML = "Please make sure all fields are filled out"
        return
    }
    else{

        document.querySelector("form.preview-form").submit()
    }

    
})