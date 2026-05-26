#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input

# Create schema if it doesn't exist
python -c "
import os, psycopg2
conn = psycopg2.connect(
    dbname=os.environ['DB_NAME'],
    user=os.environ['DB_USER'],
    password=os.environ['DB_PASSWORD'],
    host=os.environ['DB_HOST'],
    port=os.environ['DB_PORT']
)
conn.autocommit = True
cur = conn.cursor()
cur.execute('CREATE SCHEMA IF NOT EXISTS chatox')
conn.close()
print('Schema ready')
"

python manage.py migrate
