require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require('mongoose-encryption')
// const md5 = require('md5')
// const bcrypt = require('bcrypt')
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
const port = process.env.PORT;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

//Encryption using mongoose.encryption
// userSchema.plugin(encrypt,{secret:process.env.SECRET_KEY, encryptedFields: ['password']})
userSchema.plugin(passportLocalMongoose);

// const saltRounds = parseInt(process.env.SALT_ROUND)

const User = new mongoose.model("User", userSchema);

const LocalStrategy = require("passport-local").Strategy;

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Home Route
app.get("/", (req, res) => {
  res.render("home");
});

//Login Route
app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post(
    passport.authenticate("local", {
      successRedirect: "/secrets",
      failureRedirect: "/login",
    }),
    (req, res) => {
      // User.findOne({email:email},(err,founduser)=>{
      //     if(err)
      //         console.log(err)
      //     else{
      //         if(founduser){
      //             // bcrypt.compare(password, founduser.password, function(err, match) {
      //             //     if(match){
      //             //         console.log("email and password matched, login successful")
      //             //         res.render('secrets')
      //             //     }
      //             //     else{
      //             //         res.send("Invalid password")
      //             //     }
      //             // });
      //             // if(founduser.password===password){
      //             //     console.log("email and password matched, login successful")
      //             //     res.render('secrets')
      //             // }
      //             // else{
      //             //     res.send("Invalid password")
      //             // }
      //             res.send('found')
      //         }
      //         else{
      //             res.send("User not found")
      //         }
      //     }
      // })

      // const user = new User({
      //   username: req.body.username,
      //   password: req.body.password,
      // });
      // req.login(user, function (err) {
      //   if (err) {
      //     console.log(err);
      //   } else {
      //     console.log(user)
      //     passport.authenticate("local")(req, res, function(){
      //       res.redirect("/secrets");
      //     });
      //   }
      // });
    }
  );

//Register route

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //     if(err)
    //         console.log(err);
    //     else{
    //         const newUser = new User({
    //             email: req.body.email,
    //             password: hash,
    //         })
    //         newUser.save((err)=>{
    //             if(err)
    //                 console.log(err)
    //             else{
    //                 console.log("register successful")
    //                 res.render("secrets")
    //             }
    //         })
    //     }
    // });

    User.register(
      { username: req.body.username },
      req.body.password,
      (err, user) => {
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          passport.authenticate("local")(req, res, () => {
            res.redirect("/secrets");
          });
        }
      }
    );
  });

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.route("/secrets").get((req, res) => {
  if (req.isAuthenticated()) {
    console.log("login successful");
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.listen(port, () => console.log("server started at port " + port));
