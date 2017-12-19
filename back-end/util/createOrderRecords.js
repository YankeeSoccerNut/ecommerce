let moment = require('moment');

function createOrderRecords(connection, userToken){

console.log ("in createOrderRecords....userToken:\n", userToken);
// Retrieve items from given user's cart....
      // - orders
  const getItemsQuery = `SELECT MAX(users.id) as id, MAX(users.cid) as cid, MAX(cart.productCode) as productCode, MAX(products.buyPrice) as buyPrice, COUNT(cart.productCode) as quantity FROM users
    INNER JOIN cart ON users.id = cart.uid
    INNER JOIN products ON cart.productCode = products.productCode
    WHERE token = ?
    GROUP BY users.id, users.cid, cart.productCode`;

  connection.query(getItemsQuery, [userToken], (error, results)=>{

    if (error){
      console.log("error getting cart!")
      console.log(error);
      return {msg: 'Fail'}
    };

    console.log("Got cart!...\n", results);

    const customerId = results[0].cid;
    const insertIntoOrders = `INSERT INTO orders
      (orderDate,requiredDate,comments,status,customerNumber)
      VALUES
      (?,?,'Website Order','Paid',?)`;

      let gregToday = moment().format('YYYY-MM-DD');

      connection.query(insertIntoOrders,[gregToday,gregToday,customerId],(error2,results2)=>{

        if(error2){
          console.log("error inserting orders");
          console.log(error2)
          return {msg: 'Fail'};
        };

        console.log("Inserted into orders...\n", results2);

        const newOrderNumber = results2.insertId;
        // Each row has the uid, the productCOde, and the price
        // map through this array, and add each one to the orderdetails table

        // Set up an array to stash our promises inside of
        // After all the promises have been created, we wil run .all on this thing
        var orderDetailPromises = [];
        // Loop through all the rows in results2, which is...
        // a row for every element in the users cart.
        // Each row contains: uid, productCode,BuyPrice
        // Call the one we're on, "cartRow"
        results.map((cartRow, index)=>{
          // Set up an insert query to add THIS product to the orderdetails table
          console.log(cartRow);
          var insertOrderDetail = `INSERT INTO orderdetails
            (orderNumber,productCode,quantityOrdered,priceEach,orderLineNumber)
            VALUES
            (?,?,?,?,?)`
          // Wrap a promise around our query (because queries are async)
          // We will call resolve if it succeeds, call reject if it fails
          // Then, push the promise onto the array above
          // So that when all of them are finished, we know it's safe to move forward

          const aPromise = new Promise((resolve, reject) => {
            connection.query(insertOrderDetail,[newOrderNumber,cartRow.productCode,cartRow.quantity, cartRow.buyPrice, index+1],(error3,results3)=>{
              // another row finished.
              if (error3){
                reject(error3)
              }else{
                resolve(results3)
              }
            })
          })
          orderDetailPromises.push(aPromise);
        })
        // When ALL the promises in orderDetailPromises have called resolve...
        // the .all function will run. It has a .then that we can use
        Promise.all(orderDetailPromises).then((finalValues)=>{
          console.log("All promises finished")
          const deleteQuery = `DELETE FROM cart WHERE uid = ${results[0].id};`
          console.log(deleteQuery);
          connection.query(deleteQuery, (error4, results4)=>{
            if(error4){
              console.log("error deleting cart");
              console.log(error2)
              return {msg: 'Fail'};
            } else {
              console.log("deleted cart?")
              return{
                msg:'paymentSuccess'
              };
            };
          })
        });
      })
  });
};

module.exports = createOrderRecords;
