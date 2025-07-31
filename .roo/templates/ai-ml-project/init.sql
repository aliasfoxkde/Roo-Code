-- init.sql for AI/ML Project Template

-- Create the database
CREATE DATABASE ai_ml_db;

-- Connect to the database
\c ai_ml_db;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create datasets table
CREATE TABLE datasets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    file_path VARCHAR(255),
    size BIGINT,
    row_count INTEGER,
    column_count INTEGER,
    project_id INTEGER REFERENCES projects(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create models table
CREATE TABLE models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    version VARCHAR(20),
    algorithm VARCHAR(50),
    file_path VARCHAR(255),
    accuracy DECIMAL(5,4),
    precision DECIMAL(5,4),
    recall DECIMAL(5,4),
    f1_score DECIMAL(5,4),
    project_id INTEGER REFERENCES projects(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create predictions table
CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    input_data JSONB,
    output_data JSONB,
    model_id INTEGER REFERENCES models(id),
    project_id INTEGER REFERENCES projects(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create experiments table
CREATE TABLE experiments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parameters JSONB,
    metrics JSONB,
    model_id INTEGER REFERENCES models(id),
    project_id INTEGER REFERENCES projects(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_datasets_project_id ON datasets(project_id);
CREATE INDEX idx_models_project_id ON models(project_id);
CREATE INDEX idx_predictions_model_id ON predictions(model_id);
CREATE INDEX idx_predictions_project_id ON predictions(project_id);
CREATE INDEX idx_experiments_model_id ON experiments(model_id);
CREATE INDEX idx_experiments_project_id ON experiments(project_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Insert sample data
INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES
('admin', 'admin@example.com', 'hashed_password_here', 'Admin', 'User'),
('data_scientist', 'ds@example.com', 'hashed_password_here', 'Data', 'Scientist'),
('ml_engineer', 'ml@example.com', 'hashed_password_here', 'ML', 'Engineer');

INSERT INTO projects (name, description, owner_id) VALUES
('Customer Churn Prediction', 'Predict customer churn using historical data', 2),
('Sales Forecasting', 'Forecast sales using time series analysis', 3),
('Image Classification', 'Classify images using deep learning', 2);

-- Create functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_datasets_updated_at BEFORE UPDATE ON datasets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_experiments_updated_at BEFORE UPDATE ON experiments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE users TO postgres;
GRANT ALL PRIVILEGES ON TABLE projects TO postgres;
GRANT ALL PRIVILEGES ON TABLE datasets TO postgres;
GRANT ALL PRIVILEGES ON TABLE models TO postgres;
GRANT ALL PRIVILEGES ON TABLE predictions TO postgres;
GRANT ALL PRIVILEGES ON TABLE experiments TO postgres;
GRANT ALL PRIVILEGES ON TABLE audit_logs TO postgres;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Create roles
CREATE ROLE app_user;
GRANT CONNECT ON DATABASE ai_ml_db TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Create views
CREATE VIEW user_projects AS
SELECT u.id as user_id, u.username, p.id as project_id, p.name as project_name
FROM users u
JOIN projects p ON u.id = p.owner_id;

CREATE VIEW model_performance AS
SELECT m.id, m.name, m.algorithm, m.accuracy, m.precision, m.recall, m.f1_score, p.name as project_name
FROM models m
JOIN projects p ON m.project_id = p.id;

-- Add comments
COMMENT ON TABLE users IS 'Users of the AI/ML platform';
COMMENT ON TABLE projects IS 'Machine learning projects';
COMMENT ON TABLE datasets IS 'Datasets used in projects';
COMMENT ON TABLE models IS 'Trained machine learning models';
COMMENT ON TABLE predictions IS 'Model predictions';
COMMENT ON TABLE experiments IS 'Model training experiments';
COMMENT ON TABLE audit_logs IS 'Audit trail of user actions';

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create a function to generate a random API key
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(digest(gen_random_bytes(32), 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Add API key column to users table
ALTER TABLE users ADD COLUMN api_key TEXT UNIQUE;

-- Generate API keys for existing users
UPDATE users SET api_key = generate_api_key();

-- Add a constraint to ensure API key is not null
ALTER TABLE users ALTER COLUMN api_key SET NOT NULL;