CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  email       VARCHAR(120) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('customer','admin') DEFAULT 'customer',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS products (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(150) NOT NULL,
  category       ENUM('electronics','clothing','home','accessories') NOT NULL,
  price          DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2) DEFAULT NULL,
  image          VARCHAR(255)  DEFAULT 'images/placeholder.jpg',
  description    TEXT,
  stock          INT UNSIGNED  DEFAULT 0,
  rating         DECIMAL(3,2)  DEFAULT 0.00,
  reviews        INT UNSIGNED  DEFAULT 0,
  featured       TINYINT(1)    DEFAULT 0,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS orders (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_ref    VARCHAR(20)   NOT NULL UNIQUE,
  user_id      INT UNSIGNED  DEFAULT NULL,
  full_name    VARCHAR(100)  NOT NULL,
  email        VARCHAR(120)  NOT NULL,
  phone        VARCHAR(20)   NOT NULL,
  address      TEXT          NOT NULL,
  subtotal     DECIMAL(10,2) NOT NULL,
  shipping     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total        DECIMAL(10,2) NOT NULL,
  status       ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS order_items (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  order_id    INT UNSIGNED  NOT NULL,
  product_id  INT UNSIGNED  NOT NULL,
  name        VARCHAR(150)  NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  qty         INT UNSIGNED  NOT NULL DEFAULT 1,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS contact_messages (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name  VARCHAR(100) NOT NULL,
  email      VARCHAR(120) NOT NULL,
  subject    VARCHAR(200) NOT NULL,
  message    TEXT         NOT NULL,
  is_read    TINYINT(1)   DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);