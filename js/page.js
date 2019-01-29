  
    // These lines of code register an html element, in this case, a button, with a corresponding function that will be run when the button is clicked. 
    document.querySelector("div.signup button").addEventListener("click", signUp)
    document.querySelector("div.login button").addEventListener("click", login)
    document.querySelector("div.logout button").addEventListener("click", logout)
      
    /* 
    EXAMPLE HTML JAVASCRIPT FUNCTION LINK
    document.querySelector("div.SAMPLE-CLASS button").addEventListener("click", doSomething)
    */


    /* EXAMPLE JAVASCRIPT FUNCTION
    function doSomething() {
      var myForm = document.querySelector("div.SAMPLE-CLASS form")
      var responseFooter = document.querySelector("div.SAMPLE-CLASS footer section.response-section")
      console.log(myForm)
      console.log(responseFooter)
      var formData = new FormData(myForm)
      // POST THE FORM DATA USING METHOD OF CHOOSING ie fetch/axios
      axios({
        method: 'post',
        url: '/SOME-PATH-ON-SERVER',
        data: formData,
        config: { headers: { 'Content-Type': 'multipart/form-data' } }
      })
      .then( (server_response)=>{
        console.log(server_response)
        console.log(server_response.data)
        // ASSUMING SERVER SENDS A RESPONSE BACK
        response.innerHTML = server_response.status + "\n" + JSON.stringify(server_response.data)
        // OPTIONALLY DO SOMETHING WITH RESPONSE TO SERVER
      })
    }
    */






  /* POSSIBLE DEPRECATED EXAMPLE
      function getRecoveryEmailAsJSONObject() {
      var myForm = document.getElementById('recover-password-email-form');
      console.log(myForm)
      var formData = new FormData(myForm)
      return formData

    }

    // This function uses fetch to make a http POST request that contains the form data, and sends the request to the server
    function postRecoveryData() {
      url = "/recovery"
      console.log("hello")
      data = getRecoveryEmailAsJSONObject()
      console.log(data)
      // Default options are marked with *
      return fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        // headers: {
        //     "Content-Type": "application/json; charset=utf-8",
        //     // "Content-Type": "application/x-www-form-urlencoded",
        // },
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        body: data, // body data type must match "Content-Type" header
      })
        .then(response => {
          let section = document.getElementById("recover-password-response")
          section.innerHTML = ` ${response.status} ${response.statusText}`
          response.json()  // parses response to JSON
            // might not be needed if no json returned in response

            .then(body => {
              // doesnt get here when theres no json response above
              console.log("world")

              if (response.status != 200) {
                console.log("error")
              }
            })
        });
    }

  */

  function postRecoveryData() {
    url = "/recovery"
    console.log("hello")
    myForm = document.querySelector("div.recovery form")

    // https://triangle717.wordpress.com/2015/12/14/js-avoid-duplicate-listeners/
    myForm.addEventListener('submit', preventAutomaticGETRequestForTypeEqualsSubmit)
    // myForm.removeEventListener('submit', preventAutomaticGETRequestForTypeEqualsSubmit)
    if (!myForm.checkValidity()) {
      return
    }
    console.log("form valid")
      console.log(myForm)
      formData = new FormData(myForm)
    console.log(formData)
    var response = document.querySelector("div.recovery footer section.response-section")
    var responseFooter = document.querySelector("div.recovery footer section.response-section")
    console.log(responseFooter)

    // Default options are marked with *
    return fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
      //     "Content-Type": "application/json; charset=utf-8",
          // "Content-Type": "application/x-www-form-urlencoded",
          // "Content-Type": 'multipart/form-data', // dont need this in multi-form bc alreadeey set
          // https://stackoverflow.com/questions/35192841/fetch-post-with-multipart-form-data#35206069
      },
      redirect: "follow", // manual, *follow, error
      referrer: "no-referrer", // no-referrer, *client
      body: formData, // body data type must match "Content-Type" header
    })
      .then(server_response => {
        response.innerHTML = ` ${server_response.status} ${server_response.statusText}`
        console.log(server_response.body)
        // server_response.json()  // parses response to JSON
        //   // might not be needed if no json returned in response
        //   .then(body => {
        //     // doesnt get here when theres no json response above
        //     console.log("world")
        //     if (server_response.status != 200) {
        //       console.log("error")
        //     }
        //   })
      });
  }


    // This function uses axios, an external npm module to create the POST request and send the form data to the server.
    function signUp() {
      var myForm = document.querySelector("div.signup form")
      var response = document.querySelector("div.signup footer section.response-section")
      
        //Rudimentary checks to ensure that these signup fields (email, username, password) are not empty.
        if (myForm.email.value == "")           
        { 
          window.alert("Please enter your email."); 
          myForm.email.focus(); 
          return false; 
        } 

        if (myForm.username.value == "")                 
        { 
          window.alert("Please enter your username."); 
          myForm.username.focus(); 
          return false; 
        } 

        if (myForm.password.value == "")                 
        { 
          window.alert("Please enter your password."); 
          myForm.password.focus(); 
          return false; 
        } 
      
      console.log(myForm)
      var formData = new FormData(myForm)
      axios({
        method: 'post',
        url: '/signup',
        data: formData,
        config: { headers: { 'Content-Type': 'multipart/form-data' } }
      })
      .then( (server_response)=>{
        // response.innerHTML = JSON.parse(server_response.data)
        console.log(server_response)
        console.log(server_response.data)
        response.innerHTML = server_response.status + "\n" + JSON.stringify(server_response.data)
        // `Status ${server_response.status}
        if (server_response.status == 400){

        }

        else {
                location.reload();
        }
      })
      .catch(function(error){
        if(error.response){
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
          response.innerHTML = error.response.status + "\n" + error.response.data
        }
      })
    }


    function login() {

      var myForm = document.querySelector("div.login form")
      myForm.addEventListener('submit', function(e){
        e.preventDefault()
      })
        if (! myForm.checkValidity()){
          return
        }
       console.log("form valid")


      var response = document.querySelector("div.login footer section.response-section")
      console.log(myForm)
      var formData = new FormData(myForm)
      axios({
        method: 'post',
        url: '/login',
        data: formData,
        config: { headers: { 'Content-Type': 'multipart/form-data' } }
      })
      .then( (server_response)=>{
        // response.innerHTML = JSON.parse(server_response.data)
        console.log(server_response)
        console.log(server_response.data)
        response.innerHTML = server_response.status + "\n" + JSON.stringify(server_response.data)
        location.reload();
        // `Status ${server_response.status}
        //location.reload(forceGet);
      })
      .catch(function(error){
        if(error.response){
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
          response.innerHTML = error.response.status + "\n" + error.response.data
        }
      })
    }


    function logout() {
      var myForm = document.querySelector("div.logout form")
      myForm.addEventListener('submit', function(e){
        e.preventDefault()
      })
        if (! myForm.checkValidity()){
          return
        }
       console.log("form valid")
       location.reload();


      var response = document.querySelector("div.logout footer section.response-section")
      console.log(myForm)
      var formData = new FormData(myForm)
      axios({
        method: 'get',
        url: '/logout',
        data: formData,
        config: { headers: { 'Content-Type': 'multipart/form-data' } }
      })
      .then( (server_response)=>{
        // response.innerHTML = JSON.parse(server_response.data)
        console.log(server_response)
        console.log(server_response.data)
        response.innerHTML = server_response.status + "\n" + JSON.stringify(server_response.data)
        // `Status ${server_response.status}
      })
      .catch(function(error){
        if(error.response){
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
          response.innerHTML = error.response.status + "\n" + error.response.data
        }
      })
    }


  

  

  function authentication() {
     axios({
       method: 'get',
       url: '/authentication',
       //config: {headers: {'Content-Type': 'multipart/form-data'}}
     })
     .then((server_response) => {
       console.log(server_response);
       if(server_response.data === true) {
           console.log("IT WoRKS");
          document.getElementById("accountPage").style.display = "";
      document.getElementById("orderHistoryPage").style.display = "";
      document.getElementById("signIn").style.display="none";
      document.getElementById("signOut").style.display="";
       }
       else {
           console.log("It dontwork");
           document.getElementById("accountPage").style.display = "none";
      document.getElementById("orderHistoryPage").style.display = "none";
      document.getElementById("signIn").style.display="";
      document.getElementById("signOut").style.display="none";
       }
     })
   }

   authentication();

  
    
    


    <!-- js-files -->
    <!-- jquery -->
     src="/public/js/jquery-2.1.4.min.js">
    <!-- //jquery -->

    <!-- popup modal (for signin & signup)-->
     src="/public/js/jquery.magnific-popup.js">
    
      $(document).ready(function () {
        $('.popup-with-zoom-anim').magnificPopup({
          type: 'inline',
          fixedContentPos: false,
          fixedBgPos: true,
          overflowY: 'auto',
          closeBtnInside: true,
          preloader: false,
          midClick: true,
          removalDelay: 300,
          mainClass: 'my-mfp-zoom-in'
        });

      });
    
    <!-- Large modal -->
    <!-- 
      $('#').modal('show');
     -->
    <!-- //popup modal (for signin & signup)-->

    <!-- cart-js -->
     src="/public/js/minicart.js">
    
      paypalm.minicartk.render(); //use only unique class names other than paypalm.minicartk.Also Replace same class name in css and minicart.min.js

      paypalm.minicartk.cart.on('checkout', function (evt) {
        var items = this.items(),
          len = items.length,
          total = 0,
          i;

        // Count the number of each item in the cart
        for (i = 0; i < len; i++) {
          total += items[i].get('quantity');
        }

        if (total < 3) {
          alert('The minimum order quantity is 3. Please add more to your shopping cart before checking out');
          evt.preventDefault();
        }
      });
    
    <!-- //cart-js -->

    <!-- price range (top products) -->
     src="/public/js/jquery-ui.js">
    
      //<![CDATA[ 
      $(window).load(function () {
        $("#slider-range").slider({
          range: true,
          min: 0,
          max: 9000,
          values: [50, 6000],
          slide: function (event, ui) {
            $("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
          }
        });
        $("#amount").val("$" + $("#slider-range").slider("values", 0) + " - $" + $("#slider-range").slider("values", 1));

      }); //]]>
    
    <!-- //price range (top products) -->

    <!-- flexisel (for special offers) -->
     src="/public/js/jquery.flexisel.js">
    
      $(window).load(function () {
        $("#flexiselDemo1").flexisel({
          visibleItems: 3,
          animationSpeed: 1000,
          autoPlay: true,
          autoPlaySpeed: 3000,
          pauseOnHover: true,
          enableResponsiveBreakpoints: true,
          responsiveBreakpoints: {
            portrait: {
              changePoint: 480,
              visibleItems: 1
            },
            landscape: {
              changePoint: 640,
              visibleItems: 2
            },
            tablet: {
              changePoint: 768,
              visibleItems: 2
            }
          }
        });

      });
    
    <!-- //flexisel (for special offers) -->

    <!-- password-script -->
    
    <!-- //password-script -->



    <!-- smoothscroll -->
     src="/public/js/SmoothScroll.min.js">
    <!-- //smoothscroll -->

    <!-- start-smooth-scrolling -->
     src="/public/js/move-top.js">
     src="/public/js/easing.js">
    
      jQuery(document).ready(function ($) {
        $(".scroll").click(function (event) {
          event.preventDefault();

          $('html,body').animate({
            scrollTop: $(this.hash).offset().top
          }, 1000);
        });
      });
    
    <!-- //end-smooth-scrolling -->

    <!-- smooth-scrolling-of-move-up -->
    
    <!-- //smooth-scrolling-of-move-up -->

    <!-- for bootstrap working -->
     src="/public/js/bootstrap.js">
    <!-- //for bootstrap working -->
    <!-- //js-files -->
