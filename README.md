# MVP 1 - Email to Attio

**Price:** £499/m per seat

## Overview

This project automates the process of handling emails for associates, enhancing them with additional data, and creating a structured output.

## Associate UX

- The associate receives an email.
- Forwards it to Primo AI.
- Receives:
  - Reorganised files
  - A summary document
  - A new entry in the CRM

## Full Flow

1. **Email Reception:**

   - Associate receives an email containing:
     - Note
     - Presentation / DocSend
     - Email

2. **Forwarding:**

   - They forward it to `doc@primoai.com`.

3. **Primo AI Processing:**

   - Structures the email into a standardised format.
   - Enhances it with:
     - Google (management and company info)
     - Pitchbook
     - Crunchbase
     - LinkedIn (management and company)
     - Company House (management and company)

4. **Benchmarking:**

   - Compares this profile with previous/other profiles.

5. **Output Creation:**
   - Generates an output document with the results.

## Technical Details

### Email Service

- Receive and store emails.
- Extract attachments.
- Log activities.
- Create database entries to update user values.
- Initiate analysis.

### Analysis Content

- Understand email content.
- Analyse attachments (PDF, PowerPoint, Excel).
- Analyse links (DocSend, company website from email domain).

### External Enhancement

- **Google:** Perplexity
- **Pitchbook:** API
- **Crunchbase:** API
- **LinkedIn:** Scraping service
- **Company House:** Scraping

---

This README provides a comprehensive overview of the email processing and enhancement workflow for associates using Primo AI.
