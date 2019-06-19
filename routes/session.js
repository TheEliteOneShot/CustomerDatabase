const hdb = require('../functions/handle_database');

module.exports = {
    loginPage: (req, res) => {
        hdb.handle_database(req, "login", function (response) {
            if (response == null) {
                console.log("The response was NULL.");
                res.json({"error" : true , "message" : "Invalid login/password combination."});
            } else {
                if (!response) {
                    res.json({"error" : true , "message" : "Login/Password doesn't exist. Please register an account."});
                } else {
                    req.session.key = response;
                    res.redirect('/');
                }
            }
        });
    },
    logoutPage: (req, res) => {
        if (req.session.key) {
            req.session.destroy(function () {
                res.redirect('/');
            });
        } else {
            res.redirect('/');
        }
    },
    registerPage: (req, res) => {
        hdb.handle_database(req,"checkEmail",function(response){
            console.log("Received response: " + response);
          if(response === null) {
            console.log("The email being registered already existed.")
            res.json({"error" : true, "message" : "This email is already present."});
          } else {
            console.log("The email being registered wasn't present.")
            hdb.handle_database(req,"register",function(response){
                console.log("here");
              if(response === null) {
                res.json({"error" : false , "message" : "Error while adding user."});
              } else {
                res.json({"error" : false, "message" : "Registered successfully."});
              }
            });
          };
        });
    }
};