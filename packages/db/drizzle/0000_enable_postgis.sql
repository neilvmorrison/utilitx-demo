-- Run once on a fresh database before applying Drizzle schema migrations.
-- Enables the PostGIS extension for geographic/spatial data types and functions.
CREATE EXTENSION IF NOT EXISTS postgis;
