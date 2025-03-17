CREATE TABLE `users` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` varchar(100) NOT NULL,
    `password` varchar(100) NOT NULL,
    `name` varchar(100) NOT NULL,
    `company_name` varchar(100) NOT NULL,
    `role` ENUM('DOTCO_ADMIN', 'CLIENT', 'SUPPLIER') NOT NULL,
    `contact` varchar(100) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY (`user_id`)
);

CREATE TABLE `requests` (
    `id` int NOT NULL AUTO_INCREMENT,
    `client_id` int NOT NULL,
    `selected_quotes_id` int NULL,
    `status` ENUM('REGISTERED', 'REVIEWING', 'APPROVED', 'QUOTE_REQUESTED', 
                'QUOTE_COLLECTING', 'QUOTE_CLOSED', 'ORDER_CONFIRMED', 
                'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'REGISTERED',
    `title` varchar(100) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);

CREATE TABLE `files` (
    `file_id` int NOT NULL AUTO_INCREMENT,
    `request_id` int NOT NULL,
    `s3_file_key` VARCHAR(255) NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `size` int NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`file_id`)
);

CREATE TABLE `quote_requests` (
    `id` int NOT NULL AUTO_INCREMENT,
    `request_id` int NOT NULL,
    `supplier_id` int NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);

CREATE TABLE `quotes` (
    `quotes_id` int NOT NULL AUTO_INCREMENT,
    `quote_request_id` int NOT NULL, -- id2에서 명확한 이름으로 변경
    `estimated_cost` DECIMAL(15, 2) NOT NULL,
    `production_time` int NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`quotes_id`)
);

-- 외래 키 제약조건 추가
ALTER TABLE `requests` 
    ADD CONSTRAINT `FK_requests_client` FOREIGN KEY (`client_id`) REFERENCES `users`(`id`),
    ADD CONSTRAINT `FK_requests_quote` FOREIGN KEY (`selected_quotes_id`) REFERENCES `quotes`(`quotes_id`);

ALTER TABLE `files` 
    ADD CONSTRAINT `FK_files_request` FOREIGN KEY (`request_id`) REFERENCES `requests`(`id`) ON DELETE CASCADE;

ALTER TABLE `quote_requests` 
    ADD CONSTRAINT `FK_quoterequests_request` FOREIGN KEY (`request_id`) REFERENCES `requests`(`id`),
    ADD CONSTRAINT `FK_quoterequests_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `users`(`id`);

ALTER TABLE `quotes` 
    ADD CONSTRAINT `FK_quotes_quoterequest` FOREIGN KEY (`quote_request_id`) REFERENCES `quote_requests`(`id`);