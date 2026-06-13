# 🗄 Pharmora Database Plan

## Future data structure for the open pharmacy learning ecosystem

This document describes the planned database organization for Pharmora.

---

# 🌱 Database Philosophy

Pharmora data should be:

- Structured
- Searchable
- Curriculum aware
- Community driven
- Easy to expand

The goal is not just storing files.

The goal is organizing pharmacy knowledge.

---

# Core Data Relationship


```text
Course

  ↓

Curriculum

  ↓

Semester / Year

  ↓

Subject

  ↓

Unit

  ↓

Topic

  ↓

Resource

  ↓

Discussion
```

---

# Courses


Examples:

```text
B.Pharm
D.Pharm
M.Pharm
Pharm.D
```

Course fields:

```text
id

name

duration

description

status
```

---

# Curriculum


Supports:

- PCI Regulations
- NEP Curriculum
- University variations
- Future revisions


Fields:

```text
id

course_id

name

year

authority

description
```

---

# Subjects


Example:

```text
Human Anatomy and Physiology

Pharmaceutics

Pharmaceutical Chemistry

Pharmacology
```


Fields:

```text
id

curriculum_id

semester

name

code

description
```

---

# Topics


Example:

```text
Pharmaceutics

 ↓

Tablets

 ↓

Compression defects
```


Fields:

```text
id

subject_id

unit

title

description
```

---

# Resources


Resource types:

- Notes
- PPT
- Videos
- Question papers
- MCQs
- Practical files
- Teacher material


Fields:

```text
id

topic_id

title

type

file_url

uploaded_by

verified_status

created_date
```

---

# Users


User roles:

```text
Student

Teacher

Contributor

Moderator

Admin
```


Fields:

```text
id

name

email

role

course

curriculum

reputation
```

---

# Teacher System


```text
Teacher

 ↓

Verification

 ↓

Resource Contributor
```


Fields:

```text
teacher_id

qualification

verification_status

contributions
```

---

# Community System


Questions:

```text
id

user_id

topic_id

question

created_date
```


Answers:

```text
id

question_id

user_id

answer

verified
```

---

# Contribution Tracking


Every improvement is tracked.


```text
Contribution

 ↓

Review

 ↓

Approval

 ↓

Publication
```


Tracks:

- Uploads
- Corrections
- Answers
- Improvements

---

# Search Index


Future search should index:

```text
Courses

Subjects

Topics

Resources

Drugs

Questions

Answers
```

---

# Example Data Flow


Student searches:

"Tablet defects"


System finds:


```text
Course:
B.Pharm

Subject:
Pharmaceutics

Topic:
Tablet Manufacturing

Resources:
Notes
PPT
Discussion
Teacher Tips
```

---

# Future Database Options


Possible open-source databases:

- PostgreSQL
- MariaDB
- SQLite


Selection depends on scaling requirements.

---

# Final Goal


A structured pharmacy knowledge graph.

Not just files.

A connected learning ecosystem.

---

⚕️ Organize knowledge.  
Share knowledge.  
Improve knowledge.