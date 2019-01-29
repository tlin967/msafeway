// @ts-check
const Router = require('router')
const router = Router()
// const express = require('express');
// const router = express.Router()
const passport = require('./auth.js')
const fs = require('fs')
// const session = require('express-session')
// const MySQLStore = require('express-mysql-session')(session)

const mysql = require('mysql')
//post req.body
const bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: true });
// const config = require('./config.js')
// const connection = mysql.createConnection(config)
const Queries = require('./queries')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const path = require('path')
const dir = path.join(__dirname, 'public')
const mime = {
  html: 'text/html',
  txt: 'text/plain',
  css: 'text/css',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  js: 'application/javascript'
}

const pug = require('pug')
const url = require('url')
const querystring = require('querystring')
const Email = require('./email')


router.get('/', function (req, res) {
  var reqpath = req.url.toString().split('?')[0]
  // console.log(reqpath)
  var file = path.join(dir, reqpath.replace(/\/$/, '/index.html'))
  console.log(`retrieving file: ${file}`)
  if (file.indexOf(dir + path.sep) !== 0) {
    res.statusCode = 403
    res.setHeader('Content-Type', 'text/plain')
    return res.end('Forbidden')
  }
  var type = mime[path.extname(file).slice(1)] || 'text/plain'
  console.log(`filetype ${type}`)
  var s = fs.createReadStream(file)
  s.on('open', function () {
    res.setHeader('Content-Type', type)
    s.pipe(res)
  })
  s.on('error', function () {
    res.setHeader('Content-Type', 'text/plain')
    res.statusCode = 404
    // res.end('Not found');
  })
  console.log(req.user)
  console.log(req.isAuthenticated())
})

router.post('/signup', function (req, res) {
  /*
    req.checkBody('username',
        'Username cannot be empty.').notEmpty();
    req.checkBody('email', 'Email is invalid, try again.').isEmail();
    const errors = req.validationErrors();
    if (errors) {
        console.log(`errors: ${JSON.stringify(errors)}`);
    }
    */

  console.log(req.body)

  var parameters = {};
        parameters.to = req.body.email
        parameters.subject = 'Welcome @ SJSU.market'
        parameters.text = 'Welcome ' + req.body.username + ' to SJSU Market!'
        console.log('print this before sending email')
        Email.email(parameters)

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
  let s3 = mysql.format(Queries.user.create, [req.body.username,
    hash, req.body.email])

  console.log(`Final query: ${s3}`)
  let s4 = mysql.format(Queries.user.session,[]);

  Queries.queryResultPromiser(s3)
    .then((successResult) => {
      console.log('New user created')
      console.log(successResult)
      // var user_id = 0
      // req.login(successResult, (err)=>{
      //     if(err){
      //         res.write(err)
      //     }
      //     else{
      //     console.log("logged in")
      //     }
      // })
      // res.end()
    },
    (rejectResult) => {
      console.log('error occurred in signup')
      console.log(rejectResult)
      if (rejectResult.errno == 1062){
        res.setHeader("Content-Type","text/plain");
        res.statusCode = 400
        res.write("This email already registered")
      }

      res.end()
      return

    })

  Queries.queryResultPromiser(s4)
  .then( (successResult)=>{
      const user_id = successResult[0];
      console.log(user_id);
      // if(err) {
      //     return next(err);
      // }
      req.login(user_id, function(err) {
        res.end()
      });
      console.log("Session Successful");

  },
  (rejectResult)=>{
      console.log("Session Unsucessful");
  })

  })



  // res.end()
})

// By default, if authentication fails, Passport will respond with a 401 Unauthorized status, and any additional route handlers will not be invoked.
// Look at passport documentation on custom callback if we want to customize response when authentication fails
router.post('/login', passport.authenticate('local'), function (req, res) {
  res.end('sucessful login')
})

router.get('/logout', authenticationMiddleware(), function(req, res) {
  //Test if works
  //to see if user clicks
    req.logout();
    console.log("--------")
    console.log(req.session.cookie)
    req.session.cookie.expires = new Date(Date.now())
    
    res.end('Logout successful');
    
    req.session.destroy(() => {
    //This needs fixing beacause connect doesn't have
    //res.clearCookie. We need this because it will also
    //clear the browser cookie onced the user presses logout.
    //If not the cookie will stay on the browser.
      console.log("removed session from sesion store")
      // res.clearCookie('connect.sid');
      //res.redirect('/')
      
    });
}); 

//Used to make sure the user is logged in with a session
  //then proceeds with the application, if not redirected to login
  function authenticationMiddleware() {
       return (req, res, next) => {
           console.log(`
               req.session.passport.user: ${JSON.
                   stringify(req.session.passport)}`);
           if(req.isAuthenticated()) {
               console.log('Authenticated user')
               return next();
           }
           // else not authenticated
           res.statusCode = 401
           res.write("You are not logged in")
           res.end()
       }
   }

   
   


router.post("/promo", function(req,res){
 console.log(req.body)
 let sPromo = mysql.format(Queries.promo.findPromo,[req.body.promocode])
 console.log(`Final query: ${sPromo}`)
 Queries.queryResultPromiser(sPromo)

   .then((successResult)=>{
   //If returned array (successResult) is empty, return an error message instead
   if(successResult.length < 1) {
   console.log("Error 400")
   res.statusCode = 400;
   res.end("Error 400")
   } else{
   var discount=(successResult[0].amount)
   console.log("Promo amount is: " + JSON.stringify(discount))

   //res.write(JSON.stringify(discount))
   res.end(JSON.stringify(discount))
   }
     },

   (rejectResult)=>{
     console.log("Error occurred in promo")
     // console.log(rejectResult)
     res.setHeader("Content-Type","application/json"); 
     res.statusCode = 400;
     res.write(JSON.stringify(rejectResult))
     res.end()
   })
})

router.post("/filter-search", function(req,res){
 console.log(req.body)

 var [s1,placeholders] = Queries.search(req.body)
 console.log(`s1 is: ${s1}`)
 console.log(`values for placeholders are: ${placeholders}`)
 var s2 = mysql.format(s1,placeholders)
 console.log(s2)

 Queries.queryResultPromiser(s2)
 .then(successResult=>{
     // console.log(successResult)
     
     var [s3,placeholders2] = Queries.getCount(req.body)
     console.log(`s3 is: ${s3}`)
     console.log(`values for placeholders are: ${placeholders2}`)
     var s4 = mysql.format(s3,placeholders2)
     console.log(s4)

     Queries.queryResultPromiser(s4)
     .then(counter=>{
         console.log(successResult)
         console.log(counter[0]['count(*)'])

         var results = {}
         results.rows = successResult
         results.metadata ={"count":counter[0]['count(*)']}
         

         res.setHeader("Content-Type","application/json"); 
         res.write(JSON.stringify(results))
         res.end()
       },
       rejectResult=>{
           res.end()
     })
 },
 rejectResult=>{
     res.end()
 })

 
})

router.post("/search", function(req,res){
  console.log(req.body.value)
  console.log(req.body.search)
  // let s3 = mysql.format(Queries.product.getCategory, [req.body.button])
  let s4
  let s5
  if( typeof(req.body.value) != 'undefined'){
      s4 = mysql.format(Queries.product.getName, ["%" + req.body.value + "%"])
  }
  else{
      s4 = mysql.format(Queries.product.getName, ["%" + req.body.search + "%"])
      s5 = mysql.format(Queries.product.getCategory, ["%" + req.body.search + "%"])
  }
  // var x = s3.value;
  // console.log(x);
  // console.log(`Final query: ${s3}`)
  console.log(`Final query: ${s4}`)
  console.log(`Final query: ${s5}`)
  // queryResultPromiser(s3)
  Queries.queryResultPromiser(s4)
  .then( (success)=>{
    console.log("query by name")
    // console.log(success)
    res.write(JSON.stringify(success))
    res.end()
  },
  (reject)=>{
    res.end()
  })
  Queries.queryResultPromiser(s5)
  .then( (successResult)=>{
      console.log("Query by category")
      // console.log(successResult)
      res.write(JSON.stringify(successResult))
      res.end()
  },
  (rejectResult)=>{
      console.log("Error in query")
      // console.log(rejectResult)
      res.setHeader("Content-Type","application/json"); 
      // res.statusCode = 200;
      res.write(JSON.stringify(rejectResult))
      res.end()
  })
})

router.post("/recovery", function(req,res){  console.log(req.body.email)

  let s3 = mysql.format(Queries.user.checkEmailExists,[req.body.email])
  console.log(`Final query: ${s3}`)  // TODO: Check if valid email  // process valid email
  Queries.queryResultPromiser(s3)
  .then((result)=>{
      console.log(result)      // check if result not empty
      if(result.length){
          //TODO: Send recovery email
          var nodemailer = require('nodemailer');
          var randomstring = require("randomstring");
          var newPass = randomstring.generate(7);
          bcrypt.hash(newPass, saltRounds, function(err, hash) {
            let s4 = mysql.format(Queries.user.recovery, [hash, req.body.email])
            console.log(`s4 is ${s4}`)
            Queries.queryResultPromiser(s4)
            .then((successResult) => {
              console.log('Password Updated')
              console.log(successResult)
            },
            (rejectResult) => {
              console.log('error in the hash')
              console.log(rejectResult)
              if (rejectResult.errno == 1062){
                res.setHeader("Content-Type","text/plain");
                res.statusCode = 400
                res.write("something")
              }             
               res.end()
          })
        });
 
        var parameters = {};
        parameters.to = req.body.email
        parameters.subject = 'Password Recovery'
        parameters.text = 'Your new password is ' + newPass + '. Please use this to log in and change your password.'
        console.log('print this before sending email')
        Email.email(parameters)
        console.log('is it even getting here')      }
      else{
         console.log("No results found")      }
      res.end()  }, function rejectedPromise(err){
      console.log(err)
      res.end()
  })})
//checkout as logged in customer

router.post('/checkoutasloggedincustomer', authenticationMiddleware(), function(req, res) {
  
  let userid = req.user.user_id
  //cartid: auto
  let date= new Date();

  let payment = req.body.payment;
  let address = req.body.address;
  let city = req.body.city;
  let state = req.body.state;
  let zip = req.body.zip
  let country = req.body.country;
  let promo = req.body.promo;//from promo_code
  let status = "PROCESSING";//status

  //insert into cart
  let price = req.body.price;
  let quantity = req.body.quantity;
  let productid = req.body.productid;
 // res.write( " price "+ price +" quantity "+ quantity+ "productid "+ productid );
  let s3 = mysql.format(Queries.cart.createCart, [price, quantity,productid , ]);
  console.log(`Final query: ${s3}`)
  Queries.queryResultPromiser(s3)

    .then((result) => {
      console.log(result)
    }, function rejectedPromise (err) {
      console.log(err)
      res.end()
    })

  // res.write("user id" + userid+ " status "+ status + " paymentInfo" + payment + " street "+ address +", "+ city +", "+ state + ", "+ country+ " userID  "+ userid 
  // +"cartid " + cartid +" date "+ date +" promo "+ promo)
  let s6 = mysql.format(Queries.cart.lastinsertedid,[])
  Queries.queryResultPromiser(s6)
  .then((result) => {
    console.log(result)
    let cart_id = result[0].cart_id
  res.write("cartid "+ s6);
  let s7 = mysql.format(Queries.order.create_order, [,status,payment,address,city, state, zip, country, cart_id,userid, date, promo]);
  console.log(`Final query: ${s7}`)
  Queries.queryResultPromiser(s7)
    .then((result) => {
    console.log(result)
    }, function rejectedPromise (err) {
    console.log(err)
    res.end()
    })
  })
})
  

router.get('/authentication', function(req, res) {
  console.log("Is user authenticated? " + req.isAuthenticated());
  var temp = req.isAuthenticated();
  if (temp == true) {
    res.write("true");
    console.log(true);
  }
  else {
    res.write("false");
    console.log(false);
   }

   res.end();
})

//checkoutasguest
router.post('/checkoutasguest', function (req, res) {

  // let cartid = 2;//need connect to cart
  let date= new Date();
  let email = req.body.email;
  let payment = req.body.payment;
  let address = req.body.address;
  let city = req.body.city;
  let state = req.body.state;
  let country = req.body.country;
  let status = "PROCESSING";//status
  //insert into cart
  let zip = req.body.zip
  let price = req.body.price;
  let quantity = req.body.quantity;
  let productid = req.body.productid;
  //let guestorderid = req.body.guestorderid;//just need to auto increment

  // CREATE CART
  let s3 = mysql.format(Queries.cart.createCart, [price, quantity,productid , ]);
  console.log(`Final query: ${s3}`)
  Queries.queryResultPromiser(s3)

    .then((result) => {
      console.log(result)
    }, function rejectedPromise (err) {
      console.log(err)
      res.end()
    })

  // res.write("user id" + userid+ " status "+ status + " paymentInfo" + payment + " street "+ address +", "+ city +", "+ state + ", "+ country+ " userID  "+ userid 
  // +"cartid " + cartid +" date "+ date +" promo "+ promo)

  // GET CART ID
  let s8 = mysql.format(Queries.cart.lastinsertedid,[])
  Queries.queryResultPromiser(s8)
  .then((result) => {
    console.log(result)
    let cart_id = result[0].cart_id
  //res.write(" status "+ status + " paymentInfo" + payment + " street "+ address +", "+ city +", "+ state + ", "+ country+ " email  "+ email 
  //+"cartid " + cartid +" date "+ date )

  // CREATE GUEST ORDER
  let s9 = mysql.format(Queries.guest_order.create_guestorder, [status,payment,address,city, state, zip, country, cart_id, email, date, ]);
  console.log(`Final query: ${s9}`)
  Queries.queryResultPromiser(s9)
    .then((result) => {
    console.log(result)
    }, function rejectedPromise (err) {
    console.log(err)
    res.end()
    })
  })
})

router.get('/products', (req,res)=>{
  console.log(req.body)
  var reqUrl = url.parse(req.url)
  var queryStringObj = querystring.parse(reqUrl.query)
  console.log(queryStringObj)

  console.log(`req.body.searchObject is ${req.body.searchObject}`)

  if (! queryStringObj.resultsPerPage){
    queryStringObj.resultsPerPage = 10
  }

  const compiledFunction = pug.compileFile('pug/products.pug')

  var [s1,placeholders] = Queries.search(queryStringObj)
  console.log(`s1 is: ${s1}`)
  console.log(`values for placeholders are: ${placeholders}`)
  var s2 = mysql.format(s1,placeholders)
  console.log(s2)

  Queries.queryResultPromiser(s2)
  .then(successResult=>{
      console.log(successResult)

      var [s3,placeholders2] = Queries.getCount(queryStringObj)
      console.log(`s3 is: ${s3}`)
      console.log(`values for placeholders are: ${placeholders2}`)
      var s4 = mysql.format(s3,placeholders2)
      console.log(`s4 is ${s4}`)

      Queries.queryResultPromiser(s4)
      .then(counter=>{
          console.log(successResult)
          console.log(counter[0]['count(*)'])

          successResult.metadata ={"count":counter[0]['count(*)']}
          successResult.searchObject = queryStringObj


      res.setHeader("Content-Type","text/html"); 

      var compiled = compiledFunction({successResult})
      
      res.end(compiled)
      })
  },
  rejectResult=>{
      console.log(rejectResult)
      res.end("invalid")
  })
});

router.get("/edit-account", authenticationMiddleware(), (req,res)=>{
  console.log(req.body)
  const compiledFunction = pug.compileFile('pug/edit-account.pug')
  res.end(compiledFunction())
})

router.post('/edit-account', authenticationMiddleware(), function(req, res) {

  //Edit changes entire username, password and address
  console.log(req.body.username)
  console.log(req.body.password)

  if(req.body.password === req.body.confirmPassword) {

  bcrypt.hash(req.body.password, saltRounds, function(err, hash){
  let sEdit = mysql.format(Queries.user.edit, [req.body.username, hash, req.user.user_id])

  console.log(`Final query: ${sEdit}`)
  Queries.queryResultPromiser(sEdit)
    .then((successResult) => {
      console.log('User updated')
      console.log(successResult)
    },
    (rejectResult) => {
      console.log('error occurred in update')
      console.log(rejectResult)
      if (rejectResult.errno == 1062){
        res.setHeader("Content-Type","text/plain");
        res.statusCode = 400
        res.write("error")
      }
      res.end()
      return

    })

  })
}
  else {
    res.write("Passwords do not match.");
    console.log("Not updated")
  }
  
});

router.post('/edit-address', function(req, res) {

 //Editv3 changes address

  console.log(req.body.address)
  console.log(req.body.city)
  console.log(req.body.state)
  console.log(req.body.country)
  //res.end('Edit successful');
 
  let sv3 = mysql.format(Queries.user.editAddress, [req.body.address,req.body.city, req.body.state, 
    req.body.country, req.body.zip, req.user.user_id])
 console.log(`Final query: ${sv3}`)
 Queries.queryResultPromiser(sv3)
    .then((successResult) => {
      console.log('user updated')
      console.log(successResult)

       },
    (rejectResult) => {
      console.log('error occurred to update')

})

})

router.get("/cart", (req,res)=>{
  const compiledFunction = pug.compileFile('pug/cart.pug')
  res.end(compiledFunction())
})

router.post("/cart", (req,res)=>{
  console.log(req.body)

  if(req.body.cart == "" || req.body.cart == "{}"){
    const compiledFunction = pug.compileFile('pug/cart.pug')
     res.end(compiledFunction())
     return
  }
  


  var cart = JSON.parse(req.body.cart)
  console.log(`cart is ${(cart)}`)
  

  var cartOrder = JSON.parse(req.body.cartOrder)
  console.log(`cartOrder is ${(cartOrder)}`)

  var quantities = []

  


 var [s1, placeholders] = Queries.getProductInfo(cartOrder)

 console.log(`s1 is: ${s1}`)
 console.log(`values for placeholders are: ${placeholders}`)
 var s2 = mysql.format(s1,placeholders)
 console.log(s2)

 Queries.queryResultPromiser(s2)

 .then(successResult=>{

     console.log(successResult)

     var successResultAsObj ={}
     // stores successResult in object by cartOrder
     for (rowData in successResult){
        successResultAsObj[ successResult[rowData].id ] = successResult[rowData]
     }
     console.log(successResultAsObj)
    
    for( index in cartOrder){
      console.log(cartOrder[index])
      var pid = cartOrder[index]
      console.log(cart[pid])
      quantities.push(parseInt(cart[pid]))
    }

     var productData = successResultAsObj

     var cartData = {}
     cartData["cartOrder"] = cartOrder
     cartData["quantities"] = quantities

    var orderTotal = 0
    for (var i=0;i<cartOrder.length;i++){
      console.log(successResultAsObj[cartOrder[i]].price)
      console.log(quantities[i])
      orderTotal += parseFloat(successResultAsObj[cartOrder[i]].price) * quantities[i]
    }

     cartData["orderTotal"] = orderTotal.toFixed(2)

     const compiledFunction = pug.compileFile('pug/cart.pug')
     res.end(compiledFunction({"productData":productData, "cartData": cartData,}))

 },

 rejectResult=>{

     res.end()

 })

})


router.post("/checkout", (req,res)=>{
  console.log(req.body)
  console.log(req.session.passport)

  var isMember = false
  var userInfo
  if(req.session.passport != undefined ){
    isMember = true
    
    var s1 = Queries.user.getUserInfo
    var s2 = mysql.format(s1,req.session.passport.user.user_id)
    Queries.queryResultPromiser(s2)
    .then(successfulResult=>{
      userInfo = successfulResult[0]
    })

  }

  
  if(req.body.cart == "" || req.body.cart == "{}"){
    // const compiledFunction = pug.compileFile('pug/cart.pug')
    //  res.end(compiledFunction())
    res.end("Cannot checkout with empty cart")
     return
  }

  var cart = JSON.parse(req.body.cart)
  console.log(`cart is ${(cart)}`)
  

  var cartOrder = JSON.parse(req.body.cartOrder)
  console.log(`cartOrder is ${(cartOrder)}`)

  var quantities = []

  var promoCode = req.body.promoCode
  


 var [s1, placeholders] = Queries.getProductInfo(cartOrder)

 console.log(`s1 is: ${s1}`)
 console.log(`values for placeholders are: ${placeholders}`)
 var s2 = mysql.format(s1,placeholders)
 console.log(s2)

 Queries.queryResultPromiser(s2)

 .then(successResult=>{

     console.log(successResult)

     var successResultAsObj ={}
     // stores successResult in object by cartOrder
     for (rowData in successResult){
        successResultAsObj[ successResult[rowData].id ] = successResult[rowData]
     }
     console.log(successResultAsObj)
    
    for( index in cartOrder){
      console.log(cartOrder[index])
      var pid = cartOrder[index]
      console.log(cart[pid])
      quantities.push(parseInt(cart[pid]))
    }

     var productData = successResultAsObj

     var cartData = {}
     cartData["cartOrder"] = cartOrder
     cartData["quantities"] = quantities

    var orderTotal = 0
    for (var i=0;i<cartOrder.length;i++){
      console.log(successResultAsObj[cartOrder[i]].price)
      console.log(quantities[i])
      orderTotal += parseFloat(successResultAsObj[cartOrder[i]].price) * quantities[i]
    }

     cartData["orderTotal"] = orderTotal.toFixed(2)
     const compiledFunction = pug.compileFile('pug/checkout.pug')

     var promoData = {}
     // test promo code
     if( promoCode != ""){
      let sPromo = mysql.format(Queries.promo.findPromo,[promoCode])
     console.log(`Final query: ${sPromo}`)
     Queries.queryResultPromiser(sPromo)
       .then((successResult)=>{
       // check if valid promo
       if(successResult.length < 1) {
        console.log("no promo found")
       } else{
         console.log(`promo found ${successResult[0].amount}`)
       var discount=(successResult[0].amount)
       console.log("Promo amount is: " + JSON.stringify(discount))
        // TODO check type of promo
        promoData.code = promoCode
        promoData.data = successResult[0]

        function calculateTotalPrice(productData,cartData,promoData){
          console.log(productData)
          console.log(cartData)
          console.log(promoData)
          var totalPrice = 0
          for(var i=0; i< cartData.cartOrder.length;i++){
            totalPrice += cartData.quantities[i] * productData[cartData.cartOrder[i]].price
          }
          console.log(`calculated total price is ${totalPrice}`)
          return totalPrice
        }

        var subTotal = calculateTotalPrice(productData,cartData,promoData)

        promoData.discount = (((discount/100)) * subTotal)

        if(isMember){
          console.log(`userInfo is ${JSON.stringify(userInfo)}`)
          res.end(compiledFunction({"productData":productData, "cartData": cartData,"promoData": promoData, "userInfo":userInfo}))
        }
        else{
          res.end(compiledFunction({"productData":productData, "cartData": cartData,"promoData": promoData, }))
        }
       
       }

      },
       (rejectResult)=>{
         console.log("Error occurred in promo lookup")
         // console.log(rejectResult)
        //  res.setHeader("Content-Type","application/json"); 
        //  res.statusCode = 400;
        //  res.write(JSON.stringify(rejectResult))
        res.end(compiledFunction({"productData":productData, "cartData": cartData,}))
       })
     }
     else{
       // no promo to lookup
       if(isMember){
        console.log(`userInfo is ${JSON.stringify(userInfo)}`)
        res.end(compiledFunction({"productData":productData, "cartData": cartData,"promoData": promoData, "userInfo":userInfo}))
      }
      else{
        res.end(compiledFunction({"productData":productData, "cartData": cartData,}))
      } 
       
     }


     

 },

 rejectResult=>{

     res.end()

 })

})

router.post("/preview", (req,res)=>{
  
  console.log(req.body)
  var isMember = false
  var userInfo
  if(req.session.passport != undefined){
    isMember = true
    
    var s1 = Queries.user.getUserInfo
    var s2 = mysql.format(s1,req.session.passport.user.user_id)
    Queries.queryResultPromiser(s2)
    .then(successfulResult=>{
      userInfo = successfulResult[0]
    })

  }

  var billing = {}
  billing.name = req.body["billing-name"]
  billing.address = req.body["billing-address"]
  billing.city = req.body["billing-city"]
  billing.state = req.body["billing-state"]
  billing.zip = req.body["billing-zip"]
  billing.country = req.body["billing-country"]

  var delivery = {}
  if (req.body["delivery-same-as-billing"] = "true"){
    delivery = billing
  }
  else{
    delivery.name = req.body["delivery-name"]
  delivery.address = req.body["delivery-address"]
  delivery.city = req.body["delivery-city"]
  delivery.state = req.body["delivery-state"]
  delivery.zip = req.body["delivery-zip"]
  delivery.country = req.body["delivery-country"]
  
  }
  
  console.log(billing)
  console.log(delivery)
  var email = req.body.email
  
  if(req.body.cart == "" || req.body.cart == "{}"){
    // const compiledFunction = pug.compileFile('pug/cart.pug')
    //  res.end(compiledFunction())
    res.end("Cannot checkout with empty cart")
     return
  }

  var cart = JSON.parse(req.body.cart)
  console.log(`cart is ${(cart)}`)
  

  var cartOrder = JSON.parse(req.body.cartOrder)
  console.log(`cartOrder is ${(cartOrder)}`)

  var quantities = []

  var promoCode = req.body.promoCode
  


 var [s1, placeholders] = Queries.getProductInfo(cartOrder)

 console.log(`s1 is: ${s1}`)
 console.log(`values for placeholders are: ${placeholders}`)
 var s2 = mysql.format(s1,placeholders)
 console.log(s2)

 Queries.queryResultPromiser(s2)
 .then(successResult=>{

     console.log(successResult)

     var successResultAsObj ={}
     // stores successResult in object by cartOrder
     for (rowData in successResult){
        successResultAsObj[ successResult[rowData].id ] = successResult[rowData]
     }
     console.log(successResultAsObj)
    
    for( index in cartOrder){
      console.log(cartOrder[index])
      var pid = cartOrder[index]
      console.log(cart[pid])
      quantities.push(parseInt(cart[pid]))
    }

     var productData = successResultAsObj

     var cartData = {}
     cartData["cartOrder"] = cartOrder
     cartData["quantities"] = quantities

    var orderTotal = 0
    for (var i=0;i<cartOrder.length;i++){
      console.log(successResultAsObj[cartOrder[i]].price)
      console.log(quantities[i])
      orderTotal += parseFloat(successResultAsObj[cartOrder[i]].price) * quantities[i]
    }

     cartData["orderTotal"] = orderTotal.toFixed(2)
     const compiledFunction = pug.compileFile('pug/preview.pug')

     var promoData = {}
     console.log(`promoCode is ${promoCode}`)
     // test promo code
     if( promoCode != ""){
      let sPromo = mysql.format(Queries.promo.findPromo,[promoCode])
     console.log(`Final query: ${sPromo}`)
     Queries.queryResultPromiser(sPromo)
       .then((successResult)=>{
          // check if valid promo
          if(successResult.length < 1) {
            console.log("no promo found")
            if(isMember){
              console.log(`userInfo is ${JSON.stringify(userInfo)}`)
              res.end(compiledFunction({"productData":productData, "cartData": cartData, "email":email, "billing":billing,"delivery":delivery, "userInfo":userInfo}))
            }
            else{
              res.end(compiledFunction({"productData":productData, "cartData": cartData, "email":email, "billing":billing,"delivery":delivery,}))
            }
          }
          else{
            // promo is used
            console.log(`promo found ${successResult[0].amount}`)
            var discount=(successResult[0].amount)
            console.log("Promo amount is: " + JSON.stringify(discount))
            // TODO check type of promo
            promoData.code = promoCode
            promoData.data = successResult[0]

            function calculateTotalPrice(productData,cartData,promoData){
              console.log(productData)
              console.log(cartData)
              console.log(promoData)
              var totalPrice = 0
              for(var i=0; i< cartData.cartOrder.length;i++){
                totalPrice += cartData.quantities[i] * productData[cartData.cartOrder[i]].price
              }
              console.log(`calculated total price is ${totalPrice}`)
              return totalPrice
            }

            var subTotal = calculateTotalPrice(productData,cartData,promoData)

            promoData.discount = (((discount/100)) * subTotal)
            
          
            if(isMember){
              console.log(`userInfo is ${JSON.stringify(userInfo)}`)
              res.end(compiledFunction({"productData":productData, "cartData": cartData,"promoData": promoData, "email":email, "billing":billing,"delivery":delivery, "userInfo":userInfo}))
            }
            else{
              res.end(compiledFunction({"productData":productData, "cartData": cartData,"promoData": promoData, "email":email, "billing":billing,"delivery":delivery,}))
            } 
          
          }
       

        },
       (rejectResult)=>{
         console.log("Error occurred in promo lookup")
         // console.log(rejectResult)
        //  res.setHeader("Content-Type","application/json"); 
        //  res.statusCode = 400;
        //  res.write(JSON.stringify(rejectResult))
        res.end(compiledFunction({"productData":productData, "cartData": cartData, "email":email,"billing":billing,"delivery":delivery}))
       })
     }
     else{
       // no promo to lookup
       
       if(isMember){
        console.log(`userInfo is ${JSON.stringify(userInfo)}`)
        res.end(compiledFunction({"productData":productData, "cartData": cartData, "email":email, "billing":billing,"delivery":delivery, "userInfo":userInfo}))
      }
      else{
        res.end(compiledFunction({"productData":productData, "cartData": cartData, "email":email, "billing":billing,"delivery":delivery,}))
      } 
     }
    })

})

router.post("/confirm", (req,res)=>{

  console.log(req.body)

  var parameters = {};
        parameters.to = req.body.email
        parameters.subject = 'Order Confirmation on SJSUMarket'
        parameters.text = 'Your order at SJSUMarket has been confirmed!'
        console.log('Confirmation email has been sent')
        Email.email(parameters)
  
  var isMember = false
  var userInfo
  // check if user or guest
  if(req.session.passport != undefined){
    isMember = true
    
    var s1 = Queries.user.getUserInfo
    var s2 = mysql.format(s1,req.session.passport.user.user_id)
    Queries.queryResultPromiser(s2)
    .then(successfulResult=>{
      userInfo = successfulResult[0]
    })

  }

  
  var cart = JSON.parse(req.body.cart)
  console.log(`cart is ${(cart)}`)
  var cartOrder = JSON.parse(req.body.cartOrder)
  console.log(`cartOrder is ${(cartOrder)}`)

  var quantities = []
  var promoCode = req.body.promoCode
  
  // build query to get product data
 var [s1, placeholders] = Queries.getProductInfo(cartOrder)
 console.log(`s1 is: ${s1};\n values for placeholders are: ${placeholders}`)
 var s2 = mysql.format(s1,placeholders)
 console.log(`s2 is ${s2}`)

 Queries.queryResultPromiser(s2)

 .then(successResult=>{
  // got product data
     console.log(successResult)

     var successResultAsObj ={}
     // stores successResult in object by cartOrder
     for (rowData in successResult){
        successResultAsObj[ successResult[rowData].id ] = successResult[rowData]
     }
     console.log(successResultAsObj)
    
     // stores quantities by cartOrder
    for( index in cartOrder){
      console.log(cartOrder[index])
      var pid = cartOrder[index]
      console.log(cart[pid])
      quantities.push(parseInt(cart[pid]))
    }

     var productData = successResultAsObj

     var cartData = {}
     

    var firstProductID = cartOrder.shift()
    var firstProductQuantity = quantities.shift()

    let s3 = mysql.format(Queries.cart.createCart, [productData[firstProductID].price, firstProductQuantity, firstProductID, ]);
    
  console.log(`Final query: ${s3}`)
  // insert first item into cart
  Queries.queryResultPromiser(s3)
    .then((result) => {
      // first item inserted into cart
      console.log("first item inserted into cart table")

    }, function rejectedPromise (err) {
      // error when trying to insert first item into cart
      console.log(err)
      res.end("error in initial cart entry")
    })

    // get cart ID from first insertion
    var cartID 
    let s6 = mysql.format(Queries.cart.lastinsertedid,[])
    Queries.queryResultPromiser(s6)
    .then((result) => {
      // got cart ID from first insertion
      console.log(`result is ${JSON.stringify(result)}`)
      cartID = result[0].cart_id
      console.log(`cartID is ${cartID}`)

      cartData["cartOrder"] = cartOrder
      cartData["quantities"] = quantities

      

      if( cartOrder.length == 0){
        if(isMember){
          
          let userid = userInfo.id
          let name = req.body["delivery-name"]
          let date= new Date();

          let payment = req.body.payment  || "CREDIT";
          let address = req.body["delivery-address"]
          let city = req.body["delivery-city"]
          let state = req.body["delivery-state"]
          let zip = req.body["delivery-zip"]
          let country = req.body["delivery-country"]
          let promo = req.body.promo;//from promo_code
          let status = "PROCESSING";//status
          let s7 = mysql.format(Queries.order.create_order, [, name, status,payment,address,city, state, zip, country, cartID,userid, date, promo]);
          console.log(`s7 is ${s7}`)
          Queries.queryResultPromiser(s7)
          .then((result) => {
          console.log(result)
          console.log("Order created")
          }, function rejectedPromise (err) {
          console.log(err)
          })
        }
        else{
          // guest
          let name = req.body["delivery-name"]
          let date= new Date();
          let email = req.body.email;
          let payment = req.body.payment || "CREDIT";
          let address = req.body["delivery-address"]
          let city = req.body["delivery-city"]
          let state = req.body["delivery-state"]
          let zip = req.body["delivery-zip"]
          let country = req.body["delivery-country"]
          let promo = req.body.promo;//from promo_code
          let status = "PROCESSING";//status
          let s9 = mysql.format(Queries.guest_order.create_guestorder, [name,status,payment,address,city, state, zip, country, cartID, email, date, ]);
          console.log(`s9 is ${s9}`)
          Queries.queryResultPromiser(s9)
          .then((result) => {
          console.log(result)
          console.log("Order created")
          }, function rejectedPromise (err) {
          console.log(err)
          })
        }
        return
      }




        // insert rest of items into cart
      var [s4, placeholders] = Queries.cart.insert(cartData.cartOrder, cartID , cartData.quantities,productData);
      console.log(`s4 is ${s4}`)
      console.log(`placeholders is ${placeholders}`)
      var s5 = mysql.format(s4, placeholders)
      console.log(`s5 is ${s5}`)
      Queries.queryResultPromiser(s5)
        .then(successResult=>{
          // inserted rest of items into cart
        console.log(successResult)


        if(isMember){
          
          let userid = userInfo.id
          let name = req.body["delivery-name"]
          let date= new Date();

          let payment = req.body.payment  || "CREDIT";
          let address = req.body["delivery-address"]
          let city = req.body["delivery-city"]
          let state = req.body["delivery-state"]
          let zip = req.body["delivery-zip"]
          let country = req.body["delivery-country"]
          let promo = req.body.promo;//from promo_code
          let status = "PROCESSING";//status
          let s7 = mysql.format(Queries.order.create_order, [, name, status,payment,address,city, state, zip, country, cartID,userid, date, promo]);
          console.log(`s7 is ${s7}`)
          Queries.queryResultPromiser(s7)
          .then((result) => {
          console.log(result)
          console.log("Order created")
          }, function rejectedPromise (err) {
          console.log(err)
          })
        }
        else{
          // guest
          let name = req.body["delivery-name"]
          let date= new Date();
          let email = req.body.email;
          let payment = req.body.payment || "CREDIT";
          let address = req.body["delivery-address"]
          let city = req.body["delivery-city"]
          let state = req.body["delivery-state"]
          let zip = req.body["delivery-zip"]
          let country = req.body["delivery-country"]
          let promo = req.body.promo;//from promo_code
          let status = "PROCESSING";//status
          let s9 = mysql.format(Queries.guest_order.create_guestorder, [name,status,payment,address,city, state, zip, country, cartID, email, date, ]);
          console.log(`s9 is ${s9}`)
          Queries.queryResultPromiser(s9)
          .then((result) => {
          console.log(result)
          console.log("Order created")
          }, function rejectedPromise (err) {
          console.log(err)
          })
        }
        
      })

  })
 },

 rejectResult=>{
  // error getting product data
     console.log(rejectResult)

     res.end("invalid")

 })



  


  const compiledFunction = pug.compileFile('pug/confirm.pug')
  res.end(compiledFunction())

})

router.get("/order-history", authenticationMiddleware(), (req,res)=>{

  var orders = []
  var products = new Set()

  // get orders for this user
  var uid = req.user.user_id
  console.log(uid)
  var s1 = mysql.format(Queries.order.get_users_order,uid)
  console.log(`s1 is ${s1}`)
  Queries.queryResultPromiser(s1)
  .then( orderSuccessResult=>{
    console.log(orderSuccessResult)


    var orderCounter=0

    function promise(counter, max){
      return new Promise((resolve,reject)=>{
        if (counter == (max)){
          resolve(orders)
        }
        else{
          var order = {}
          order.data = orderSuccessResult[counter]
          orders.push(order)
    
          var cartID = order.data.cart_id
          console.log(`orderCOunter is ${orderCounter}`)
    
          // get carts ie order items
          var s2 = mysql.format(Queries.cart.getCart,cartID)
          console.log(`s2 is ${s2}`)
          Queries.queryResultPromiser(s2)
          .then( successResult =>{
            console.log(successResult)
            order.carts = successResult
            // console.log(`orders is ${JSON.stringify(orders)}`)
    
            // for(var j=0; j<successResult.length;j++){
            //   products.add(successResult[j].product_id)
            //   console.log("adding product")
            // }
            console.log(products)
            resolve( promise(counter+1,max))
          })
        }
      })
    }

    if(orderSuccessResult.length == 0){
      
      const compiledFunction = pug.compileFile('pug/order-history.pug')
      res.end(compiledFunction({}))
      return
    }
    
    promise(0,orderSuccessResult.length)
    .then(x=>{
      console.log(`x is ${JSON.stringify(x)}`)
      
      // collect all product ids
      var products = new Set()
      for(var i=0;i<x.length;i++){
        var carts = x[i].carts
        console.log(x[i].carts)
        for(var j=0;j<carts.length;j++){
          console.log(carts[j].product_id)
          products.add(carts[j].product_id)
        }
      }

      console.log(products)
      var productsArray = Array.from(products)

      var [s1, placeholders] = Queries.getProductInfo(productsArray)

      console.log(`s1 is: ${s1}`)
      console.log(`values for placeholders are: ${placeholders}`)
      var s3 = mysql.format(s1,placeholders)
      console.log(s3)
     
      Queries.queryResultPromiser(s3)
      .then(successResult=>{
            
        var successResultAsObj ={}
        // stores successResult in object by cartOrder
        for (rowData in successResult){
            successResultAsObj[ successResult[rowData].id ] = successResult[rowData]
        }
        console.log(successResultAsObj)

        var productData = successResultAsObj

        console.log(orders)
        console.log(productData)

        
        const compiledFunction = pug.compileFile('pug/order-history.pug')
        res.end(compiledFunction({"orders":orders, "productData":productData}))


      })
     


      
    })


    // for(var orderCounter=0;orderCounter<orderSuccessResult.length;orderCounter++){
    //   var order = {}
    //   order.data = orderSuccessResult[orderCounter]
    //   orders.push(order)

    //   var cartID = order.data.cart_id
    //   console.log(`orderCOunter is ${orderCounter}`)

    //   // get carts ie order items
    //   var s2 = mysql.format(Queries.cart.getCart,cartID)
    //   console.log(`s2 is ${s2}`)
    //   Queries.queryResultPromiser(s2)
    //   .then( successResult =>{
    //     console.log(successResult)
    //     order.carts = successResult
    //     console.log(`orders is ${JSON.stringify(orders)}`)

    //     for(var j=0; j<successResult.length;j++){
    //       products.add(successResult[j].product_id)
    //     }
    //     console.log(products)
    //   })
    // }
    
  })
  

  // const compiledFunction = pug.compileFile('pug/order-history.pug')
  // res.end("compiledFunction()")

})

router.get("/edit-account", authenticationMiddleware(), (req,res)=>{
  

  console.log(req.body)
  const compiledFunction = pug.compileFile('pug/edit-account.pug')
  res.end(compiledFunction())

})

router.get("/about-us", (req,res)=>{
  

  console.log(req.body)
  const compiledFunction = pug.compileFile('pug/about-us.pug')
  res.end(compiledFunction())

})

router.get("/test", (req,res)=>{
  var x = url.parse(req.url)
  console.log(req)
  console.log(x)
  console.log(querystring.parse(x.query))
  res.end()
})

router.get("/products/:productID", (req,res)=>{
  const compiledFunction = pug.compileFile('pug/productDetailPage.pug')

  console.log(req.params.productID)
  var s1 = Queries.product.getById
  var s2 = mysql.format(s1,req.params.productID)
  Queries.queryResultPromiser(s2)
  .then(successResult=>{
      console.log(successResult)
      if (successResult.length == 0){
        res.statusCode = 404
        res.end()
        return
      }
      res.setHeader("Content-Type","text/html"); 
      var compiled = compiledFunction({product:successResult[0]})
      
      res.end(compiled)
  },
  rejectResult=>{
      res.end()
  })
})



 router.get('/api', function (req, res) {
   console.log('api requested')
   let x = JSON.stringify({
     firstName: 'hello',
     lastName: 'world'
   })
   res.setHeader('Content-Type', 'application/json')

   res.end(x)
 })

module.exports = router
