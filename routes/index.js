const Pagination = require('../classes/pagination');
const hdb = require('../functions/handle_database');

module.exports = {
    getDashBoard: (req, res) => {
        if (req.session.key.is_admin) {
            res.render('home-admin.ejs', {
                message: "Administrator Control Panel",
                title: "Administrator Control Panel",
                userEmail: req.session.key.user_email
            });
        } else {
            res.render('home-customer.ejs', {
                message: "Customer Control Panel",
                title: "Customer Control Panel",
                userEmail: req.session.key.user_email
            });
        }
    },
};
