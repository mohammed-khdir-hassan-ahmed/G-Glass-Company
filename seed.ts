import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { menuitem } from './src/db/schema';

const db = drizzle(process.env.DATABASE_URL!);

async function seed() {
  const fakeData = [
    // Main dishes
    { name_en: 'Kebab', name_ckb: 'کباب', name_arb: 'كباب', price: '15000 دینار', image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561f1f?w=400', category: 'main' },
    { name_en: 'Rice', name_ckb: 'رێز', name_arb: 'أرز', price: '12000 دینار', image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', category: 'main' },
    { name_en: 'Shawarma', name_ckb: 'شۆپە', name_arb: 'شاورما', price: '18000 دینار', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', category: 'main' },
    { name_en: 'Beef Steak', name_ckb: 'بێف استیک', name_arb: 'لحم بقري', price: '25000 دینار', image_url: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400', category: 'main' },
    { name_en: 'Chicken Steak', name_ckb: 'چیکن استیک', name_arb: 'دجاج بالفرن', price: '18000 دینار', image_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400', category: 'main' },
    { name_en: 'Fish', name_ckb: 'فیش', name_arb: 'سمك', price: '20000 دینار', image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', category: 'main' },
    { name_en: 'Shrimp', name_ckb: 'شەریم', name_arb: 'جمبري', price: '16000 دینار', image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', category: 'main' },
    { name_en: 'Pasta', name_ckb: 'لاپاتا', name_arb: 'معكرونة', price: '14000 دینار', image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561f1f?w=400', category: 'main' },
    
    // Pizza
    { name_en: 'Pizza', name_ckb: 'پیتزا', name_arb: 'بيتزا', price: '20000 دینار', image_url: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400', category: 'pizza' },
    { name_en: 'Sushi', name_ckb: 'سوشی', name_arb: 'سوشي', price: '22000 دینار', image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400', category: 'pizza' },
    
    // Appetizers
    { name_en: 'Salad', name_ckb: 'سلاتە', name_arb: 'سلطة', price: '8000 دینار', image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', category: 'appetizers' },
    { name_en: 'Bread', name_ckb: 'باغەتە', name_arb: 'خبز', price: '10000 دینار', image_url: 'https://images.unsplash.com/photo-1585238341710-4e5f75880ف8د?w=400', category: 'appetizers' },
    
    // Breakfast
    { name_en: 'Pasta', name_ckb: 'ماکارۆنی', name_arb: 'معكرونة', price: '12000 دینار', image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646د9a9?w=400', category: 'breakfast' },
    { name_en: 'Burger', name_ckb: 'بورگەر', name_arb: 'برجر', price: '13000 دینار', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', category: 'breakfast' },
    { name_en: 'Sandwich', name_ckb: 'ساندویچ', name_arb: 'ساندويتش', price: '9000 دینار', image_url: 'https://images.unsplash.com/photo-1528735602780-cf6ف53cf6537?w=400', category: 'breakfast' },
    { name_en: 'Taco', name_ckb: 'تاکۆ', name_arb: 'تاكو', price: '11000 دینار', image_url: 'https://images.unsplash.com/photo-1565299585323-38د6ب0865b47?w=400', category: 'breakfast' },
    { name_en: 'Fries', name_ckb: 'فرایز', name_arb: 'بطاطس مقلية', price: '7000 دینار', image_url: 'https://images.unsplash.com/photo-1589080876848-a8ف5ce04c8د5?w=400', category: 'breakfast' },
    { name_en: 'Grilled Meat', name_ckb: 'زۆمباک', name_arb: 'لحم مشوي', price: '15000 دینار', image_url: 'https://images.unsplash.com/photo-1555939594-58د7cb561ف1ف?w=400', category: 'breakfast' },
    { name_en: 'Chicken Sandwich', name_ckb: 'ساندویچ مرغ', name_arb: 'ساندويتش دجاج', price: '10000 دینار', image_url: 'https://images.unsplash.com/photo-1562547256-57ە5c76e8د3ە?w=400', category: 'breakfast' },
    
    // Drinks
    { name_en: 'Muesli', name_ckb: 'مۈزلی', name_arb: 'جرانولا', price: '8500 دینار', image_url: 'https://images.unsplash.com/photo-1585238341710-4ە5ف75880ف8د?w=400', category: 'drinks' },
  ];

  try {
    await db.insert(menuitem).values(fakeData as any);
    console.log('✅ 20 fake menu items added successfully!');
  } catch (error) {
    console.error('❌ Error adding fake data:', error);
  }
}

seed();
