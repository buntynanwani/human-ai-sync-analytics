# Human-AI-Sync-Analytics 📊🤖

## Project Overview
Human-AI-Sync-Analytics is a comprehensive data architecture and analytics project designed to track, measure, and optimize enterprise-wide Artificial Intelligence adoption. 

As companies integrate AI into their daily operations, understanding the psychological impact, true financial ROI, and employee dependency on these tools is critical. This project establishes a robust relational database foundation to capture complex interactions between employees, educational courses, internal mentors, and AI chatbots.

## 🎯 Key Objectives
* **Measure AI Adoption:** Track frequency and preferred AI tools (ChatGPT, Copilot, etc.) across different departments and demographics.
* **Monitor Psychological Impact:** Utilize a normalized Likert-scale database structure to evaluate employee self-efficacy, motivation, and potential over-dependency on AI.
* **Calculate ROI:** Correlate AI training (courses and mentorship) with estimated productivity gains and cost savings.
* **Chatbot Analytics Integration:** Bridge unstructured AI chat logs with structured business outcomes (e.g., successful course recommendations).

## 🏗️ Technical Architecture

### Database Design (MySQL)
The core of this project is a highly normalized MySQL database designed for scalability and seamless integration with BI tools like Power BI. 
* **3NF Normalization:** Eliminated demographic data duplication across survey tables to ensure data integrity.
* **Complex Relationships:** Implemented Many-to-Many (M:N) junction tables (`course_mentors`) to handle flexible training and mentorship mapping.
* **Decoupled Metric Storage:** Separated core survey metadata from heavy psychological Likert-scale raw data (`survey_psychological_items`) for faster querying.

### Entity-Relationship Diagram
*(Insert a screenshot of your Mermaid diagram here!)*

## 🛠️ Tech Stack
* **Database Engine:** MySQL
* **Data Modeling:** MySQL Workbench, Mermaid.js
* **Analytics & Visualization:** Power BI (Planned)
* **Data Structure:** Relational (SQL), normalized for enterprise reporting.

## 🚀 Future Roadmap
* Develop automated data pipelines to ingest raw survey data into the MySQL database.
* Build interactive Power BI dashboards highlighting department-by-department AI dependency vs. productivity.
* Integrate NLP analysis on open-text feedback from the surveys.