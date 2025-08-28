const mongoose = require('mongoose');
require('dotenv').config();

// Подключаемся к базе данных
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cs2trading');

// Схема предмета
const itemSchema = new mongoose.Schema({
  steamId: String,
  marketName: String,
  displayName: String,
  type: String,
  rarity: String,
  exterior: String,
  image: String,
  ourPrice: Number,
  steamPrice: Number,
  quantity: Number,
  isAvailable: Boolean,
  game: String,
  tags: [String],
  category: String
});

const Item = mongoose.model('Item', itemSchema);

// Тестовые предметы
const testItems = [
  {
    steamId: 'test_ak47_redline',
    marketName: 'AK-47 | Redline (Field-Tested)',
    displayName: 'AK-47 | Redline',
    type: 'Rifle',
    rarity: 'Classified',
    exterior: 'Field-Tested',
    image: 'https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwX09-jloRZ7P_7OrzZgiVQuJpz3DzHpYj33gS1rkJpYGH8J4V0dQc4Yw5Q8WGvxO-7l5K7vZbJ1jI97mJwuyhRwv9yPw',
    ourPrice: 15.50,
    steamPrice: 18.00,
    quantity: 5,
    isAvailable: true,
    game: 'cs2',
    tags: ['rifle', 'ak47', 'redline'],
    category: 'Rifles'
  },
  {
    steamId: 'test_m4a4_desolate',
    marketName: 'M4A4 | Desolate Space (Minimal Wear)',
    displayName: 'M4A4 | Desolate Space',
    type: 'Rifle',
    rarity: 'Covert',
    exterior: 'Minimal Wear',
    image: 'https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwX09-jloRZ7P_7OrzZgiVQuJpz3DzHpYj33gS1rkJpYGH8J4V0dQc4Yw5Q8WGvxO-7l5K7vZbJ1jI97mJwuyhRwv9yPw',
    ourPrice: 25.00,
    steamPrice: 28.50,
    quantity: 3,
    isAvailable: true,
    game: 'cs2',
    tags: ['rifle', 'm4a4', 'desolate'],
    category: 'Rifles'
  },
  {
    steamId: 'test_awp_dragon_lore',
    marketName: 'AWP | Dragon Lore (Factory New)',
    displayName: 'AWP | Dragon Lore',
    type: 'Sniper Rifle',
    rarity: 'Contraband',
    exterior: 'Factory New',
    image: 'https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwX09-jloRZ7P_7OrzZgiVQuJpz3DzHpYj33gS1rkJpYGH8J4V0dQc4Yw5Q8WGvxO-7l5K7vZbJ1jI97mJwuyhRwv9yPw',
    ourPrice: 2500.00,
    steamPrice: 2800.00,
    quantity: 1,
    isAvailable: true,
    game: 'cs2',
    tags: ['sniper', 'awp', 'dragon_lore'],
    category: 'Sniper Rifles'
  },
  {
    steamId: 'test_glock_fade',
    marketName: 'Glock-18 | Fade (Factory New)',
    displayName: 'Glock-18 | Fade',
    type: 'Pistol',
    rarity: 'Covert',
    exterior: 'Factory New',
    image: 'https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwX09-jloRZ7P_7OrzZgiVQuJpz3DzHpYj33gS1rkJpYGH8J4V0dQc4Yw5Q8WGvxO-7l5K7vZbJ1jI97mJwuyhRwv9yPw',
    ourPrice: 180.00,
    steamPrice: 200.00,
    quantity: 2,
    isAvailable: true,
    game: 'cs2',
    tags: ['pistol', 'glock', 'fade'],
    category: 'Pistols'
  },
  {
    steamId: 'test_karambit_fade',
    marketName: 'Karambit | Fade (Factory New)',
    displayName: 'Karambit | Fade',
    type: 'Knife',
    rarity: 'Covert',
    exterior: 'Factory New',
    image: 'https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwX09-jloRZ7P_7OrzZgiVQuJpz3DzHpYj33gS1rkJpYGH8J4V0dQc4Yw5Q8WGvxO-7l5K7vZbJ1jI97mJwuyhRwv9yPw',
    ourPrice: 850.00,
    steamPrice: 900.00,
    quantity: 1,
    isAvailable: true,
    game: 'cs2',
    tags: ['knife', 'karambit', 'fade'],
    category: 'Knives'
  }
];

async function addTestItems() {
  try {
    console.log('🔄 Adding test items to database...');
    
    // Очищаем существующие тестовые предметы
    await Item.deleteMany({ steamId: { $regex: '^test_' } });
    console.log('🗑️ Cleared existing test items');
    
    // Добавляем новые тестовые предметы
    const result = await Item.insertMany(testItems);
    console.log(`✅ Added ${result.length} test items to database`);
    
    // Показываем добавленные предметы
    result.forEach(item => {
      console.log(`📦 ${item.displayName} - $${item.ourPrice} (${item.quantity} шт.)`);
    });
    
    console.log('🎉 Test items added successfully!');
    console.log('💡 Now you can test the trading interface');
    
  } catch (error) {
    console.error('❌ Error adding test items:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Запускаем скрипт
addTestItems();
