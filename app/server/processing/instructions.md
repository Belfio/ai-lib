# Email processing with Agent

## Goal

Parse the email content and retrieve additional infomration from the web to complete a full company profile.

## Input

An email conmprising: sender email, email subject, email body, attachements, links.
In addition to this input, interenet services will be used to enhance the profile.

## Output

A complete company profile as described in @/lib/typesCompany CompanyProfile

## Steps

1. Receive and check the email.
2. Parse the email to:
   1. start building the company profile
   2. provide the input data for the AI agent
3. Trigger the Company Profile agent
   1. PDF pitch deck Agent
   1. Company news Agent
   1. Company House info Agent
   1. Management team Linkedin Agent
   1. Management team news Agent
4. References and data collating

## Implementation
