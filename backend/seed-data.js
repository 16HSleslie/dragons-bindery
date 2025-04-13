const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/dragon-bindery', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedProducts = [
  {
    name: 'The Hunger Games - Leatherbound',
    description: 'Genuine leather journal with dragon scale pattern and hand-stitched binding.',
    price: 65.00,
    image: '/assets/images/products/hunger-games.jpg',
    category: 'journals',
    isNew: true,
    isBestseller: false
  },
  {
    name: 'A Court of Thrones and Roses - Leatherbound',
    description: 'Handcrafted grimoire with antique paper, leather binding, and metal clasps.',
    price: 89.00,
    image: '/assets/images/products/thornes.jpg',
    category: 'grimoires',
    isNew: false,
    isBestseller: false
  },
  {
    name: 'Fourth Wing set',
    description: 'Delicate journal with pressed wildflowers and cotton pages bound with natural thread.',
    price: 48.00,
    image: '/assets/images/products/fourth-wing.jpg',
    category: 'journals',
    isNew: false,
    isBestseller: true
  }
];

const seedDB = async () => {
  await Product.deleteMany({});
  await Product.insertMany(seedProducts);
  console.log('Database seeded!');
  mongoose.connection.close();
};

seedDB();