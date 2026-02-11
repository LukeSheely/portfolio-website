-- ============================================================================
-- SQL Query Showcase
-- Database: PostgreSQL
-- Purpose: Demonstrates a range of SQL skills including basic CRUD,
--          JOINs, aggregates, and security best practices.
--
-- Each query is documented with:
--   - What SQL concept it demonstrates
--   - What it's used for in the application
--   - The corresponding API endpoint
-- ============================================================================


-- ============================================================================
-- 1. Basic SELECT
-- Demonstrates: Simple SELECT with WHERE clause
-- Purpose: Fetch all published blog posts for the public blog page
-- API Endpoint: GET /api/posts
-- ============================================================================
SELECT id, title, slug, created_at, updated_at
FROM posts
WHERE published = TRUE
ORDER BY created_at DESC;


-- ============================================================================
-- 2. WHERE + ORDER BY
-- Demonstrates: Filtering with boolean condition + sorting results
-- Purpose: Fetch featured projects for the homepage spotlight section
-- API Endpoint: GET /api/projects?featured=true
-- ============================================================================
SELECT id, title, description, tech_stack, live_url, github_url, image_url
FROM projects
WHERE featured = TRUE
ORDER BY created_at DESC;


-- ============================================================================
-- 3. JOIN (many-to-many through junction table)
-- Demonstrates: INNER JOIN across three tables to resolve a many-to-many relationship
-- Purpose: Fetch each project along with its associated tag names
-- API Endpoint: GET /api/projects/:id
-- ============================================================================
SELECT
    p.id,
    p.title,
    p.description,
    p.tech_stack,
    p.live_url,
    p.github_url,
    p.image_url,
    p.featured,
    p.created_at,
    COALESCE(
        json_agg(json_build_object('id', t.id, 'name', t.name))
        FILTER (WHERE t.id IS NOT NULL),
        '[]'
    ) AS tags
FROM projects p
LEFT JOIN project_tags pt ON p.id = pt.project_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.id = 1  -- Parameterized in application code as $1
GROUP BY p.id;


-- ============================================================================
-- 4. Aggregate + GROUP BY
-- Demonstrates: COUNT aggregate with GROUP BY and JOIN
-- Purpose: Get the number of projects per tag for a tag cloud / sidebar
-- API Endpoint: GET /api/tags
-- ============================================================================
SELECT
    t.id,
    t.name,
    COUNT(pt.project_id) AS project_count
FROM tags t
LEFT JOIN project_tags pt ON t.id = pt.tag_id
GROUP BY t.id, t.name
ORDER BY project_count DESC;


-- ============================================================================
-- 5. INSERT — Add a new project
-- Demonstrates: INSERT with RETURNING clause (PostgreSQL feature)
-- Purpose: Create a new project from the admin page
-- API Endpoint: POST /api/admin/projects
-- ============================================================================
INSERT INTO projects (title, description, tech_stack, live_url, github_url, image_url, featured)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, title, created_at;

-- ============================================================================
-- 5b. INSERT — Add a new blog post
-- Demonstrates: INSERT with slug generation and default values
-- Purpose: Create a new blog post from the admin page
-- API Endpoint: POST /api/admin/posts
-- ============================================================================
INSERT INTO posts (title, content, slug, published)
VALUES ($1, $2, $3, $4)
RETURNING id, title, slug, created_at;

-- ============================================================================
-- 5c. INSERT — Associate tags with a project
-- Demonstrates: Batch INSERT for junction table (many-to-many)
-- Purpose: Link tags to a newly created project
-- API Endpoint: POST /api/admin/projects (called internally after project creation)
-- ============================================================================
INSERT INTO project_tags (project_id, tag_id)
VALUES ($1, $2);
-- In application code, this is called in a loop or with unnest() for multiple tags


-- ============================================================================
-- 6. UPDATE — Edit an existing project
-- Demonstrates: UPDATE with WHERE clause and RETURNING
-- Purpose: Modify project details from the admin page
-- API Endpoint: PUT /api/admin/projects/:id
-- ============================================================================
UPDATE projects
SET title = $1,
    description = $2,
    tech_stack = $3,
    live_url = $4,
    github_url = $5,
    image_url = $6,
    featured = $7
WHERE id = $8
RETURNING id, title, created_at;


-- ============================================================================
-- 7. DELETE — Remove a contact message
-- Demonstrates: DELETE with WHERE clause
-- Purpose: Admin can delete a contact message after reading it
-- API Endpoint: DELETE /api/admin/messages/:id
-- ============================================================================
DELETE FROM contact_messages
WHERE id = $1
RETURNING id;


-- ============================================================================
-- 8. Parameterized Queries — SQL Injection Prevention
-- Demonstrates: Why parameterized queries matter for security
-- Purpose: Educational — shows the WRONG way vs the RIGHT way
-- ============================================================================

-- WRONG: String concatenation (VULNERABLE to SQL injection)
-- An attacker could input: ' OR 1=1; DROP TABLE projects; --
-- This would execute:
--   SELECT * FROM posts WHERE slug = '' OR 1=1; DROP TABLE projects; --'
--
-- NEVER DO THIS:
-- query = "SELECT * FROM posts WHERE slug = '" + user_input + "'"

-- RIGHT: Parameterized query (SAFE from SQL injection)
-- The database driver treats $1 as a value, never as SQL code.
-- Even if user_input is "' OR 1=1; DROP TABLE projects; --",
-- the database safely searches for a slug with that literal string.
SELECT id, title, content, slug, published, created_at, updated_at
FROM posts
WHERE slug = $1;

-- In Python (psycopg2), parameterized queries look like this:
--   cursor.execute("SELECT * FROM posts WHERE slug = %s", (user_input,))
--
-- The %s is a placeholder — psycopg2 handles escaping and type conversion.
-- The user input is passed as a tuple, separate from the SQL string.


-- ============================================================================
-- BONUS: Subquery + EXISTS
-- Demonstrates: Subquery with EXISTS for filtering
-- Purpose: Find projects that have at least one tag
-- ============================================================================
SELECT p.id, p.title
FROM projects p
WHERE EXISTS (
    SELECT 1
    FROM project_tags pt
    WHERE pt.project_id = p.id
);


-- ============================================================================
-- BONUS: INSERT with ON CONFLICT (upsert)
-- Demonstrates: PostgreSQL UPSERT — insert or update on conflict
-- Purpose: Add a tag, or do nothing if it already exists
-- ============================================================================
INSERT INTO tags (name)
VALUES ($1)
ON CONFLICT (name) DO NOTHING
RETURNING id, name;
