# Local Database

SQLite3 (python default)

| # | column | type | description |
| --- | --- | --- | --- |
| 0 | `source_id` | INTEGER PRIMARY KEY AUTOINCREMENT | |
| 1 | `source_type` | TEXT  | folder or cloud storage (future?)  |
| 2 | `path` | TEXT | folder full path |
| 3 | `name` | TEXT | forder name |
| 4 | `count` | INTEGER | number of images in folder |
| 5 | `created` | INTEGER | |
| 6 | `status` | TEXT | |
| 7 | `description` | TEXT | save project/study area/deployment |


| # | column | type | description |
| --- | --- | --- | --- |
| 0 | `image_id` | INTEGER PRIMARY KEY AUTOINCREMENT |  |
| 1 | `path` | TEXT | imaeg file full path |
| 2 | `name` | TEXT | image file name |
| 3 | `timestamp` | INTEGER | unix epoch time|
| 4 | `timestamp_via` | TEXT | via exif or unix stat mtime |
| 5 | `status` | TEXT |
| 6 | `hash` | TEXT | md5 hash |
| 7 | `annotation` | TEXT | serialized json |
| 8 | `changed` | INTEGER | |
| 9 | `exif` | TEXT | |
| 10 | `source_id` | INTEGER | foreign_key to source |
| 11 | `server_image_id` | TEXT | |

