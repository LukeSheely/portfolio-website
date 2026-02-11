-- ============================================================================
-- Seed Data — Realistic sample content for local development
-- Run after schema.sql to populate the database with demo data.
-- ============================================================================

-- Tags
INSERT INTO tags (name) VALUES
    ('Python'),
    ('JavaScript'),
    ('React'),
    ('Flask'),
    ('PostgreSQL'),
    ('AWS'),
    ('Docker'),
    ('Machine Learning'),
    ('REST API'),
    ('Node.js');

-- Projects
INSERT INTO projects (title, description, tech_stack, live_url, github_url, image_url, featured, created_at) VALUES
(
    'Weather Dashboard',
    'A real-time weather dashboard that pulls data from the OpenWeather API and displays forecasts with interactive charts. Features include location search, 7-day forecasts, and historical weather trends.',
    'React, Node.js, Chart.js, OpenWeather API',
    'https://weather-demo.example.com',
    'https://github.com/lukesheely/weather-dashboard',
    NULL,
    TRUE,
    '2025-09-15 10:00:00'
),
(
    'Task Management API',
    'A RESTful API for managing tasks and projects, built with Flask and PostgreSQL. Supports user authentication, task assignment, due dates, and priority levels. Includes comprehensive API documentation.',
    'Python, Flask, PostgreSQL, JWT Auth',
    NULL,
    'https://github.com/lukesheely/task-api',
    NULL,
    TRUE,
    '2025-11-01 14:30:00'
),
(
    'E-Commerce Data Pipeline',
    'An ETL pipeline that processes e-commerce transaction data, performs analysis, and generates daily sales reports. Uses pandas for data transformation and PostgreSQL for storage.',
    'Python, pandas, PostgreSQL, AWS S3',
    NULL,
    'https://github.com/lukesheely/ecommerce-pipeline',
    NULL,
    FALSE,
    '2025-07-20 09:00:00'
),
(
    'Chat Application',
    'A real-time chat application with WebSocket support. Features include private messaging, group channels, message history, and online status indicators.',
    'React, Node.js, Socket.io, MongoDB',
    'https://chat-demo.example.com',
    'https://github.com/lukesheely/chat-app',
    NULL,
    TRUE,
    '2026-01-10 16:00:00'
),
(
    'ML Image Classifier',
    'A machine learning model that classifies images into categories using a convolutional neural network. Includes a web interface for uploading and classifying images.',
    'Python, TensorFlow, Flask, Docker',
    NULL,
    'https://github.com/lukesheely/image-classifier',
    NULL,
    FALSE,
    '2025-06-05 11:00:00'
);

-- Project-Tag associations (many-to-many)
-- Weather Dashboard: React, JavaScript, Node.js
INSERT INTO project_tags (project_id, tag_id) VALUES (1, 3), (1, 2), (1, 10);
-- Task Management API: Python, Flask, PostgreSQL, REST API
INSERT INTO project_tags (project_id, tag_id) VALUES (2, 1), (2, 4), (2, 5), (2, 9);
-- E-Commerce Pipeline: Python, PostgreSQL, AWS
INSERT INTO project_tags (project_id, tag_id) VALUES (3, 1), (3, 5), (3, 6);
-- Chat Application: React, JavaScript, Node.js
INSERT INTO project_tags (project_id, tag_id) VALUES (4, 3), (4, 2), (4, 10);
-- ML Image Classifier: Python, Flask, Docker, Machine Learning
INSERT INTO project_tags (project_id, tag_id) VALUES (5, 1), (5, 4), (5, 7), (5, 8);

-- Blog Posts
INSERT INTO posts (title, content, slug, published, created_at, updated_at) VALUES
(
    'Building REST APIs with Flask and PostgreSQL',
    'In this post, I walk through building a production-ready REST API using Flask and PostgreSQL. We cover project structure, database connection pooling, error handling, and writing clean SQL queries.

## Why Raw SQL?

While ORMs like SQLAlchemy are powerful, writing raw SQL gives you full control over your queries and helps you understand exactly what''s happening at the database level. For performance-critical applications, this understanding is essential.

## Setting Up the Database Connection

We use psycopg2 with a connection pool to efficiently manage database connections. Here''s the basic setup...

## Writing Clean Queries

Each query should be parameterized to prevent SQL injection. Never concatenate user input directly into your SQL strings.',
    'building-rest-apis-flask-postgresql',
    TRUE,
    '2025-10-15 09:00:00',
    '2025-10-15 09:00:00'
),
(
    'My Experience with AWS for Side Projects',
    'AWS can seem overwhelming at first, but for side projects you really only need a few services. In this post, I share my setup: RDS for the database, S3 for file storage, and SES for sending emails.

## Starting Small

You don''t need to learn every AWS service. Start with the basics: EC2 or Elastic Beanstalk for hosting, RDS for your database, and S3 for static files. These three services cover 90% of what a typical web app needs.

## Cost Management

The free tier is generous for learning. An RDS db.t3.micro instance, a small S3 bucket, and basic SES usage will cost nearly nothing while you''re developing.',
    'aws-for-side-projects',
    TRUE,
    '2025-12-01 14:00:00',
    '2025-12-01 14:00:00'
),
(
    'Database Design Patterns I Use in Every Project',
    'Good database design is the foundation of any reliable application. Here are the patterns I follow: proper normalization, meaningful indexes, foreign key constraints, and junction tables for many-to-many relationships.

## Normalization

Store each piece of data in exactly one place. If you find yourself duplicating data across tables, it''s time to normalize.

## Indexes

Add indexes on columns you frequently filter or sort by. But don''t over-index — each index adds overhead to write operations.',
    'database-design-patterns',
    TRUE,
    '2026-01-20 10:00:00',
    '2026-01-20 10:00:00'
),
(
    'Draft: Deploying with Docker Compose',
    'This is a work-in-progress post about using Docker Compose for local development and deployment...',
    'deploying-with-docker-compose',
    FALSE,
    '2026-02-05 08:00:00',
    '2026-02-05 08:00:00'
);

-- Contact Messages (sample)
INSERT INTO contact_messages (name, email, message, created_at) VALUES
(
    'Jane Smith',
    'jane.smith@example.com',
    'Hi! I saw your portfolio and I''d love to discuss a potential internship opportunity. Please reach out when you get a chance.',
    '2026-01-25 15:30:00'
),
(
    'Bob Johnson',
    'bob.j@techcompany.com',
    'Great work on the Task Management API project. Would you be open to contributing to an open-source project with a similar stack?',
    '2026-02-01 10:00:00'
);
