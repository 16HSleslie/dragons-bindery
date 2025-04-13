const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/dragon-bindery', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedProducts = [
  {
    name: 'Dragon Scale Journal',
    description: 'Genuine leather journal with dragon scale pattern and hand-stitched binding.',
    price: 65.00,
    image: '/assets/images/products/dragon-scale-journal.jpg',
    category: 'journals',
    isNew: true,
    isBestseller: false
  },
  {
    name: 'Ancient Grimoire',
    description: 'Handcrafted grimoire with antique paper, leather binding, and metal clasps.',
    price: 89.00,
    image: '/assets/images/products/ancient-grimoire.jpg',
    category: 'grimoires',
    isNew: false,
    isBestseller: false
  },
  {
    name: 'Wildflower Diary',
    description: 'Delicate journal with pressed wildflowers and cotton pages bound with natural thread.',
    price: 48.00,
    image: '/assets/images/products/wildflower-diary.jpg',
    category: 'journals',
    isNew: false,
    isBestseller: true
  },
  {
    name: 'Herbal Spellbook',
    description: 'Medieval-inspired recipe book with hand-drawn herb illustrations and oak cover.',
    price: 79.00,
    image: '/assets/images/products/herbal-spellbook.jpg',
    category: 'spellbooks',
    isNew: false,
    isBestseller: false
  }
];

const seedDB = async () => {
  await Product.deleteMany({});
  await Product.insertMany(seedProducts);
  console.log('Database seeded!');
  mongoose.connection.close();
};

seedDB();