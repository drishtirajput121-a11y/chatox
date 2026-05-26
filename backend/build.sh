#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input

# (Migrations and schema creation moved to startup phase to avoid build failures)
