import os
import pathlib
from datetime import datetime
import hashlib
import logging

import sqlite3

from PIL import Image as PILImage
from PIL import ExifTags
from PIL import TiffImagePlugin

import boto3
from botocore.exceptions import ClientError

import requests

def post_to_server(url ,payload):
    p = requests.post(url, json=payload)
    #print (p.text.encode('u8'))
    return {
        'status_code': p.status_code,
        'text': p.text,
    }

def upload_to_s3(aws_conf, file_name, object_name):

    s3_client = boto3.client(
        's3',
        aws_access_key_id=aws_conf['access_key_id'],
        aws_secret_access_key=aws_conf['secret_access_key']
    )

    try:
        response = s3_client.upload_file(
            file_name,
            aws_conf['bucket_name'],
            object_name,
            ExtraArgs={'ACL': 'public-read'}
        )
    except ClientError as e:
        logging.error(e)
        return False
    return True


SQL_INIT_SOURCE = '''
CREATE TABLE IF NOT EXISTS source (
  source_id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_type TEXT,
  path TEXT,
  name TEXT,
  count INTEGER,
  created INTEGER,
  status TEXT,
  description TEXT
);'''

SQL_INIT_IMAGE = '''
CREATE TABLE IF NOT EXISTS image (
  image_id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT,
  name TEXT,
  timestamp INTEGER,
  timestamp_via TEXT,
  status TEXT,
  hash TEXT,
  annotation TEXT,
  changed INTEGER,
  exif TEXT,
  source_id INTEGER,
  server_image_id TEXT,
  FOREIGN KEY (source_id) REFERENCES source(source_id)
);'''

SQL_INIT_CATEGORY = '''
CREATE TABLE IF NOT EXISTS category (
  category_id INTEGER PRIMARY KEY,
  name TEXT,
  category_type TEXT,
  created INTEGER,
  updated INTEGER,
  parent_id INTEGER
);'''

class Database(object):
    db_file = ''
    conn = None
    cursor = None

    # PRAGMA table_info('source')
    # PRAGMA table_info('image')

    def __init__(self, db_file):
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()
        self.conn = conn
        self.db_file = db_file
        cursor.execute(SQL_INIT_SOURCE)
        cursor.execute(SQL_INIT_IMAGE)
        #cursor.execute(SQL_INIT_CATEGORY)
        self.cursor = cursor

    def exec_sql(self, sql, commit=False):
        #print(sql)
        self.cursor.execute(sql)

        if commit:
            self.conn.commit()
        return self.cursor.lastrowid

    def fetch_sql_all(self, sql):
        rows = []
        for r in self.cursor.execute(sql):
            rows.append(r)
        return rows

    def fetch_sql(self, sql):
        self.cursor.execute(sql)
        return self.cursor.fetchone()

    def commit(self):
        self.conn.commit()

    def close(self):
        self.conn.close()


class ClamImage(object):
    exif = None
    entity = None
    pil_handle = None

    def __init__(self, path):
        entity = pathlib.Path(path)
        self.entity = entity
        im = PILImage.open(path)
        self.pil_handle = im
        self.exif = self.get_exif()

    def get_exif(self):
        exif = {}
        tags = ExifTags.TAGS
        if not self.pil_handle._getexif():
            return exif
        for k, v in self.pil_handle._getexif().items():
            if k in tags:
                t = tags[k]
                if (t in ['MakerNote', 'PrintImageMatching']):
                    # massy binary
                    pass
                elif isinstance(v,int) or isinstance(v, str):
                    exif[t] = v
                elif isinstance(v, TiffImagePlugin.IFDRational):
                    #print ('---------', v.denominator, v.numerator)
                    exif[tags[k]] = str(v)
                elif isinstance(v, bytes):
                    exif[tags[k]] = v.decode('ascii')
        return exif

    def get_stat(self):
        return self.entity.stat()

    def make_hash(self):
        with open(self.entity, 'rb') as file:
            h = hashlib.new('md5')

            while True:
                # Reading is buffered, so we can read smaller chunks.
                chunk = file.read(h.block_size)
                if not chunk:
                    break
                h.update(chunk)

        return h.hexdigest()
