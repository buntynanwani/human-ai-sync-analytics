# Project Structure Map (Clean Architecture View)

Generated on 2026-04-02 from repository root.

Excluded: .git, node_modules, dist, build, .next, coverage, .venv/venv, __pycache__, .pytest_cache, .mypy_cache, .cache, common compiled artifacts (*.pyc, *.pyo).

```text
.
└── .env
└── .gitignore
└── backend
    └── app
        └── database.py
        └── main.py
    └── scripts
        └── load_courses.py
        └── load_mentors.py
        └── load_survey_answers.py
└── data
    └── error
    └── metadata
    └── processed
        └── courses_catalog.xlsx
        └── mentors_catalog.xlsx
        └── survey_raw.xlsx
    └── raw
└── database
    └── migrations
    └── scripts
        └── 01_database_setup.sql
        └── 02_survey_psychological_items.sql
        └── 03_views_for_bi.sql
└── docs
    └── ProjectStructure02-04-26.md
    └── ProjectStructure02-04-26-Clean.md
└── frontend
    └── .gitignore
    └── eslint.config.js
    └── index.html
    └── package.json
    └── package-lock.json
    └── public
        └── favicon.svg
        └── icons.svg
    └── README.md
    └── src
        └── App.css
        └── App.jsx
        └── assets
            └── hero.png
            └── react.svg
            └── vite.svg
        └── index.css
        └── main.jsx
    └── vite.config.js
└── logs
    └── courses_ingestion.log
    └── ingestion.log
    └── mentors_ingestion.log
└── powerbi
    └── EncuestaScalian.pbix
    └── HumanAI_Sync_Analytics_v1.pbix
    └── powerbi-scalian.mp4
└── README.md
```
