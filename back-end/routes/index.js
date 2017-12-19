let express = require('express');
let router = express.Router();
let mysql = require('mysql');
let config = require('../config/config');
let stripe = require('stripe')(config.stripeKey);
let bcrypt = require('bcrypt-nodejs');
let randToken = require('rand-token');
let createOrderRecords = require('../util/createOrderRecords');

let connection = mysql.createConnection(config)
connection.connect();


router.post('/fakelogin', (req, res, next)=>{
    console.log("Hit /fakelogin POST route");

    const getFirstUser = `SELECT * from users limit 1;`;
    connection.query(getFirstUser, (error, results)=>{
        if(error){
            throw error;
        }
        console.log("fakelogin results: \n", results);
        res.json({
            msg: "loginSuccess",
            token: results[0].token,
            name: results[0].email
        });
    })
});

router.post('/register', (req,res,next)=>{
  console.log(req.body);
  const userData = Object.assign({}, req.body);  //es5 way to clone object
  console.log("userData: \n", userData);

  // Express just got a post request to /register. This must be
  // from our react app. Specifically, the /register form.
  // This means, someone is trying to register. We have their data
  // inside of userData.
  // We need to insert their data into 2 tables:
  // 1. Users.
  //  - Users table needs their customer ID from the customers table
  //  - password, which needs to be hashed
  //  - email
  //  - arbitraty token which Express will create
  // 2. Customers.
  // - Name, city, state, salesRep, creditLimit
  // FIRST query... check to see if the user is already in users.
  // - if they are, res.json({msg:"userExists"})
  // - if they aren't...
  //   - insert user into customers FIRST (because we need CID for users)
  //   - insert user into users
  //   - res.json({msg:"userInserted", token: token, name: name})
  // FIRST check to see if user exists. We will use email.
  const checkEmail = new Promise((resolve, reject) =>{
    const checkEmailQuery = `SELECT * FROM users WHERE email = ?;`;
    connection.query(checkEmailQuery,[userData.email],(error, results)=>{
      if (error) {
        throw error; //for development
        // reject(error) //in production
      }else if(results.length > 0){
        // user exists already. goodbye.
        reject({
          msg: "userExists"
        })
      }else{
        // no error. no user. resolve (we dont care about results)
        resolve()
      }
    });
  });

  checkEmail.then(
    // code to run if our checkEmail resolves.
    ()=>{
      console.log("User is not in the db.")
      const insertIntoCust = `INSERT INTO customers
      (customerName, city, state, salesRepEmployeeNumber, creditLimit)
        VALUES
      (?,?,?,?,?)`;
      connection.query(insertIntoCust,[userData.name,userData.city,userData.state,1337,100000],(error, results)=>{
        if(error){
          console.log(error);
          throw error;
        }
        // get the customer ID that was JUST inseterd (results)
        const newID = results.insertId;
        // Set up a random string for this user's token
        // We will store it in teh DB
        const token = randToken.uid(60);
        // hashSync will create a blowfish/crypt (something evil)
        // hash we will insert into the DB
        const hash = bcrypt.hashSync(userData.password);
        console.log(newID);
        const insertUsers = `INSERT INTO users
        (cid,type,password,token,email)
          VALUES
        (?,?,?,?,?);`;
        connection.query(insertUsers,[newID,'customer',hash,token,userData.email],(error,results)=>{
          if(error){
            throw error; //Dev only
          }else{
            // If we get this far... this is goign to be
            // whats inside of the authReducer.
            res.json({
              token: token,
              name: userData.name,
              msg: "registerSuccess"
            })
          }
        })
      });
    }
  ).catch(
  // code to run if checkEmail rejects
    (error)=>{
      console.log(error);
      res.json(error);
    }
  )});

router.post('/login', (req, res, next)=>{
  console.log(req.body);
  const email = req.body.email;
  const password = req.body.password;

  const checkEmailQuery = `SELECT * FROM users
  INNER JOIN customers ON users.cid = customers.customerNumber WHERE users.email = ?;`;
  connection.query(checkEmailQuery,[email],(error, results)=>{
    if (error) {
      throw error; //for development
    }else if(results.length === 0){
      // no email found goodbye.
      res.json({
        msg: "userExists"
      });
    }else{
      // user exists...use bcrypt to match password
      const checkHash = bcrypt.compareSync(password, results[0].password);
      const name = results[0].customerName;
      if(checkHash) {   // match!  create new token and update db with token
        const newToken = randToken.uid(100);
        const updateTokenSQL = `UPDATE users SET token = ? WHERE email = ?;`;
        connection.query(updateTokenSQL, [newToken, email], (error, results)=>{
          if(error){
            throw error;
          } else {
            res.json({
              msg: "loginSuccess",
              token: newToken,
              name: name
            });
          };
        });
      } else {  // no match
        res.json({msg: "wrongPassword"})
      };
    };
  });
});

router.get('/productlines/get', (req, res, next)=>{

  const selectQuery = `SELECT * FROM productlines;`;

  connection.query(selectQuery,(error, results)=>{

    if (error) {
      console.log(error);
      throw error; //for development
    } else {
      console.log(results);
      res.json(results);
    };
  });
});

router.get('/productlines/:productline/get', (req, res, next)=>{

  const pl = req.params.productline;

  const selectQuery = `SELECT * FROM productlines
        INNER JOIN products ON productlines.productLine = products.productLine
        WHERE productlines.productline = ?;`;

  connection.query(selectQuery,[pl],(error, results)=>{

    if (error) {
      console.log(error);
      throw error; //for development
    } else {
      console.log(results);
      res.json(results);
    };
  });
});

router.post('/getCart', (req, res, next)=>{
    console.log("Hit /getCart POST route");

    const userToken = req.body.token;

    let selectQuery = `SELECT id FROM users WHERE token = ?;`;

    let tokenPromise = new Promise((resolve, reject)=>{
      connection.query(selectQuery,[userToken],(error, results)=>{
        if (error){
          reject(error);
        }else {
          resolve(results);
        }
      })
    });
    // .then will run on our promise when it's finished.

    tokenPromise.then((results)=>{
    if(results.length === 0){
      // token is not valid....
      res.json({msg: "bad token"});
    };

    // Get the user's id for the last query
    const uid = results[0].id;
    // this is a good token. I know who this is now.
    const getCartTotals = `SELECT SUM(buyPrice) as totalPrice, count(buyPrice) as totalItems
      FROM cart
      INNER JOIN products ON products.productCode = cart.productCode
      WHERE cart.uid = ?;`;
    connection.query(getCartTotals,[uid],(error,cartResults)=>{
      if(error){
        throw error;
      } else{
        const getCartProducts = `SELECT * from cart INNER JOIN products on products.productCode = cart.productCode WHERE uid = ?;`;

        connection.query(getCartProducts,[uid],(error,cartProducts)=>{
          if(error){
            throw error;
          } else{
            let finalCart = cartResults[0];
            finalCart.products = cartProducts;
            res.json(finalCart);
          };
        });
      };
    });
  });
});


router.post('/updateCart',(req, res, next)=>{

  console.log('Hit /updateCart');

  const productCode = req.body.productCode;
  const userToken = req.body.userToken;

  let selectQuery = `SELECT id FROM users WHERE token = ?;`;

  let tokenPromise = new Promise((resolve, reject)=>{
    connection.query(selectQuery,[userToken],(error,results)=>{
      if (error){
        reject(error);
      }else {
        resolve(results);
      }
    })
  });
  // .then will run on our promise when it's finished.

  tokenPromise.then((results)=>{
    console.log(results);
    if(results.length === 0){
      // token is not valid....
      res.json({msg: "bad token"});
    };

    // Get the user's id for the last query
      const uid = results[0].id;
      // this is a good token. I know who this is now.
      const addToCartQuery = `INSERT into cart (uid, productCode)
        VALUES (?,?);`;
      connection.query(addToCartQuery,[uid,productCode],(error)=>{
        if(error){
          throw error;
        }else{
          // the insert worked.
          // get the sum of their products and their total
          const getCartTotals = `SELECT SUM(buyPrice) as totalPrice, count(buyPrice) as totalItems
            FROM cart
            INNER JOIN products ON products.productCode = cart.productCode
            WHERE cart.uid = ?;`;
          connection.query(getCartTotals,[uid],(error,cartResults)=>{
            if(error){
              throw error;
            }else{
              let finalCart = cartResults[0];
              finalCart.products = [];
              res.json(finalCart);
            }
          });
        };
      });
  })
  .catch((error) => {
    console.log(error);
    res.json({msg: error})
  });
});


router.post('/stripe',(req,res,next)=>{
  console.log ("hit POST /stripe backend");
  console.log(req.body);
  const userToken = req.body.userToken;
  const stripeToken = req.body.stripeToken;
  const amount = req.body.amount;

  stripe.charges.create({
    amount: amount,
    currency: 'usd',
    source: stripeToken,
    description: "Classic Models"
  },
  (error, charge)=>{
    console.log("back from stripe.charges.create");
    if(error){
      console.log("error on stripe.charges.create\n", error);
      res.json({msg: "Error charging through Stripe"});
    } else {
      console.log("charge from Stripe....\n", charge);
      let finalResult = createOrderRecords(connection, req.body.userToken);
      console.log("final result\n", finalResult);
      res.json(finalResult);
    }
  });
});

module.exports = router;
