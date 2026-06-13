# 🏗 Pharmora Architecture

## Open pharmacy learning ecosystem architecture

This document describes the planned technical structure of Pharmora.

---

# 🌱 Architecture Philosophy

Pharmora follows:

- Open source first
- Modular design
- Scalable development
- Simple contribution workflow
- Privacy focused systems

Start simple.

Improve continuously.

---

# Current Architecture

Status:

Prototype Phase

```text
User

 ↓

GitHub Pages

 ↓

HTML + CSS + JavaScript
```

Current purpose:

- Validate UI
- Build design language
- Collect ideas
- Prepare community

---

# Frontend Structure


Current:

```text
pharmora/

├── index.html

├── learn/
├── teach/
├── community/
├── tools/
├── library/

├── css/
├── js/
└── assets/
```


Responsibilities:

## HTML

Structure and content


## CSS

Design system and responsive UI


## JavaScript

Interactions and client features


---

# Future Frontend


Possible migration:

```text
Static Prototype

        ↓

Component Frontend

        ↓

Progressive Web App
```


Goals:

- Reusable components
- Offline support
- Fast loading
- Mobile experience

---

# Core Modules


## Learning Module

Handles:

```text
Course

 ↓

Curriculum

 ↓

Semester / Year

 ↓

Subject

 ↓

Topic

 ↓

Resource
```


Example:

```text
B.Pharm

 └── NEP Curriculum

      └── Semester 1

           └── Pharmaceutics

                └── Tablets
```

---

# Teacher Module


Handles:

```text
Teacher

 ↓

Uploads

 ↓

Review

 ↓

Verified Resource
```


Content:

- Notes
- PPT
- Teaching methods
- Course files

---

# Community Module


Handles:

```text
Question

 ↓

Answers

 ↓

Review

 ↓

Knowledge improvement
```


Features:

- Discussions
- Reputation
- Verification

---

# Future Backend


Planned:

```text
Frontend

    |

API Layer

    |

Backend

    |

Database
```


Backend responsibilities:

- Authentication
- Users
- Resources
- Search
- Moderation
- Analytics

---

# Database Concept


Possible entities:

```text
Users

Courses

Curriculums

Subjects

Topics

Resources

Questions

Answers

Contributions
```

---

# User Roles


```text
Visitor

Student

Teacher

Contributor

Moderator

Admin
```

---

# Content Review Flow


```text
Upload Resource

        ↓

Pending Review

        ↓

Verification

        ↓

Published Resource
```

---

# Storage Concept


Resources:

- Documents
- Images
- Presentations
- Learning files


Stored with:

- Metadata
- Tags
- Curriculum mapping

---

# Search System


Future search should support:

- Course search
- Subject search
- Drug search
- Topic search
- Community answers

---

# Security Goals


Future:

- Secure authentication
- Role permissions
- Content moderation
- Data protection

---

# Long Term Vision


```text
Website

   ↓

Learning Platform

   ↓

Open Pharmacy Knowledge Network
```

---

⚕️ Pharmora should remain simple, open, and useful.