# NCPL Alumni Connect – API Sample Requests & Responses

Base URL: `http://localhost:5000/api`

---

## Authentication

### 1. Register a new user

**POST** `/auth/register`

**Request:**
```json
{
  "name": "Deepika Nair",
  "email": "deepika@ncpl.in",
  "password": "demo1234",
  "role": "trainee",
  "batch": "2024",
  "domain": "Web Development"
}
```

**Response `201`:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f9b2c3a1e2d4f5e6a7b8c9",
    "name": "Deepika Nair",
    "email": "deepika@ncpl.in",
    "role": "trainee",
    "batch": "2024",
    "domain": "Web Development"
  }
}
```

---

### 2. Login

**POST** `/auth/login`

**Request:**
```json
{
  "email": "deepika@ncpl.in",
  "password": "demo1234"
}
```

**Response `200`:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f9b2c3a1e2d4f5e6a7b8c9",
    "name": "Deepika Nair",
    "email": "deepika@ncpl.in",
    "role": "trainee",
    "batch": "2024",
    "domain": "Web Development"
  }
}
```

**Response `401` (wrong credentials):**
```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

---

### 3. Get current user

**GET** `/auth/me`  
**Header:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "success": true,
  "user": {
    "id": "64f9b2c3a1e2d4f5e6a7b8c9",
    "name": "Deepika Nair",
    "email": "deepika@ncpl.in",
    "role": "trainee",
    "batch": "2024",
    "domain": "Web Development"
  }
}
```

---

## Alumni Search

> All `/api/alumni/*` endpoints require `Authorization: Bearer <token>`.

---

### 4. Search alumni (no filters – returns all)

**GET** `/alumni/search`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f9b2c3a1e2d4f5e6a7b8d1",
      "fullName": "Priya Sharma",
      "email": "priya.sharma@example.com",
      "company": "TCS",
      "jobRole": "Software Engineer",
      "technologies": ["React", "Node.js", "MongoDB", "JavaScript"],
      "yearsOfExperience": 2,
      "linkedinProfile": "https://linkedin.com/in/priya-sharma",
      "availabilityStatus": "available",
      "profilePhoto": "",
      "batch": "2022",
      "location": "Hyderabad",
      "domain": "Web Development",
      "bio": "Placed from NCPL in 2022. Happy to mentor trainees in full stack development.",
      "avatarInitials": "PS",
      "avatarColor": "#1A3C6E",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 9,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 5. Search by technology (single)

**GET** `/alumni/search?technology=React`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f9b2c3a1e2d4f5e6a7b8d1",
      "fullName": "Priya Sharma",
      "technologies": ["React", "Node.js", "MongoDB", "JavaScript"],
      "company": "TCS",
      "jobRole": "Software Engineer",
      "yearsOfExperience": 2,
      "availabilityStatus": "available"
    },
    {
      "_id": "64f9b2c3a1e2d4f5e6a7b8d7",
      "fullName": "Divya Menon",
      "technologies": ["React", "TypeScript", "Redux", "GraphQL"],
      "company": "Accenture",
      "jobRole": "React Developer",
      "yearsOfExperience": 2,
      "availabilityStatus": "available"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 9,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 6. Search by multiple technologies (OR logic)

**GET** `/alumni/search?technology=React,Node.js`

---

### 7. Filter by company

**GET** `/alumni/search?company=TCS`

---

### 8. Filter by job role

**GET** `/alumni/search?jobRole=DevOps%20Engineer`

---

### 9. Filter by years of experience range

**GET** `/alumni/search?minExp=2&maxExp=4`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "fullName": "Priya Sharma",
      "yearsOfExperience": 2,
      "company": "TCS"
    },
    {
      "fullName": "Ravi Kumar",
      "yearsOfExperience": 3,
      "company": "Infosys"
    },
    {
      "fullName": "Sneha Patel",
      "yearsOfExperience": 3,
      "company": "HCL Technologies"
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 9,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 10. Full-text keyword search

**GET** `/alumni/search?q=Java`

---

### 11. Filter by availability

**GET** `/alumni/search?availability=available`

---

### 12. Combined filters + pagination + sorting

**GET** `/alumni/search?technology=React&availability=available&sortBy=yearsOfExperience&sortOrder=desc&page=1&limit=5`

---

### 13. Get a single alumni profile

**GET** `/alumni/64f9b2c3a1e2d4f5e6a7b8d1`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "_id": "64f9b2c3a1e2d4f5e6a7b8d1",
    "fullName": "Priya Sharma",
    "email": "priya.sharma@example.com",
    "company": "TCS",
    "jobRole": "Software Engineer",
    "technologies": ["React", "Node.js", "MongoDB", "JavaScript"],
    "yearsOfExperience": 2,
    "linkedinProfile": "https://linkedin.com/in/priya-sharma",
    "availabilityStatus": "available",
    "profilePhoto": "",
    "batch": "2022",
    "location": "Hyderabad",
    "domain": "Web Development",
    "bio": "Placed from NCPL in 2022. Happy to mentor trainees in full stack development.",
    "avatarInitials": "PS",
    "avatarColor": "#1A3C6E",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response `404` (not found):**
```json
{
  "success": false,
  "message": "Alumni not found."
}
```

---

### 14. Get filter dropdown options

**GET** `/alumni/filters/options`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "technologies": [
      "Android", "Angular", "AWS", "Docker", "Firebase",
      "Hibernate", "Java", "Jenkins", "Jetpack Compose",
      "Jira", "Kotlin", "Kubernetes", "Manual Testing",
      "MongoDB", "MySQL", "Node.js", "Pandas", "Postman",
      "PostgreSQL", "Power BI", "Python", "React",
      "Redux", "Selenium", "Spring Boot", "SQL",
      "TypeScript"
    ],
    "companies": [
      "Accenture", "Capgemini", "Cognizant", "HCL Technologies",
      "Infosys", "TCS", "Tech Mahindra", "Wipro"
    ],
    "jobRoles": [
      "Android Developer", "Data Analyst", "DevOps Engineer",
      "Full Stack Developer", "Java Developer", "QA Engineer",
      "React Developer", "Software Engineer"
    ],
    "availabilityStatuses": ["available", "busy", "not_available"]
  }
}
```

---

## Error Responses

### 401 – Unauthenticated
```json
{
  "success": false,
  "message": "Not authorised. No token provided."
}
```

### 422 – Validation error
```json
{
  "success": false,
  "errors": [
    { "msg": "Valid email is required", "path": "email" },
    { "msg": "Password must be at least 6 characters", "path": "password" }
  ]
}
```

### 500 – Server error (development mode includes stack)
```json
{
  "success": false,
  "message": "Internal Server Error",
  "stack": "Error: ...\n    at ..."
}
```

---

## Query Parameter Reference

| Parameter      | Type   | Description                              | Example               |
|----------------|--------|------------------------------------------|-----------------------|
| `q`            | string | Full-text keyword search                 | `q=Java`              |
| `technology`   | string | Comma-separated technologies             | `technology=React,AWS`|
| `company`      | string | Partial company name match               | `company=TCS`         |
| `jobRole`      | string | Partial job role match                   | `jobRole=DevOps`      |
| `minExp`       | number | Minimum years of experience              | `minExp=2`            |
| `maxExp`       | number | Maximum years of experience              | `maxExp=5`            |
| `availability` | string | `available` \| `busy` \| `not_available` | `availability=available` |
| `sortBy`       | string | `fullName` \| `company` \| `yearsOfExperience` \| `createdAt` | `sortBy=yearsOfExperience` |
| `sortOrder`    | string | `asc` \| `desc`                          | `sortOrder=desc`      |
| `page`         | number | Page number (default: 1)                 | `page=2`              |
| `limit`        | number | Results per page, max 50 (default: 10)   | `limit=20`            |
