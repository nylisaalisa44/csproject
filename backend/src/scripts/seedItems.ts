import mongoose from 'mongoose';
import { Item } from '../models/Item';
import dotenv from 'dotenv';

dotenv.config();

const testItems = [
  {
    steamId: '730_2_1_1234567890',
    marketName: 'AK-47 | Redline (Field-Tested)',
    displayName: 'AK-47 | Redline',
    type: 'weapon',
    rarity: 'Classified',
    exterior: 'Field-Tested',
    image: 'https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_ak47_cu_ak47_redline_light_large.2d1eb2f365edb16523b5aa231c7b9d90ca90b5a4.png',
    game: 'cs2',
    steamPrice: 25.50,
    ourPrice: 24.00,
    currency: 'USD',
    isAvailable: true,
    isTradeable: true,
    quantity: 5,
    tags: ['ak47', 'redline', 'field-tested', 'rifle'],
    category: 'rifles'
  },
  {
    steamId: '730_2_2_1234567891',
    marketName: 'AWP | Dragon Lore (Factory New)',
    displayName: 'AWP | Dragon Lore',
    type: 'weapon',
    rarity: 'Covert',
    exterior: 'Factory New',
    image: 'https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_awp_gs_awp_dragon_lore_light_large.2d1eb2f365edb16523b5aa231c7b9d90ca90b5a4.png',
    game: 'cs2',
    steamPrice: 15000.00,
    ourPrice: 14500.00,
    currency: 'USD',
    isAvailable: true,
    isTradeable: true,
    quantity: 1,
    tags: ['awp', 'dragon-lore', 'factory-new', 'sniper'],
    category: 'snipers'
  },
  {
    steamId: '730_2_3_1234567892',
    marketName: 'M4A4 | Howl (Minimal Wear)',
    displayName: 'M4A4 | Howl',
    type: 'weapon',
    rarity: 'Covert',
    exterior: 'Minimal Wear',
    image: 'https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_m4a1_cu_m4a4_howling_dawn_light_large.2d1eb2f365edb16523b5aa231c7b9d90ca90b5a4.png',
    game: 'cs2',
    steamPrice: 8000.00,
    ourPrice: 7800.00,
    currency: 'USD',
    isAvailable: true,
    isTradeable: true,
    quantity: 2,
    tags: ['m4a4', 'howl', 'minimal-wear', 'rifle'],
    category: 'rifles'
  },
  {
    steamId: '730_2_4_1234567893',
    marketName: 'Karambit | Fade (Factory New)',
    displayName: 'Karambit | Fade',
    type: 'knife',
    rarity: 'Covert',
    exterior: 'Factory New',
    image: 'https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_knife_karambit_gs_karambit_fade_light_large.2d1eb2f365edb16523b5aa231c7b9d90ca90b5a4.png',
    game: 'cs2',
    steamPrice: 2500.00,
    ourPrice: 2400.00,
    currency: 'USD',
    isAvailable: true,
    isTradeable: true,
    quantity: 3,
    tags: ['karambit', 'fade', 'factory-new', 'knife'],
    category: 'knives'
  },
  {
    steamId: '730_2_5_1234567894',
    marketName: 'Desert Eagle | Golden Koi (Factory New)',
    displayName: 'Desert Eagle | Golden Koi',
    type: 'weapon',
    rarity: 'Classified',
    exterior: 'Factory New',
    image: 'https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_deagle_cu_deagle_kumichodragon_light_large.2d1eb2f365edb16523b5aa231c7b9d90ca90b5a4.png',
    game: 'cs2',
    steamPrice: 45.00,
    ourPrice: 42.00,
    currency: 'USD',
    isAvailable: true,
    isTradeable: true,
    quantity: 8,
    tags: ['desert-eagle', 'golden-koi', 'factory-new', 'pistol'],
    category: 'pistols'
  }
];

async function seedItems() {
  try {
    // Подключаемся к базе данных
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cs2_trading');
    console.log('Connected to MongoDB');

    // Очищаем существующие предметы
    await Item.deleteMany({});
    console.log('Cleared existing items');

    // Добавляем тестовые предметы
    const items = await Item.insertMany(testItems);
    console.log(`Added ${items.length} test items`);

    // Выводим статистику
    const totalItems = await Item.countDocuments();
    const availableItems = await Item.countDocuments({ isAvailable: true, quantity: { $gt: 0 } });
    const totalValue = await Item.aggregate([
      { $match: { isAvailable: true, quantity: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$ourPrice', '$quantity'] } } } }
    ]);

    console.log('\n📊 Items Statistics:');
    console.log(`Total items: ${totalItems}`);
    console.log(`Available items: ${availableItems}`);
    console.log(`Total value: $${totalValue[0]?.total?.toFixed(2) || '0.00'}`);

    console.log('\n✅ Items seeded successfully!');
  } catch (error) {
    console.error('Error seeding items:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Запускаем скрипт
seedItems();
