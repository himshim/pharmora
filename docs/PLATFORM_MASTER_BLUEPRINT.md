# PROJECT MASTER DEVELOPMENT CONTEXT

You are assisting in developing a scalable education, knowledge-sharing, and professional community platform.

The current project name and branding are temporary and may change in the future.

The system must be designed as a reusable platform engine, not tied permanently to any name, service provider, hosting company, or technology stack.

==================================================

CORE DEVELOPMENT PHILOSOPHY

Build:

Prototype
→ Validate real users
→ Improve
→ Monetize
→ Scale

Start with free or low-cost third-party services.

Do not spend money unnecessarily before proving adoption.

However, design architecture so the project can grow without requiring a complete rewrite.

Priorities:

- Maintainability
- Security
- Scalability
- Low initial cost
- Easy migration
- Single developer friendliness


==================================================

BRANDING INDEPENDENCE

Never hardcode the project name.

Branding must come from configuration.

Example:

config/site.json


{
"name":"PROJECT_NAME",

"tagline":"Open Learning Network",

"logo":"",

"theme":{

"primary":"",
"secondary":""

}

}


Changing configuration should update:

- Website
- PWA
- Admin panel
- Emails
- Notifications
- SEO
- Footer
- Metadata


Avoid names inside:

- database collections
- storage folders
- core functions
- services


The platform should survive a complete rebrand.

==================================================

ARCHITECTURE PRINCIPLE

Avoid vendor lock-in.

Never connect UI directly to external providers.


BAD:

firebase.auth()

firebase.firestore()

firebase.storage()


GOOD:

Auth.login()

Database.get()

Storage.upload()


Architecture:


UI Components

↓

Core Services

↓

Provider Adapters

↓

Firebase / Supabase / Cloudflare / Custom Backend


Only adapters should change when replacing providers.


==================================================

INITIAL TECHNOLOGY STRATEGY


Source Code:

GitHub


Frontend Hosting:

Free tier initially:

- GitHub Pages
- Cloudflare Pages
- Vercel


Authentication:

Initially:

Firebase Auth


Database:

Initially:

Firestore


Storage:

Initially:

Firebase Storage


Future migration options:

Database:

- Supabase/PostgreSQL
- MongoDB
- Custom backend


Storage:

- Cloudflare R2
- S3 compatible storage
- Other providers


Migration should require minimum code changes.

==================================================

RECOMMENDED PROJECT STRUCTURE


components/


layout/

header.js

footer.js

sidebar.js



ui/

card.js

modal.js

toast.js

loader.js



features/

search.js

notifications.js

theme.js



services/

auth.service.js

database.service.js

storage.service.js

content.service.js



providers/


firebase/


supabase/


cloudflare/



config/

site.json

navigation.json

features.json


==================================================

DYNAMIC UI PRINCIPLES


Avoid duplicated HTML.


Make dynamic:

- Header
- Footer
- Navigation
- Sidebar
- Cards
- Search
- Notifications
- Settings


Example:

Adding a new section in navigation.json updates:

Desktop menu

Mobile menu

Dashboard

Footer


==================================================

CORE MODULES


The platform should support:


Learning System

Teaching System

Resource Library

Tools

Community Forum

Events

Books

User Dashboard

Admin CMS

Notifications

Search

Profile System


Modules should be controlled by feature flags.

==================================================

DATABASE DESIGN


Use provider-independent data models.


Main collections:


users

roles

permissions


courses

curriculums

subjects

units


resources

resource_versions

files


books


events

organizations


forum_questions

forum_answers

forum_comments


notifications


reports


audit_logs


settings


==================================================

USER ROLE SYSTEM


Implement role based access control.


Hierarchy:


OWNER

↓

ADMIN

↓

MAINTAINER

↓

REVIEWER

↓

TEACHER

↓

CONTRIBUTOR

↓

USER

↓

RESTRICTED



OWNER:

Full control:

- security
- billing
- backups
- role management



ADMIN:

Platform management.



MAINTAINER:

Content management without sensitive access.



REVIEWER:

Verify and approve information.



TEACHER:

Educational contribution.



CONTRIBUTOR:

Submit content.



USER:

Normal usage.



Never trust frontend-only permissions.

Critical checks must happen through backend/security rules.

==================================================

ADMIN CMS REQUIREMENT


The goal:

Content management should NOT require editing source code.


Admin panel manages:


Courses

Subjects

Units

Resources

Files

Books

Events

Forum

Users

Notifications

Settings



Publishing workflow:


User submission

↓

Pending Review

↓

Reviewer/Maintainer approval

↓

Published


==================================================

LEARNING STRUCTURE


Support:


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

Resources



Resources:

- Notes
- PDFs
- PPT
- MCQ
- Videos
- Articles
- Links


Multiple resources for the same topic/unit must be supported.

==================================================

RESOURCE MANAGEMENT


Never overwrite important content.


Use:


Resource

↓

Versions


Example:

Version 1

Version 2

Version 3 current



Maintain:

- history
- author
- reviewer
- ratings
- statistics


Support:

Verified resources

Community resources

Official collections

==================================================

FILE STORAGE DESIGN


Never store permanent provider URLs.


BAD:


firebase-download-url



GOOD:


{
"id":"file123",

"path":"resources/file.pdf",

"provider":"firebase"
}


Files should migrate between providers easily.


Support:

- documents
- presentations
- images
- event posters
- profile images


==================================================

SEARCH SYSTEM


Create universal search.


Search across:


Courses

Subjects

Resources

Tools

Books

Events

Forum


Search should be database driven.

==================================================

NOTIFICATION SYSTEM


Support:


System announcements

Content updates

Forum replies

Event reminders

Important notices


Controlled through database/admin panel.

==================================================

COMMUNITY FORUM


Build an academic knowledge system.

Not a random chat.


Features:


Questions

Answers

Comments

Voting

Accepted answers

Verified answers

Reputation

Reporting

Moderation


High quality answers can become knowledge articles.

==================================================

EVENT SYSTEM


Support:


Conferences

Seminars

Workshops

Webinars

Training programs

Competitions

Career events


Features:

Submit event

Review workflow

Organizer profiles

Calendar

Reminders

Featured events


==================================================

BOOK SYSTEM


Support:

Book discovery and recommendations.


Map books with:

Courses

Subjects

Topics

Exams


Features:

Reviews

Recommendations

Purchase links

Affiliate links


Do not host copyrighted material illegally.

==================================================

MONETIZATION PLAN


Do not rely only on advertisements.


Possible future options:


Affiliate links

Featured events

Verified organizations

Premium tools

Courses/workshops

Marketplace

Donations


Always maintain user trust.

==================================================

SECURITY REQUIREMENTS


Do not create custom password systems.

Use trusted authentication providers.


Implement:


Role permissions

Security rules

Audit logs

Soft delete

Reports

Moderation

Backups


Sensitive actions require proper validation.

==================================================

BACKUP AND MIGRATION


Create export system.


Export:


Users

Courses

Resources

Files metadata

Events

Forum

Settings


Goal:

Move providers without losing important data.

==================================================

CODE QUALITY REQUIREMENTS


The repository must look professionally maintained.


Do NOT include:

- AI generated comments
- Generated by AI messages
- ChatGPT references
- temporary experiment comments
- unnecessary explanations


Comments should explain WHY,
not obvious behavior.


BAD:

// AI fix for login

// Loop through array


GOOD:

// Prevent unauthorized role escalation

// Normalize storage paths for migration



Use clean names.


BAD:

test123

finalFix

newCode

tempFunction



GOOD:

authService

resourceManager

storageProvider


==================================================

VERSION CONTROL RULES


Use professional commits.


GOOD:


Add authentication service

Improve upload validation

Create notification module



BAD:


chatgpt update

finally working

new try


==================================================

DOCUMENTATION RULES


Documentation should explain:


Architecture

Setup

Contribution

Security

Features


Do not mention private development history or tools used to generate code.

The project should be ready for:

- public repository
- contributors
- professional review

==================================================

DEVELOPMENT ROADMAP


PHASE 1

Frontend cleanup

Dynamic components

Central configuration


PHASE 2

Service abstraction layer

Provider adapters


PHASE 3

Backend connection

Authentication

Database

Storage


PHASE 4

Admin CMS


PHASE 5

Convert static content into dynamic data


PHASE 6

Search

Notifications


PHASE 7

Events

Forum

Books


PHASE 8

Monetization features


PHASE 9

Infrastructure scaling


PHASE 10

Mobile applications


==================================================

FINAL RULE


Avoid unnecessary complexity early.

But never make architectural choices that cause a full rewrite later.

Every major system should be:

replaceable

maintainable

secure

scalable

and independent from temporary providers or branding.