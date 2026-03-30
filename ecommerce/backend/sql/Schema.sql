CREATE DATABASE IF NOT EXISTS shoplite
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE shoplite;
INSERT IGNORE INTO users (username, email, password, role)
VALUES (
  'admin',
  'admin@shoplite.com',
  '$2a$12$YGmxHcVuSJOi7MoHqHMTxO3Q5T4N1K6L2P8R7W9VzXjAyBmCdEfGh',
  'admin'
);
INSERT IGNORE INTO products
  (id,name,category,price,original_price,image,description,stock,rating,reviews,featured)
VALUES
(1,'Premium Wireless Headphones','electronics',89.99,129.99,'images/headphones.jpg','Experience crystal-clear audio with our premium wireless headphones. Featuring 40-hour battery life, active noise cancellation, and ultra-comfortable ear cushions for all-day wear.',15,4.8,124,1),
(2,'Smart Fitness Watch','electronics',149.99,199.99,'images/watch.jpg','Track your health and fitness goals with our advanced smart watch. Heart rate monitoring, GPS tracking, sleep analysis, and 7-day battery life packed in a sleek design.',10,4.7,89,1),
(3,'Minimalist Leather Wallet','accessories',34.99,49.99,'images/wallet.jpg','Slim, stylish genuine leather wallet with RFID blocking technology. Holds up to 8 cards with a dedicated cash slot and ID window. Available in black and brown.',30,4.6,212,1),
(4,'Portable Bluetooth Speaker','electronics',59.99,79.99,'images/speaker.jpg','Take your music anywhere with 360 surround sound. Waterproof IPX7 rating, 20-hour playtime, and a compact design that fits in any bag.',20,4.5,167,1),
(5,'Classic Ceramic Coffee Mug','home',18.99,24.99,'images/mug.jpg','Start your mornings right with this handcrafted ceramic mug. Holds 12oz, dishwasher safe, and available in 5 beautiful colors.',50,4.9,345,0),
(6,'Ergonomic Office Chair','home',249.99,329.99,'images/chair.svg','Work in comfort all day long. Adjustable lumbar support, breathable mesh back, armrests, and a 5-year warranty.',8,4.6,78,0),
(7,'Mens Casual Sneakers','clothing',64.99,89.99,'images/sneakers.svg','Lightweight, breathable sneakers with memory foam insoles for all-day comfort. Available in sizes 7-13. Machine washable.',25,4.4,193,0),
(8,'Stainless Steel Water Bottle','home',24.99,34.99,'images/bottle.svg','Keep drinks cold for 24 hours or hot for 12 hours. BPA-free, leak-proof lid, 32oz capacity.',40,4.8,421,0),
(9,'Silk Blend Scarf','clothing',42.99,59.99,'images/scarf.svg','Luxuriously soft silk blend scarf with elegant floral pattern. Lightweight, versatile styling for any season.',18,4.5,64,0),
(10,'Wireless Phone Charger','electronics',29.99,44.99,'images/charger.svg','Fast 15W wireless charging pad compatible with all Qi-enabled devices. Ultra-slim profile with foreign object detection.',35,4.3,156,0),
(11,'Scented Soy Candle Set','home',36.99,49.99,'images/candles.svg','Set of 4 hand-poured soy wax candles: Lavender, Vanilla Bean, Sandalwood, and Fresh Linen. Up to 45 hours burn time each.',22,4.7,287,0),
(12,'Vintage Leather Backpack','accessories',119.99,159.99,'images/backpack.svg','Handcrafted full-grain leather backpack with padded laptop compartment, multiple organizer pockets, and adjustable shoulder straps.',12,4.8,102,0);