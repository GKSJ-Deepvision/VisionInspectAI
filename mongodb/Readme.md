# MongoDB Module for VisionInspect-AI

## Overview

This repository contains the MongoDB integration module developed for the VisionInspect-AI backend.

The module is responsible for storing and retrieving AI inference results generated during the image inspection process.

The SQL database (PostgreSQL) stores structured inspection records, while MongoDB stores detailed AI inference outputs. Both databases are linked using the `inspection_id`.

---

## Folder Structure

```
database/
    mongo_connection.py

services/
    inference_log_service.py

routes/
    inspection.py

.env.example
```

---

## Components

### mongo_connection.py

- Establishes a connection with MongoDB Atlas.
- Reads MongoDB credentials from environment variables.
- Returns the MongoDB database instance.

---

### inference_log_service.py

Provides two services:

- Save AI inference results
- Retrieve inference results using `inspection_id`

---

### inspection.py

Contains the required integration changes for the backend.

After an inspection record is created in PostgreSQL, call:

```python
save_inference_result(...)
```

using the generated `inspection_id`.

---

## Technologies

- Python
- Flask
- PyMongo
- MongoDB Atlas
- MongoDB Compass

---

## Database Relationship

```
PostgreSQL
inspection_results
        │
        │ inspection_id
        ▼
MongoDB
inference_results
```

---

## Status

✅ MongoDB Atlas Connected

✅ CRUD Operations Tested

✅ Insert Operation Verified

✅ Read Operation Verified

✅ Ready for Backend Integration
