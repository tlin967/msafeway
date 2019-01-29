 document.querySelector("div.Edit button").addEventListener("click", Edit)
 document.querySelector("div.Editv3 button").addEventListener("click", Editv3)

 //Edit changes entire account
  function Edit() {
    var myForm = document.querySelector("div.Edit form")
    var response = document.querySelector("div.Edit footer section.response-section")


    console.log(myForm)
    var formData = new FormData(myForm)
    axios({
      method: 'post',
      url: '/edit-account',
      data: formData,
      config: { headers: { 'Content-Type': 'multipart/form-data' } }
    })
    .then((server_response)=>{
      // response.innerHTML = JSON.parse(server_response.data)
      console.log(server_response)
      console.log(server_response.data)
      response.innerHTML = server_response.status + "\n" + JSON.stringify(server_response.data)
    })
     document.querySelectorAll("body > div.content > div.container > div.Edit.wrapper input").forEach(ele => { ele.value = ""})
     document.querySelector(".Edit.wrapper .post section.response-section").innerHTML = "Account Updated!"

  }

  // Editv3 changes address
  function Editv3() {
    var myForm = document.querySelector("div.Editv3 form")
    var response = document.querySelector("div.Editv3 footer section.response-section")


     console.log(myForm)
    var formData = new FormData(myForm)
    axios({
      method: 'post',
      url: '/edit-address',
      data: formData,
      config: { headers: { 'Content-Type': 'multipart/form-data' } }
    })
    .then( (server_response)=>{
      // response.innerHTML = JSON.parse(server_response.data)
      console.log(server_response)
      console.log(server_response.data)
      response.innerHTML = server_response.status + "\n" + JSON.stringify(server_response.data)
    })
    document.querySelectorAll("body > div.content > div.container > div.Editv3.wrapper input").forEach(ele => { ele.value = ""})
     document.querySelector(".Editv3.wrapper .post section.response-section").innerHTML = "Address Updated!"

  }