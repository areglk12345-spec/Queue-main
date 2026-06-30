-- ==========================================
-- 1. DATABASE INITIALIZATION
-- ==========================================
CREATE DATABASE IF NOT EXISTS lineoa_ncsa;
USE lineoa_ncsa;

-- ==========================================
-- 2. TABLE DEFINITIONS
-- ==========================================

-- Table: queues
-- Description: Stores all visitor queue information and status
CREATE TABLE IF NOT EXISTS queues (
    -- Internal Identifiers
    id              INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Queue Identity
    queue_number    VARCHAR(10) NOT NULL COMMENT 'Formatted queue number (e.g., 001)',
    status          ENUM('waiting', 'calling', 'completed', 'cancelled') 
                    DEFAULT 'waiting' COMMENT 'Current lifecycle state of the queue',
    
    -- Visitor Information
    name            VARCHAR(255) NOT NULL COMMENT 'Full name of the visitor',
    contact         VARCHAR(20) NOT NULL COMMENT '10-digit numeric phone number',
    line_user_id    VARCHAR(255) NULL COMMENT 'LINE User ID for Messaging API push notifications',
    
    -- Meeting Details
    meeting_target  VARCHAR(255) NOT NULL COMMENT 'Department or person being visited',
    
    -- Organization Details
    agency_type     VARCHAR(100) NOT NULL COMMENT 'Type: gov, private, or other',
    agency_other    VARCHAR(255) NULL COMMENT 'Specific name if agency_type is other',
    
    -- Logistics
    pax_type        VARCHAR(50) NOT NULL COMMENT 'Pax range or specific number',
    pax_other       INT NULL COMMENT 'Exact number of people if pax_type is more than 10',
    
    -- Audit Timestamps
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation date (used for daily reset logic)',
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: notifications
-- Description: Stores notifications for visitors
CREATE TABLE IF NOT EXISTS notifications (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    queue_id        INT NOT NULL COMMENT 'Link to the queue identity',
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (queue_id) REFERENCES queues(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. INDEXES (Optimization)
-- ==========================================
CREATE INDEX idx_created_at ON queues(created_at);
CREATE INDEX idx_status ON queues(status);
CREATE INDEX idx_line_id ON queues(line_user_id);
CREATE INDEX idx_notif_queue_id ON notifications(queue_id);
