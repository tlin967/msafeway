-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
SHOW WARNINGS;
-- -----------------------------------------------------
-- Schema heroku_c26fdad3f72b054
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `heroku_c26fdad3f72b054` ;

-- -----------------------------------------------------
-- Schema heroku_c26fdad3f72b054
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `heroku_c26fdad3f72b054` ;
SHOW WARNINGS;
USE `heroku_c26fdad3f72b054` ;

-- -----------------------------------------------------
-- Table `heroku_c26fdad3f72b054`.`User`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `heroku_c26fdad3f72b054`.`User` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `heroku_c26fdad3f72b054`.`User` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_name` VARCHAR(50) NOT NULL,
  `password` BINARY(60) NOT NULL,
  `email` VARCHAR(254) NOT NULL,
  `street_address` VARCHAR(100) NULL,
  `city` VARCHAR(60) NULL,
  `state` VARCHAR(50) NULL,
  `country` VARCHAR(55) NULL,
  `zip` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC))
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `heroku_c26fdad3f72b054`.`Guest`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `heroku_c26fdad3f72b054`.`Guest` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `heroku_c26fdad3f72b054`.`Guest` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(254) NOT NULL,
  `street_address` VARCHAR(100) NULL,
  `city` VARCHAR(60) NULL,
  `state` VARCHAR(50) NULL,
  `country` VARCHAR(55) NULL,
  `zip` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC))
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `heroku_c26fdad3f72b054`.`Product`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `heroku_c26fdad3f72b054`.`Product` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `heroku_c26fdad3f72b054`.`Product` (
  `id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `price` DECIMAL(13,2) NOT NULL,
  `short_description` VARCHAR(128) NULL,
  `long_description` VARCHAR(4096) NULL,
  `quantity` INT NOT NULL,
  `category` VARCHAR(45) NULL,
  `sub_aisle` VARCHAR(45) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `heroku_c26fdad3f72b054`.`Cart`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `heroku_c26fdad3f72b054`.`Cart` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `heroku_c26fdad3f72b054`.`Cart` (
  `price` DECIMAL(13,2) NOT NULL,
  `quantity` INT NOT NULL,
  `product_id` INT NOT NULL,
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  INDEX `productID_idx` (`product_id` ASC),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_table_product_product_id`
    FOREIGN KEY (`product_id`)
    REFERENCES `heroku_c26fdad3f72b054`.`Product` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `heroku_c26fdad3f72b054`.`Promo`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `heroku_c26fdad3f72b054`.`Promo` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `heroku_c26fdad3f72b054`.`Promo` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `promo_code` VARCHAR(32) NOT NULL,
  `products` VARCHAR(45) NULL,
  `start_date` DATETIME NULL,
  `expire_date` DATETIME NULL,
  `promo_type` ENUM("FIXED", "PERCENTAGE", "GIFT") NULL,
  `amount` DECIMAL(13,2) NOT NULL,
  `minimum_amount` DECIMAL(13,2) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `heroku_c26fdad3f72b054`.`Order`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `heroku_c26fdad3f72b054`.`Order` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `heroku_c26fdad3f72b054`.`Order` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `status` ENUM("PROCESSING", "IN TRANSIT", "DELIVERED", "CANCELLED", "RETURNED") NOT NULL,
  `paymentInfo` VARCHAR(45) NOT NULL,
  `delivery_street_address` VARCHAR(100) NULL,
  `delivery_city` VARCHAR(60) NULL,
  `delivery_state` VARCHAR(50) NULL,
  `delivery_country` VARCHAR(55) NULL,
  `cart_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `date` DATETIME NOT NULL,
  `promo_id` INT UNSIGNED NULL,
  `delivery_zip` VARCHAR(45) NULL,
  `name` VARCHAR(100) NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_order_user_user_id_idx` (`user_id` ASC),
  INDEX `fk_order_promo_promo_id_idx` (`promo_id` ASC),
  INDEX `fk_order_cart_cart_id_idx` (`cart_id` ASC),
  CONSTRAINT `fk_order_user_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `heroku_c26fdad3f72b054`.`User` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_order_promo_promo_id`
    FOREIGN KEY (`promo_id`)
    REFERENCES `heroku_c26fdad3f72b054`.`Promo` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_order_cart_cart_id`
    FOREIGN KEY (`cart_id`)
    REFERENCES `heroku_c26fdad3f72b054`.`Cart` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `heroku_c26fdad3f72b054`.`Guest_Order`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `heroku_c26fdad3f72b054`.`Guest_Order` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `heroku_c26fdad3f72b054`.`Guest_Order` (
  `status` ENUM("PROCESSING", "IN TRANSIT", "DELIVERED", "CANCELLED", "RETURNED") NOT NULL,
  `paymentInfo` VARCHAR(45) NOT NULL,
  `delivery_street_address` VARCHAR(100) NULL,
  `delivery_city` VARCHAR(60) NULL,
  `delivery_state` VARCHAR(50) NULL,
  `delivery_country` VARCHAR(55) NULL,
  `cart_id` INT UNSIGNED NOT NULL,
  `email` VARCHAR(254) NOT NULL,
  `date` DATETIME NOT NULL,
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `delivery_zip` VARCHAR(45) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_guest_order_cart_cart_id_idx` (`cart_id` ASC),
  CONSTRAINT `fk_guest_order_cart_cart_id`
    FOREIGN KEY (`cart_id`)
    REFERENCES `heroku_c26fdad3f72b054`.`Cart` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `heroku_c26fdad3f72b054`.`Review`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `heroku_c26fdad3f72b054`.`Review` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `heroku_c26fdad3f72b054`.`Review` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `review` VARCHAR(250) NULL,
  `rating` TINYINT(3) NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `date` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_review_product_product_id_idx` (`product_id` ASC),
  INDEX `fk_review_user_user_id_idx` (`user_id` ASC),
  CONSTRAINT `fk_review_product_product_id`
    FOREIGN KEY (`product_id`)
    REFERENCES `heroku_c26fdad3f72b054`.`Product` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_review_user_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `heroku_c26fdad3f72b054`.`User` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `heroku_c26fdad3f72b054`.`Product_Location`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `heroku_c26fdad3f72b054`.`Product_Location` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `heroku_c26fdad3f72b054`.`Product_Location` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category` VARCHAR(45) NOT NULL,
  `aisle` VARCHAR(45) NOT NULL,
  `shelf` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `heroku_c26fdad3f72b054`.`ProductProduct_Location`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `heroku_c26fdad3f72b054`.`ProductProduct_Location` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `heroku_c26fdad3f72b054`.`ProductProduct_Location` (
  `productID` INT NOT NULL,
  `productLocationID` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`productID`, `productLocationID`),
  INDEX `fk_productLocationID_idx` (`productLocationID` ASC),
  CONSTRAINT `fk_productID`
    FOREIGN KEY (`productID`)
    REFERENCES `heroku_c26fdad3f72b054`.`Product` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_productLocationID`
    FOREIGN KEY (`productLocationID`)
    REFERENCES `heroku_c26fdad3f72b054`.`Product_Location` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SHOW WARNINGS;

-- -----------------------------------------------------
-- Table `heroku_c26fdad3f72b054`.`Password_Reset`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `heroku_c26fdad3f72b054`.`Password_Reset` ;

SHOW WARNINGS;
CREATE TABLE IF NOT EXISTS `heroku_c26fdad3f72b054`.`Password_Reset` (
  `token` BINARY(60) NOT NULL,
  `user_email` VARCHAR(254) NOT NULL,
  `expiration` DATETIME NOT NULL,
  PRIMARY KEY (`token`, `user_email`, `expiration`),
  UNIQUE INDEX `token_UNIQUE` (`token` ASC),
  UNIQUE INDEX `user_UNIQUE` (`user_email` ASC),
  CONSTRAINT `fk_email`
    FOREIGN KEY (`user_email`)
    REFERENCES `heroku_c26fdad3f72b054`.`User` (`email`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SHOW WARNINGS;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
