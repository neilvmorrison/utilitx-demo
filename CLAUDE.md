# CLAUDE.md

This is a sandbox project to explore using DeckGL to create maps/visuals from raw ArcGIS data.

The intent is to be able to:

Render a map in 3D using ArcGIS data and allow application users to add visual elements to them. For example:

- creating a colored line to act as an interactive bounding box around a city block that can store and display custom metadata
- drawing subterranean gas pipelines and orient them in 3D space

Stack:

- latest version of NextJS
- DeckGL
- ArcGIS API response

Constraint:

- Will likely be used by city officials so must be performant on standard-issue hardware.
