if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}
const express = require('express')
const app = express()
const port = 3000

const bcrypt = require("bcrypt")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")

app.set("view-engine", "ejs")

app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
   secret: process.env.SESSION_SECRET,
   resave: false,
   saveUninitialized: false


}))
//method override
app.use(methodOverride("_method"))

const initializePassport = require("./passport-config")
const passport = require('passport')

app.use(passport.initialize())
app.use(passport.session())

initializePassport( 
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
 )


// LOGIN

app.get("/facebook/login", checKNotkAuthenticated, (req, res) => {
    res.render("facebook.ejs")
})


app.post("/facebook/login", checKNotkAuthenticated, passport.authenticate("local", {
   successRedirect : "/facebook/home",
   failureRedirect: "/facebook/login",
   failureFlash: true
}) )

// LOG OUT


// app.delete("/facebook/logout", (req, res) =>{
//     req.logOut()
//     res.redirect("/facebook/login")
// })

app.delete('/facebook/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { 
        return next(err)
     }
      res.redirect('/facebook/login')})
  })


// REGISTER

app.get("/facebook/register", checKNotkAuthenticated, (req, res) => {
    res.render("register.ejs")
})

const users = []
app.post("/facebook/register", checKNotkAuthenticated, async (req, res) => {

 try {

    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    const user = {
        id: Date.now().toString(),
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: hashedPassword
    }

    users.push(user)
    res.redirect("/facebook/login")
    res.status(201).send()
    console.log(users);
    
    
 } 
 
 catch (error) {
    res.redirect("/facebook/register")
 }
})


// HOME PAGE

app.get("/facebook/home", checkAuthenticated, (req, res) => {
    res.render("home.ejs", {text: req.user.firstname})
})


//THE FOLLOWING CODE ALLOWS THE USERS NOT TO GO BACK AFTER LOGGING IN
function checkAuthenticated (req, res, next) {
    if (req.isAuthenticated()) {
       return next()
    }
    res.redirect('/facebook/login')
}

//ONCE LOGGED IN REMAIN ON THE HOMEPAGE/DASHBOARD
function checKNotkAuthenticated (req, res, next) {
    if (req.isAuthenticated()) {
       return res.redirect('/facebook/home')
    }

    next()
}



// SERVER PORT 


app.listen(port, () => {
    console.log("Server listening on port " + port);
})