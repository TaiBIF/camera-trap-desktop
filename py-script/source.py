'''
key: {timestamp}:{hash[:6]}
'''

from datetime import datetime
import time
import os
import json
import sqlite3
import hashlib

import base64
import struct
import time
import pathlib

from helpers import (
    ClamImage,
    Database,
    upload_to_s3,
)

IGNORE_FILES = ['Thumbs.db', '']
IMAGE_EXTENSIONS = ['.JPG', '.JPEG', '.PNG']

def _check_image_filename(dirent):
    _, fext = os.path.splitext(dirent.path)
    if fext.upper() in IMAGE_EXTENSIONS:
        return True
    return False


class Source(object):
    db = None

    def __init__(self, source_type, name=''):
        if source_type == 'database' and name:
            db = Database(name)
            self.db = db

    def update_image(self, image_id, value):
        kv = value.split('=')
        put = '{}="{}"'.format(kv[0], kv[1])
        sql = 'UPDATE image SET {} WHERE image_id={}'.format(put, image_id)
        self.db.exec_sql(sql, True)

    def upload_image(self, image_id):
        sql = 'UPDATE image SET status="S" WHERE image_id={}'.format(image_id)
        #upload_to_s3(aws_conf, file_name, object_name)
        self.db.exec_sql(sql, True)
        time.sleep(5)
        ## TODO: update state
        return 'image_id: {} uploaded'.format(image_id)

    def prepare_upload(self, source_id_str):
        source_list = source_id_str.split(',')
        res = {}
        for i in source_list:
            x = self.get_source(i, 'uploaded')
            res[i] = len(x['image_list'])
        ## TODO: update state
        return res

    def batch_upload(self, aws_conf, source_id):
        res = self.get_source(source_id, 'un-upload')
        for i in res['image_list']:
            file_name = i[1]
            # TODO
            sql = 'UPDATE image SET status="S" WHERE image_id={}'.format(i[0])
            self.db.exec_sql(sql, True)
            time.sleep(3)
            sql = 'UPDATE image SET status="U" WHERE image_id={}'.format(i[0])
            self.db.exec_sql(sql, True)
            object_name = '{}/{}/{}-{}.jpg'.format('foo-proj', 'foo-studyarea', 'foo-cameralocation', i[0])
            #upload_to_s3(aws_conf, file_name, object_name)
        res['foo'] = 'total upload!'
        return res
    def get_source(self, source_id='', mode=''):
        if source_id == '' or source_id == '0':
            # SQL 無法 select 出 group count 等於 0 的 source
            res = self.db.fetch_sql_all('SELECT * FROM source')
            res_new = []
            for i in res:
                sid = i[0]
                rex = self.db.fetch_sql('SELECT COUNT(*) FROM image WHERE source_id={} AND status != "U" GROUP BY source_id'.format(sid))
                r = list(i)
                r.append(rex[0] if rex else 0)
                res_new.append(r)
            return res_new
        else:
            res = self.db.fetch_sql('SELECT * FROM source WHERE source_id={}'.format(source_id))
            images = []
            if mode == 'all':
                images = self.db.fetch_sql_all('SELECT * FROM image WHERE source_id={}'.format(source_id))
            elif mode == 'un-upload':
                images = self.db.fetch_sql_all('SELECT * FROM image WHERE source_id={} AND status != "U"'.format(source_id))
            elif mode == 'uploaded':
                images = self.db.fetch_sql_all('SELECT * FROM image WHERE source_id={} AND status = "U"'.format(source_id))

            return {
                'source': res,
                'image_list': images,
                'mode': mode,
            }

    def delete_source(self, source_id):
        sql = "DELETE FROM source WHERE source_id={}".format(source_id)
        self.db.exec_sql(sql, True)

        sql = "DELETE FROM image WHERE source_id={}".format(source_id)
        self.db.exec_sql(sql, True)

        ret = self.db.fetch_sql_all('SELECT * FROM source')

        self.db.close()
        return ret

    def save_annotation(self, data):
        alist = []
        try:
            alist = json.loads(data)
        except:
            print ('json syntax error')

        #print (alist)
        for d in alist:
            r = {}
            image_id = ''
            status = ''
            for x in d:
                if x == 'image_id':
                    image_id = d[x]
                elif x == 'status':
                    status = d[x]
                elif d[x] != '':
                    r[x] = d[x]

            #image_id = d['image_id']
            #del d['image_id']
            #print (image_id, d)
            if len(r):
                sql = "UPDATE image SET annotation='{}', status='{}', changed={} WHERE image_id='{}'".format(json.dumps(d), status, int(time.time()), image_id)
                self.db.exec_sql(sql)

        self.db.commit()
        self.db.close()

    def _insert_db(self, path, image_list):
        ts_now = int(time.time())
        dir_name = os.path.split(path)[-1]

        sql = "INSERT INTO source (source_type, path, name, count, created, status) VALUES('folder', '{}', '{}', {}, {}, 'I')".format(path, dir_name, len(image_list), ts_now)
        rid = self.db.exec_sql(sql, True)

        timestamp = None
        for i in image_list:
            exif  = i['img'].exif
            dtime = exif.get('DateTimeOriginal', '')
            via = 'exif'
            if dtime:
                dt = datetime.strptime(exif.get('DateTime', ''), '%Y:%m:%d %H:%M:%S')
                timestamp = dt.timestamp()
            else:
                stat = i['img'].get_stat()
                timestamp = int(stat.st_mtime)
                via = 'mtime'

            sql = "INSERT INTO image (path, name, timestamp, timestamp_via, status, annotation, changed, exif, source_id) VALUES ('{}','{}', {}, '{}', 'I','{}', {}, '{}', {})".format(
                i['path'],
                i['name'],
                timestamp,
                via,
                '',
                ts_now,
                json.dumps(exif),
                rid)

            self.db.exec_sql(sql)
        self.db.commit()

    def from_folder(self, path): # import from folder
        #thumpy = Thumpy(thumb_dir, dir_path, is_debug)
        exist = self.db.fetch_sql("SELECT * FROM source WHERE path='{}'".format(path))
        if exist:
            #print ('path added', exist)
            ret = self.db.fetch_sql_all('SELECT * FROM source')
            return ret

        with os.scandir(path) as it:
            image_list = []
            for entry in it:
                if not entry.name.startswith('.') and \
                   entry.is_file() and \
                   _check_image_filename(entry):
                    img = ClamImage(entry.path)
                    image_list.append({
                        'path': entry.path,
                        'name': entry.name,
                        'img': img,
                    })

            # insert into database
            if self.db:
                self._insert_db(path, image_list)

            ret = self.db.fetch_sql_all('SELECT * FROM source')
            self.db.close()
            return ret

