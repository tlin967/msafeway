var superCategorySelections = document.querySelectorAll(".superCategory")

console.log("hello")

superCategorySelections.forEach( ele=>{
    // console.log(ele)
    ele.addEventListener("click", superCategorySelected)
})


function superCategorySelected(event){
    // TODO: if these setttings are stored somewhere on client like on cookie, use thsoe settings instead
    console.log(event.target.value)
    var searchObject = {}
    // searchObject.resultsPerPage = resultsPerPage
    // searchObject.pageNumber = pageNumber
    // searchObject.sortBy = sortBy
    // searchObject.priceGreaterThan = priceGreaterThan
    // searchObject.priceLessThan = priceLessThan
    // searchObject.searchTerm = searchTerm
    // searchObject.category = category
    searchObject.category = event.target.value

    console.log(`searchObject is ${searchObject}`)

    axios({
    method: 'post',
    url: 'products',
    data: searchObject,
    config: { headers: { 'Content-Type': 'application/json' } }
    })
    .then( successResult=>{
        console.log(successResult)
        document.querySelector("body div.content").innerHTML = JSON.stringify(successResult.data)
    })
}



var cartLI = document.querySelector("#navbar-cart")
cartLI.addEventListener("click", function(event){

    var cartJSON = localStorage.getItem("cart")
    var cart = JSON.parse(cartJSON)
    console.log(`cart is ${cart}`)

    var productIDs = []
    for (productID in cart){
        console.log(productID)
        productIDs.push(parseInt(productID))
    }

    var cartOrderJSON = localStorage.getItem("cartOrder")
    var cartOrder = JSON.parse(cartOrderJSON)

    
    console.log(cartLI)
    var cartSubmitForm = cartLI.querySelector("form")
    var cartSubmitFormInputCart = cartSubmitForm.querySelector("input[name=cart]")
    console.log(`cartJSON is ${cartJSON}`)

    console.log(`productIDs ${productIDs}`)
    cartSubmitFormInputCart.value = cartJSON

    var cartSubmitFormInputCartOrder = cartSubmitForm.querySelector("input[name=cartOrder]")
    cartSubmitFormInputCartOrder.value = cartOrderJSON
    cartSubmitForm.submit()
})

document.querySelector(".form-inline").addEventListener("submit", function(event){
   console.log("triggered")
   event.preventDefault()


   var term = event.target.querySelector("input").value

   localStorage.setItem("searchTerm", term)
   event.target.submit()
})

window.addEventListener("load", function(event){

   var savedTerm = localStorage.getItem("searchTerm")
   this.console.log(`savedTerm is ${savedTerm}`)
   var searchBar = document.querySelector(".form-inline input")
   searchBar.value = savedTerm

   this.localStorage.removeItem("searchTerm")
})
