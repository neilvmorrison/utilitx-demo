# Database

## Formatting and Defaults

- use uuids for primary keys
- all records have created_at, updated_at and deleted_at columns with appropriate default values
- all fkeys properly indexed to optimize for read/write performance
- employ a soft-delete pattern, maybe with a cron to cleanup old records.

## User Profiles

- email
- first_name
- last_name
- middle_name (optional)
- avatar_url (optional)
- organization_id

## Projects

- owner_id (user profile ref)
- organization_id (organization profile ref)
- name

## Geometries

- project_id
- // gis stuff to indicate location
- // metadata
- // currently stored in localstorage:

path:

{
"id": "6f456dc0-b6e2-42de-a6f1-d02d9f95b2e3",
"isHidden": false,
"name": "Area #1",
"color": "#ff4a55",
"width": 4,
"isClosed": true,
"layerId": "default",
"nodes": [
{
"id": "11795a46-e5da-4d4e-953d-8d94e2500342",
"name": "Node 1",
"coords": [
-79.39553964414611,
43.64687121741865
],
"z": 0
},
{
"id": "448e5b9b-d4c8-41b6-b069-6199fb579187",
"name": "Node 2",
"coords": [
-79.39386594572082,
43.64274091155394
],
"z": 0
},
{
"id": "1fb0c581-1b13-4acb-8a4c-6c05e4b3ee0b",
"name": "Node 3",
"coords": [
-79.38493955411927,
43.64472846260557
],
"z": 0
},
{
"id": "11e0bc62-8c21-4f3e-8b19-11c34ea8b0e1",
"name": "Node 4",
"coords": [
-79.3865703372004,
43.6487033674354
],
"z": 0
}
]
}

layer:
{
"id": "default",
"name": "Default",
"isVisible": true
}
