
const mysql = require('mysql')
const config = require('./config.js')
//let connection = mysql.createConnection(config)

var connection;
function handleDisconnect() {
    connection = mysql.createConnection(config);  // Recreate the connection, since the old one cannot be reused.
    connection.connect( function onConnect(err) {   // The server is either down
        if (err) {                                  // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 10000);    // We introduce a delay before attempting to reconnect,
        }                                           // to avoid a hot loop, and to allow our node script to
    });                                             // process asynchronous requests in the meantime.
                                                    // If you're also serving http, display a 503 error.
    connection.on('error', function onError(err) {
        console.log('Connection lost. :(');
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {   // Connection to the MySQL server is usually
            handleDisconnect();    
            console.log('Another connection is created. :)')                     // lost due to either server restart, or a
        } else {                                        // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}
handleDisconnect();


module.exports = {
  sql: `select * from pets where  age>4`,
  sql2: 'select * from pets where  name=?',

  user: {
    checkEmailExists: 'select * from user where email=?',
    checkUserNameExists: 'select id from user where user_name=?',
    create: 'insert into heroku_c26fdad3f72b054.user (id,user_name,password,email) values (null,?,?,?)',
    session: 'select LAST_INSERT_ID() as user_id',
    authenticate: 'select id, password from user where email=?',
    editAddress: 'UPDATE User SET street_address= ?, city=? , state= ?, country= ?, zip =?  WHERE id=?',
    edit: 'UPDATE User SET user_name=?, password=? WHERE id=?',
    getUserInfo: 'select * from heroku_c26fdad3f72b054.user where id=?',
    recovery: 'UPDATE user SET password = ? WHERE email = ?',
    
  },
  

  cart: {
    lastinsertedid: 'select LAST_INSERT_ID() as cart_id',
    createCart: 'insert into heroku_c26fdad3f72b054.cart(price, quantity, product_id, id) values (?,?,?,null)',
    insert: function (CartOrder,cartID, quantity, productData ) {

       //param = { cartOrder: [pID1, pID2, pID3] , quantities:[2,5,1] , productData:{ pID1:{price: 3.99, quantity: 2}, pID2:{price: 29.99, quantity: 5}, pID3;{price: 6.99, quantity: 1}  }}

       const sql = 'insert into cart (price, quantity, product_id, id) values'        
       var values=[];
       var stringVal = [];//array of strings
       var cart_count =CartOrder.length;
       for (var i = 0; i < cart_count; i++) {

         if (typeof CartOrder[i] !== 'undefined' && CartOrder[i] !== '') {

           stringVal.push(" ( ? ")
           stringVal.push("? ")
           stringVal.push("? ")
           stringVal.push("?)")
           values.push(parseFloat(productData[CartOrder[i]].price))
           values.push(parseInt(quantity[i]))
           values.push(parseInt(CartOrder[i]))
           values.push(parseInt(cartID))
           //console.log(stringVal[i])
             }
         }
       if(cart_count == 0){
           values = [];
        }
   //var valuesClause = stringVal.length ? stringVal.join(", ") : ""

   return [sql + stringVal, values];
   },
    getCart: ' select * from heroku_c26fdad3f72b054.cart where id = ?',

  },
  guest_order:{
    create_guestorder: 'insert into heroku_c26fdad3f72b054.guest_order(name,status, paymentInfo, delivery_street_address, delivery_city, delivery_state, delivery_zip, delivery_country, cart_id, email, date, id) values (?,?,?,?,?,?,?,?,?,?,?,null)'
  },
  order: {
    create_order: 'insert into heroku_c26fdad3f72b054.order(id, name, status, paymentInfo, delivery_street_address, delivery_city, delivery_state, delivery_zip, delivery_country, cart_id, user_id, date, promo_id) values (?,?,?,?,?,?,?,?,?,?,?,?,?)',
    get_users_order: ' select * from heroku_c26fdad3f72b054.order where user_id = ?'

  },
  product: {
    getCategory: "SELECT * FROM product WHERE category LIKE ?",
    getName: "SELECT * FROM product WHERE name LIKE ?",
    getById: "select * from product where id=?",
  },

  filters: {
    filterByPrice1: "SELECT * FROM product WHERE category LIKE ? OR name LIKE ? AND price < 1",
    filterByPrice2: "SELECT * FROM product WHERE category LIKE ? OR name LIKE ? AND price >= 1 AND < 10",
    filterByPrice3: "SELECT * FROM product WHERE category LIKE ? OR name LIKE ? price >= 10 AND < 50",
    filterByPrice4: "SELECT * FROM product WHERE category LIKE ? OR name LIKE ? price >= 50",
  },


  search: function (params={}) {
    // Example parameter: { name: "mint", category: "baby", sortByAsc: true,  priceGreaterThan: 2, priceLessThan: 5 }
    /*
      from StackOverflow, Jordan Running,
      https://stackoverflow.com/questions/31822891/how-to-build-dynamic-query-by-binding-parameters-in-node-js-sql#31823325
      
    */
    // console.log(params)

    const sql = "select * from product"

    var conditions = [];
    var values = [];
    var sortByClause = "order by name";
    var pageNumber = 0;
    var resultsPerPage = 10;

    // WHERE/FILTER CLAUSE
    if (typeof params.searchTerm !== 'undefined' && params.searchTerm !== '') {
      conditions.push("name like ?");
      values.push("%" + params.searchTerm + "%");
    }

    if (typeof params.category !== 'undefined' && params.category !== '') {
      conditions.push("category like ?");
      values.push("%" + params.category + "%");
    }

    if (typeof params.priceGreaterThan !== 'undefined' && params.priceGreaterThan !== '') {
      conditions.push("price > ?");
      values.push(params.priceGreaterThan);
    }

    if (typeof params.priceLessThan !== 'undefined' && params.priceLessThan !== '') {
      conditions.push("price < ?");
      values.push(params.priceLessThan);
    }

    var whereClause = conditions.length ? conditions.join(' AND ') : '1'
    // SORT BY

    if (typeof params.sortBy !== 'undefined' && params.sortBy !== '') {
      switch (params.sortBy) {
        case ("Price Ascending"):
          sortByClause = "order by price";
          break
        case ("Price Descending"):
          sortByClause = "order by price desc"
          break
        case ("Name Ascending"):
        sortByClause = "order by name";
        break
        case("Name Descending"):
        sortByClause = "order by name desc";
        break
        case("Category Ascending"):
        sortByClause = "order by category";
        break
        case("Category Descending"):
        sortByClause = "order by category desc";
        break
      }
    }

    // PAGINATION
    if (typeof params.pageNumber !== 'undefined' && params.pageNumber !== '') {
      pageNumber = params.pageNumber;
    }
    if (typeof params.resultsPerPage !== 'undefined' && params.resultsPerPage !== '') {
      resultsPerPage = params.resultsPerPage;
    }

    paginationClause = "limit " + resultsPerPage + " offset " + (pageNumber * resultsPerPage)

    // PUTTING QUERY TOGETHER


    console.log(whereClause + " " + sortByClause + " " + paginationClause)
    console.log(values)

    return [sql + " where " + whereClause + " " + sortByClause + " " + paginationClause, values]

  },
  getCount: function (params={}) {
    // Example parameter: { name: "mint", category: "baby", sortByAsc: true,  priceGreaterThan: 2, priceLessThan: 5 }
    /*
      from StackOverflow, Jordan Running,
      https://stackoverflow.com/questions/31822891/how-to-build-dynamic-query-by-binding-parameters-in-node-js-sql#31823325
      
    */
    // console.log(params)
    console.log("getCount")
    const sql = "select count(*) from product"

    var conditions = [];
    var values = [];
    var sortByClause = "order by name";
    var pageNumber = 0;
    var resultsPerPage = 10;

    // WHERE/FILTER CLAUSE
    if (typeof params.searchTerm !== 'undefined' && params.searchTerm !== '') {
      conditions.push("name like ?");
      values.push("%" + params.searchTerm + "%");
    }

    if (typeof params.category !== 'undefined' && params.category !== '') {
      conditions.push("category like ?");
      values.push("%" + params.category + "%");
    }

    if (typeof params.priceGreaterThan !== 'undefined' && params.priceGreaterThan !== '') {
      conditions.push("price > ?");
      values.push(params.priceGreaterThan);
    }

    if (typeof params.priceLessThan !== 'undefined' && params.priceLessThan !== '') {
      conditions.push("price < ?");
      values.push(params.priceLessThan);
    }

    var whereClause = conditions.length ? conditions.join(' AND ') : '1'
    // SORT BY

    if (typeof params.sortBy !== 'undefined' && params.sortBy !== '') {
      switch (params.sortBy) {
        case ("Price Ascending"):
          sortByClause = "order by price";
          break
        case ("Price Descending"):
          sortByClause = "order by price desc"
          break
        case ("Name Ascending"):
        sortByClause = "order by name";
        break
        case("Name Descending"):
        sortByClause = "order by name desc";
        break
        case("Category Ascending"):
        sortByClause = "order by category";
        break
        case("Category Descending"):
        sortByClause = "order by category desc";
        break
      }
    }

    // PUTTING QUERY TOGETHER
    console.log(whereClause + " " + sortByClause + " ")
    console.log(values)

    return [sql + " where " + whereClause + " " + sortByClause + " ", values]

  },

  getProductInfo: function (ids) {

    const sql = "SELECT * FRom product WHERE "
 
    var conditions = [];
 
    var values = [];
    console.log(ids.length)
 
    for (var i = 0; i < ids.length; i++) {
 
      if (typeof ids[i] !== 'undefined' && ids[i] !== '') {
 
        conditions.push("id = ?");
 
        values.push(ids[i]);
 
      } if (ids.length == 0) {
 
        conditions.push("is null");
 
      }
 
    }
 
    var whereClause = conditions.length ? conditions.join(' OR ') : 'IS NULL'
 
    return [sql + whereClause, values];
 
  },

  promo: {
    findPromo: 'select amount from promo where promo_code=?'
  },

  /**
 * Returns the result of a sql query as a promise.
 * onPromiseSuccess is function callback that is run on successful promise
 * onPromiseFailure is function callback that is run when promise failed
 * The name and parameter name for these callback functions does not matter.
 *
 * Example of use:
 *
 * var queryPromise = queryResultPromiser(some_query)
 * .then(
 *  function onPromiseSuccess(value_returned_when_promise_successful){
 *      // do stuff
 *  },
 *  function onPromiseFailure(value_returned_when_promise_failed){
 *      // do stuff
 *  }
 * )
 *

 * @param {query} query
 */
  queryResultPromiser: function queryResultPromiser (query) {
    return new Promise((resolve, reject) => {
      connection.query(query, (error, results, fields) => {
        console.log('query being processed')
        if (error) {
          // return console.error(error.message)
          reject(error)
        }
        resolve(results)
      })
    })
  }
}
