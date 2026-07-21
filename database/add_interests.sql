-- ============================================================================
-- Migration: add the `interests` table (Interests page cards)
-- Safe to run against an existing database — creates the table only if it
-- doesn't exist and seeds the three default interests only when empty.
-- ============================================================================

CREATE TABLE IF NOT EXISTS interests (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(120) NOT NULL,
    tag         VARCHAR(160) NOT NULL DEFAULT '',
    blurb       VARCHAR(300) NOT NULL DEFAULT '',
    description TEXT         NOT NULL DEFAULT '',
    accent      VARCHAR(9)   NOT NULL DEFAULT '#6fe7c1',
    theme       VARCHAR(40)  NOT NULL DEFAULT 'none',
    sort_order  INTEGER      NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_interests_sort_order ON interests (sort_order);

-- Seed the defaults only if the table is currently empty.
INSERT INTO interests (title, tag, blurb, description, accent, theme, sort_order)
SELECT * FROM (VALUES
    (
        'Destiny 2',
        'Raiding · PvP · Lore',
        'Endgame raids and Crucible.',
        'Deep in the endgame — day-one raid attempts, weekly clears, and a soft spot for the Vow of the Disciple encounter design. Equal parts mechanics, coordination, and lore rabbit-holes.',
        '#3ce0cd',
        'destiny2',
        1
    ),
    (
        'osu!',
        'Rhythm · Aim · Reaction',
        'Clicking circles to music.',
        'The rhythm game that wrecked my reaction time in the best way. Chasing cleaner aim, higher accuracy, and that flow state where the map just reads itself.',
        '#ff66ab',
        'osu',
        2
    ),
    (
        'Wakesurfing',
        'Summers on the water',
        'Trading the desk for the lake.',
        'Warm-weather reset button — chasing the wake, carving lines, and generally being anywhere near open water when the weather allows.',
        '#41b8e0',
        'wakesurf',
        3
    )
) AS defaults(title, tag, blurb, description, accent, theme, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM interests);
