import express from "express";
import * as path from "path";
import hbs from "express-handlebars";
import cookieParser from "cookie-parser";

const rootDir = process.cwd();
const port = 3000;
const app = express();
const menu = [
    { name: 'Americano', image: '/static/img/americano.jpg', price: 555 },
    { name: 'Cappuccino', image: '/static/img/cappuccino.jpg', price: 999 },
    { name: 'Latte', image: '/static/img/latte.jpg', price: 333 },
    { name: 'Espresso', image: '/static/img/espresso.jpg', price: 444 },
    { name: 'Flat-white', image: '/static/img/flat-white.jpg', price: 222 },
    { name: 'Latte-Macchiato', image: '/static/img/latte-macchiato.jpg', price: 111 },
    { name: 'Moet', image: '/static/img/moet.jpg', price: 6666 }
];
const users = {};

app.use(cookieParser());
app.use('/static', express.static('static'));
// Выбираем в качестве движка шаблонов Handlebars
app.set('view engine', 'hbs');
// Настраиваем пути и дефолтный view
app.engine(
    'hbs',
    hbs({
        extname: 'hbs',
        defaultView: 'default',
        layoutsDir: path.join(rootDir, "/views/layouts/"),
        partialsDir: path.join(rootDir, "/views/partials/"),
    })
);

app.get('/', (_, res) => {
    res.sendFile(path.join(rootDir, "/static/html/index.html"));
    res.redirect('/menu');
});

app.get('/menu', (_, res) => {
    res.render('menu', {
        layout: 'default',
        items: menu,
        title: 'Меню'
    });
});

app.get('/buy/:name', (req, res) => {
    const user = users[req.cookies.username];
    const { cart } = user;
    if (!cart) user.cart = [];
    user.cart.push(menu.find(item => item.name === req.params.name));
    res.redirect('/menu');
});

app.get('/cart', (req, res) => {
    try {
        const { cart } = users[req.cookies.username];
        res.render('cart', {
            layout: 'default',
            items: cart,
            total: cart.reduce((sum, elem) => sum += elem.price, 0),
            title: 'Корзина'
        });
    } catch (error) {
        res.redirect('/login');
    }
});

app.post('/cart', (req, res) => {
    users[req.cookies.username].cart = [];
    res.redirect('/cart');
});

app.get('/login', (req, res) => {
    const { username } = req.query;

    if (username) {
        users[username] = { cart: [] };
        res.cookie('username', username);
        res.redirect('/menu');
    } else res.render('login', {
        layout: 'default',
        name: req.cookies.username,
        title: 'Личный кабинет'
    });
});

app.listen(port, () => console.log(`App listening on port ${port}`));