const hdb = require('../functions/handle_database');

module.exports = {
    addCustomerPage: (req, res) => {
        res.render('add-customer.ejs', {
            title: "Add a new customer"
            , message: '',
            userEmail: req.session.key.user_email
        });
    },
    addCustomer: (req, res) => {
        let id = req.body.id;
        let user_email = req.body.user_email;
        let first_name = req.body.first_name;
        let last_name = req.body.last_name;
        let ip = req.body.ip;
        let latitude = req.body.latitude;
        let longitude = req.body.longitude;

        req.params.data = {
            id, user_email, first_name, last_name, ip, latitude, longitude
        }

        hdb.handle_database(req, "checkEmail", function (response) {
            if (response === null) {
                res.render('add-customer.ejs', {
                    message: 'Username already exists.',
                    title: "Add a new customer",
                    userEmail: req.session.key.user_email
                });
            } else {
                hdb.handle_database(req, "add_customer", function (response) {
                    if (response === null) {
                        res.render('add-customer.ejs', {
                            message: "Customer was added successfully",
                            title: "Add a new customer",
                            userEmail: req.session.key.user_email
                        });

                    };
                });
            }
        });
    },
    editCustomerPage: (req, res) => {
        hdb.handle_database(req, "get_customer_edit", function (response) {
            if (response === null) {
                console.log("There was an error retrieving the edit page for this customer.");
            } else {
                res.render('edit-customer.ejs', {
                    title: "Edit customers"
                    , customers: response
                    , message: "Edit " + response.first_name + "'s information."
                    , userEmail: req.session.key.user_email
                });

            };
        });
    },
    editCustomer: (req, res) => {
        let id = req.params.id;
        let user_email = req.body.user_email;
        let first_name = req.body.first_name;
        let last_name = req.body.last_name;
        let ip = req.body.ip;
        let latitude = req.body.latitude;
        let longitude = req.body.longitude;

        req.params.data = {
            id, user_email, first_name, last_name, ip, latitude, longitude
        }

        hdb.handle_database(req, "update_customer", function (response) {
            console.log("Updated the customer!");
            res.redirect("/search/" + req.session.currentPage);
        });
    },
    deleteCustomer: (req, res) => {

        let id = req.params.id;

        req.params.data = {
            id
        }

        hdb.handle_database(req, "delete_customer", function (response) {
            console.log("Updated the customer!");
            res.post("/search");
        });
    },
    customerProfile: (req, res) => {
        let customersId = req.params.id;
        let query = "SELECT * FROM customers WHERE id = '" + customersId + "' ";

        db.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.render('profile-customer.ejs', {
                title: "Customer Profile"
                , customer: result[0]
                , message: ''
                , userEmail: req.session.key.user_email
            });
        });
    }
};
