-- ============================================================================
-- Portfolio Website Database Schema
-- Database: PostgreSQL
-- Purpose: Demonstrates normalized relational database design with proper
--          constraints, indexes, and foreign key relationships.
-- ============================================================================

-- ============================================================================
-- TABLE: projects
-- Stores portfolio project entries. Each project has metadata, links, and
-- an optional image stored in S3.
-- ============================================================================
CREATE TABLE projects (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(200)  NOT NULL,
    description TEXT          NOT NULL,
    tech_stack  VARCHAR(500)  NOT NULL,       -- Comma-separated list (e.g. "Python, Flask, PostgreSQL")
    live_url    VARCHAR(500),                  -- URL to the live demo (nullable)
    github_url  VARCHAR(500),                  -- URL to the GitHub repo (nullable)
    image_url   VARCHAR(500),                  -- S3 URL for project screenshot (nullable)
    featured    BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index: speeds up filtering by featured status (used on the homepage)
CREATE INDEX idx_projects_featured ON projects (featured);

-- Index: speeds up ordering by creation date
CREATE INDEX idx_projects_created_at ON projects (created_at);


-- ============================================================================
-- TABLE: posts
-- Stores blog/post entries. Uses a slug for SEO-friendly URLs and a
-- published flag to support draft functionality.
-- ============================================================================
CREATE TABLE posts (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(300)  NOT NULL,
    content     TEXT          NOT NULL,
    slug        VARCHAR(300)  NOT NULL UNIQUE, -- URL-friendly identifier
    published   BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index: speeds up lookup by slug (used for individual post pages)
CREATE INDEX idx_posts_slug ON posts (slug);

-- Index: speeds up filtering by published status
CREATE INDEX idx_posts_published ON posts (published);


-- ============================================================================
-- TABLE: tags
-- Stores tag names for categorizing projects. Kept in a separate table
-- to avoid duplication and enable a proper many-to-many relationship.
-- ============================================================================
CREATE TABLE tags (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);


-- ============================================================================
-- TABLE: project_tags (Junction Table)
-- Implements the many-to-many relationship between projects and tags.
-- A project can have multiple tags, and a tag can belong to multiple projects.
-- ============================================================================
CREATE TABLE project_tags (
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tag_id     INTEGER NOT NULL REFERENCES tags(id)     ON DELETE CASCADE,
    PRIMARY KEY (project_id, tag_id)
);

-- Index: speeds up lookups from the tag side (e.g. "find all projects with tag X")
CREATE INDEX idx_project_tags_tag_id ON project_tags (tag_id);


-- ============================================================================
-- TABLE: contact_messages
-- Stores messages submitted through the contact form. In production,
-- these are also forwarded via AWS SES email.
-- ============================================================================
CREATE TABLE contact_messages (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(200) NOT NULL,
    email      VARCHAR(300) NOT NULL,
    message    TEXT         NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index: speeds up ordering messages by date (admin view)
CREATE INDEX idx_contact_messages_created_at ON contact_messages (created_at);
