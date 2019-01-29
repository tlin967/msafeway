var filterForm = document.querySelector("div.filter form")
        filterForm.querySelector(".action-button").addEventListener("click", searchAndFilter.bind(null, filterForm));

        document.querySelectorAll(".add-to-cart").forEach(ele=>{
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

        document.querySelector(".pagination input[name=page-number]").addEventListener("change", pageNumberChanged)

        // prev and next page navigation changes the current page value, but this change is not picked
        //-up by the event listener on current page value
        document.querySelector(".pagination #prev-product-page").addEventListener("click", prevPage)
        document.querySelector(".pagination #next-product-page").addEventListener("click", nextPage)


        document.querySelector("select.results-per-page").addEventListener("change", resultsPerPageChange)

        document.querySelector(".sort-by select").addEventListener("change", sortByFieldChanged)
        
        document.querySelectorAll(".filter .filter input").forEach(element=>{
            element.addEventListener("change", filterFieldChanged)
        })
            

        function sortByFieldChanged(event){
            console.log("sort by field changed")
            console.log(event.target)
            searchAndFilter(filterForm,0)
        }
        function filterFieldChanged(event){
            console.log("filter field changed")
            console.log(event.target)
            searchAndFilter(filterForm,0)
        }
        function pageNumberChanged(event){
            console.log("page number changed")
            console.log(event.target.value)
            console.log("prev page #" + event.target.dataset["prev"])

            // maxPages is the number of pages, starting from 0
            // ie if 12 results and display 10 results/pg
            // then maxPages is 1
            // note that valid pages would really only be 0 and 1
            var maxPages = document.querySelector(".page-number-max").innerHTML
            console.log(`event.target.value is ${event.target.value}`)

            if( event.target.value > maxPages){
                console.log("this is greater than max page")
                event.target.value = maxPages
                event.target.dataset["prev"] = maxPages
            }
            else if( event.target.value < 0){
                event.target.value = 0
                event.target.dataset["prev"] = 0                
            }
            else{
                event.target.dataset["prev"] = event.target.value
            }
            searchAndFilter(filterForm)

            window.scrollTo(0, 250);
        }


        function prevPage(event){
            console.log("prev page clicked")
            event.preventDefault()
            var currentPage = document.querySelector(".pagination input[name=page-number]")
            if (currentPage.value == 0){
                return
            }
            else{
                currentPage.value = parseInt(currentPage.value) - 1
                searchAndFilter(filterForm)
                document.querySelector(".pagination input[name=page-number]").dataset["prev"] = parseInt(document.querySelector(".pagination input[name=page-number]").dataset["prev"]) - 1
            }
        }
        function nextPage(event){
            console.log(event)
            console.log("next page clicked")
            //- event.preventDefault()
            var currentPage = document.querySelector(".pagination input[name=page-number]")
            console.log(currentPage.value)
            var maxPages = document.querySelector(".page-number-max").innerHTML

            if (currentPage.value == maxPages){
                return
            }
            else{
                currentPage.value = parseInt(currentPage.value) + 1
                console.log(currentPage)
                searchAndFilter(filterForm)
                document.querySelector(".pagination input[name=page-number]").dataset["prev"] = parseInt(document.querySelector(".pagination input[name=page-number]").dataset["prev"]) + 1
            }
        }


        function searchAndFilter(form, optPageNumber) {
            console.log("Inside searchAndFilter")
            console.log(form)
            console.log(this)
            // GET PAGINATION SETTINGS
            // note page number is reset if search term has changed
            resultsPerPage = form.querySelector("div.pagination select.results-per-page").value

            if( isNaN(optPageNumber) || typeof(optPageNumber) == undefined){
                pageNumber = form.querySelector("div.pagination input[name=page-number]").value
            }
            else{
                pageNumber = optPageNumber
                form.querySelector("div.pagination input[name=page-number]").value = optPageNumber
            }
            

            // GET SORT BY SETTINGS

            sortBy = form.querySelector("div.sort-by select.sort-by").value

            // GET FILTER SETTINGS
            // note, these may be empty strings since there is no default value
            priceGreaterThanExists = form.querySelector("div.filter input[name=priceGreaterThan]")
            priceLessThanExists = form.querySelector("div.filter input[name=priceLessThan]")
            if (priceGreaterThanExists) {
            priceGreaterThan = form.querySelector("div.filter input[name=priceGreaterThan]").value
            } else {
            priceGreaterThan = undefined
            }
            if (priceLessThanExists) {
            priceLessThan = form.querySelector("div.filter input[name=priceLessThan]").value
            } else {
            priceLessThan = undefined
            }


            // GET SEARCH PARAMETERS
            // note, these may be empty strings since there is no default value
            var searchTermHTMLElement = form.querySelector("div.search input[name=name]")
            searchTerm = searchTermHTMLElement.value
            if (searchTerm != searchTermHTMLElement.dataset["prev"]){
                pageNumber = 0
                form.querySelector("div.pagination input[name=page-number]").value = 0
                searchTermHTMLElement.dataset["prev"] = searchTerm
            }

            category = form.querySelector("div.search input[name=category]").value

            var searchObject = {}
            searchObject.resultsPerPage = resultsPerPage
            searchObject.pageNumber = pageNumber
            searchObject.sortBy = sortBy
            searchObject.priceGreaterThan = priceGreaterThan
            searchObject.priceLessThan = priceLessThan
            searchObject.searchTerm = searchTerm
            searchObject.category = category

            console.log(`searchObject is ${searchObject}`)
            submitSearchObject(searchObject)
            
            var newQueryString = "?"
                console.log(`abcdef`)
                for( key in searchObject){
                    console.log(key)
                    if(searchObject[key] !=""){
                    newQueryString += key
                    newQueryString += "="
                    newQueryString += searchObject[key]
                    newQueryString += "&"
                    }
                    
                }
                newQueryString = newQueryString.slice(0,-1)
                console.log(`new querystring is ${newQueryString}`)
                history.pushState(searchObject, null, window.location.pathname+newQueryString)
                
            }
            
        function submitSearchObject(searchObject){
            axios({
            method: 'post',
            url: '/filter-search',
            data: searchObject,
            config: { headers: { 'Content-Type': 'application/json' } }
            })
            .then((server_response) => {
                var product_lis = document.querySelectorAll("li.product")
                //- console.log("product lis")
                //- console.log(product_lis)
                //- console.log(server_response.data)

                if(server_response.data.rows.length == 0){
                    // hide all products
                    console.log("No results found")
                }

                console.log(server_response.data.rows.length)
                // display new products
                for(var i=0;i< server_response.data.rows.length;i++){
                    product_lis[i].style.visibility = "visible"
                    //- console.log(i)
                    //- console.log(product_lis[i])
                    // replaceChild is only for direct children
                    var link = product_lis[i].querySelector("a")
                    var newLink = document.createElement("a")
                    newLink.href = "/products/"+ server_response.data.rows[i].id
                    //- console.log(link)
                    console.log(`newLink is ${newLink}`)
                    
            
                    //- var image = product_lis[i].querySelector('img')
                    var newImage = document.createElement("img")
                    //- console.log(image)
                    //- console.log(newImage)
                    //- console.log(product_lis[i])
                    newImage.src="https://s7d2.scene7.com/is/image/ABS/"+server_response.data.rows[i].id+"?$ecom-product-details-desktop-jpg$&defaultImage=Not_Available"
                    newImage.className="product-image"

                    //- var name = product_lis[i].querySelector('p.product-name')
                    var newName = document.createElement("p")
                    //- console.log(image)
                    //- console.log(newImage)
                    newName.className="product-name"
                    newName.innerHTML = server_response.data.rows[i].name
                    
                    //- var price = product_lis[i].querySelector('p.product-price')
                    var newPrice = document.createElement("p")
                    //- console.log(image)
                    //- console.log(newImage)
                    newPrice.className="product-price"
                    newPrice.innerHTML = server_response.data.rows[i].price


                    newLink.appendChild(newImage)
                    newLink.appendChild(newName)
                    newLink.appendChild(newPrice)
                    

                    console.log("newlink")
                    console.log(newLink)

                    console.log(link)

                    if( link != null){
                        product_lis[i].replaceChild(newLink, link)
                    }
                    else{
                        product_lis[i].appendChild(newLink)
                    }
                    
                    var oldAddToCartLink = product_lis[i].querySelector('.add-to-cart')
                    
                    var newAddToCartLink = document.createElement("a")
                    newAddToCartLink.className = "add-to-cart"
                    newAddToCartLink.innerHTML = "Add To Cart"
                    newAddToCartLink.dataset["productId"] = server_response.data.rows[i].id
                    newAddToCartLink.addEventListener("click", addToCart)

                    console.log(newAddToCartLink)

                    if( oldAddToCartLink != null){
                        console.log(`old link not null; product_lis[i] is ${product_lis[i].textContent}`)
                        product_lis[i].replaceChild(newAddToCartLink, oldAddToCartLink)
                    }
                    else{
                        product_lis[i].appendChild(newAddToCartLink)
                    }

                    var pageMax = document.querySelector(".page-number-max")
                    console.log(pageMax)
                    pageMax.innerHTML = Math.floor(server_response.data.metadata.count/resultsPerPage)

                }

                // hide if there arent any more products to display
                for(var i = server_response.data.rows.length; i < product_lis.length; i++){
                    console.log(i)
                    console.log(product_lis[i])
                    product_lis[i].style.visibility = "hidden"
                }
                //- console.log(product_lis)
                //- console.log(server_response)
                //- console.log(server_response.status)
                //- console.log(server_response.data)
                //- response.innerHTML = server_response.status + "\n\n" + JSON.stringify(server_response.data)
                // `Status ${server_response.status}

                
                
        })
        }

        window.addEventListener("popstate", function(e) { 
            console.log(`popping history ${JSON.stringify(e.state)}`)
            submitSearchObject(e.state)
            document.querySelector("div.pagination select.results-per-page").value = e.state.resultsPerPage
            document.querySelector("div.pagination input[name=page-number]").value = e.state.pageNumber
            document.querySelector("div.sort-by select.sort-by").value = e.state.sortBy
            document.querySelector("div.filter input[name=priceGreaterThan]").value = e.state.priceGreaterThan
            document.querySelector("div.filter input[name=priceLessThan]").value = e.state.priceLessThan
            document.querySelector("div.search input[name=name]").value = e.state.searchTerm
            document.querySelector("div.search input[name=category]").value = e.state.category
        });

        window.addEventListener('load', function() {
            form =filterForm
             // GET PAGINATION SETTINGS
            // note page number is reset if search term has changed
            resultsPerPage = form.querySelector("div.pagination select.results-per-page").value

                pageNumber = form.querySelector("div.pagination input[name=page-number]").value
            

            

            // GET SORT BY SETTINGS

            sortBy = form.querySelector("div.sort-by select.sort-by").value

            // GET FILTER SETTINGS
            // note, these may be empty strings since there is no default value
            priceGreaterThanExists = form.querySelector("div.filter input[name=priceGreaterThan]")
            priceLessThanExists = form.querySelector("div.filter input[name=priceLessThan]")
            if (priceGreaterThanExists) {
            priceGreaterThan = form.querySelector("div.filter input[name=priceGreaterThan]").value
            } else {
            priceGreaterThan = undefined
            }
            if (priceLessThanExists) {
            priceLessThan = form.querySelector("div.filter input[name=priceLessThan]").value
            } else {
            priceLessThan = undefined
            }


            // GET SEARCH PARAMETERS
            // note, these may be empty strings since there is no default value
            var searchTermHTMLElement = form.querySelector("div.search input[name=name]")
            searchTerm = searchTermHTMLElement.value
            if (searchTerm != searchTermHTMLElement.dataset["prev"]){
                pageNumber = 0
                form.querySelector("div.pagination input[name=page-number]").value = 0
                searchTermHTMLElement.dataset["prev"] = searchTerm
            }

            category = form.querySelector("div.search input[name=category]").value

            var searchObject = {}
            searchObject.resultsPerPage = resultsPerPage
            searchObject.pageNumber = pageNumber
            searchObject.sortBy = sortBy
            searchObject.priceGreaterThan = priceGreaterThan
            searchObject.priceLessThan = priceLessThan
            searchObject.searchTerm = searchTerm
            searchObject.category = category

            console.log(`searchObject is ${searchObject}`)
            // submitSearchObject(searchObject)
            
            var newQueryString = "?"
                console.log(`abcdef`)
                for( key in searchObject){
                    console.log(key)
                    if(searchObject[key] !=""){
                    newQueryString += key
                    newQueryString += "="
                    newQueryString += searchObject[key]
                    newQueryString += "&"
                    }
                    
                }
                newQueryString = newQueryString.slice(0,-1)
                console.log(`new querystring is ${newQueryString}`)
                history.replaceState(searchObject, null, window.location.pathname+newQueryString)
        })


        function resultsPerPageChange(event){
            //
            console.log("changed")
            console.log(event.target.value)
            var numberToDisplay = event.target.value

            var product_ul = document.querySelector("ul.products-list")
            console.log(product_ul)
            var l = product_ul.children.length
            console.log(l)

            while( l > numberToDisplay ){
                console.log("removing a box")
                product_ul.removeChild(product_ul.lastChild)
                l = l-1
            }

            var newLi = document.createElement("li")
            newLi.className = "product col-md-4"
            while( l < numberToDisplay ){
                console.log("adding a box ")
                product_ul.appendChild(newLi.cloneNode())
                l = l+1
            }
            searchAndFilter(filterForm, 0)
        }

            
