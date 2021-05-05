#!/usr/bin/env python3

'''
integrated tools for camera-trap

main.py -a get-config -i camera-trap-desktop.ini -o std
main.py -a set-config -i camera-trap-desktop.ini -s Folders:foo:foo_path -o std
main.py -a add-folder -d camera-trap.db -f d:\path\to\images

# get-config
main.py -i camera-trap-desktop.ini -o std

# add-folder
main.py -d camera-trap-desktop.db -f \path\to -o json
'''

import argparse
import json

from config import Config
from source import Source
#from clam import (
#    Config,
#    Source
#)


ACTION_CHOICES = [
    'get-config',
    'set-config',
    'add-folder',
    'update',
    'get',
    'delete',
    'batch-upload',
    'prepare-upload',
    'upload-image',
    'update-source-description',
]

#sys.stdout.reconfigure(encoding='utf-8')

def main(args):
    #print (args)
    result = {
        'is_success': False,
        'data': None,
        #'foo': '中文',
    }
    if args.action == 'upload-image' and args.db_file and args.resource_id:
        src = Source('database', name=args.db_file)
        res = src.upload_image(args.resource_id)
        result['data'] = res
    elif args.action == 'update-source-description' and args.db_file and args.resource_id and args.value:
        src = Source('database', name=args.db_file)
        res = src.update_description(args.resource_id, args.value)
        result['result'] = {
            'source_id': args.resource_id,
            'value': args.value,
            'text': 'update ok',
            'sql': res
        }
    elif args.action == 'prepare-upload' and args.db_file and args.resource_id:
        src = Source('database', name=args.db_file)
        res = src.prepare_upload(args.resource_id)
        result['data'] = res
    elif args.action == 'batch-upload' and args.resource_id and args.ini_file and args.db_file:
        src = Source('database', name=args.db_file)
        config = Config(args.ini_file)
        conf = config.get_config()
        server_image_info = src.upload_annotation(conf, args.resource_id)
        #print (server_image_info)
        #if server_info['status_code']:
        #print (server_image_info)
        res = src.batch_upload(conf, args.resource_id, server_image_info['text'])
        result['data'] = res
    elif args.action == 'get-config' or \
       (args.ini_file and not args.set_config_value):
        config = Config(args.ini_file)
        res = config.get_config()
        result['data'] = res

    elif args.action == 'set-config' or \
         (args.ini_file and args.set_config_value):
        if sov := args.set_conifg_value.split(':'):
            # check input value
            if len(sov) < 3 or sov[1] == '':
                result['error'] = 'section:option:value syntax error'
                return result
            else:
                config = Config(args.ini_file)
                res = config.set_config(sov[0], sov[1], sov[2])
                result['data'] = res
    elif args.db_file:
        src = Source('database', name=args.db_file)
        if args.folder:
            # add folder (save to source & image)
            res = src.from_folder(args.folder)
            result['data'] = res
        elif args.annotation:
            res = src.save_annotation(args.annotation)
        elif args.resource and args.resource_id:
            if args.action == 'update' and args.resource == 'image':
                res = src.update_image(args.resource_id, args.value)
            if args.action == 'delete':
                if args.resource == 'source':
                    res = src.delete_source(args.resource_id) # alse delete image
                    result['data'] = res
            elif args.action == 'get':
                # load source
                #src = Source('database', name=args.db_file)
                if args.image:
                    res = src.get_source(args.resource_id, 'all')
                else:
                    res = src.get_source(args.resource_id)
                result['data'] = res
        else:
            print ('do nothing')

        src = Source('database', name=args.db_file)
    else:
        result['is_success'] = False
        result['error'] = 'no module'
        return result
    result['is_success'] = True
    return result

parser = argparse.ArgumentParser(description='python tools for camera-trap-desktop')

parser.add_argument('-a', '--action',
                    dest='action',
                    choices=ACTION_CHOICES,
                    help='action')
parser.add_argument('-s', '--set-config',
                    dest='set_config_value',
                    help='section:option:value')
parser.add_argument('-f', '--from-folder',
                    dest='folder',
                    help='folder path')
parser.add_argument('-n', '--save-annotation',
                    dest='annotation',
                    help='data to save image annotation')
parser.add_argument('-i', '--ini',
                    dest='ini_file',
                    help='ini file path')
parser.add_argument('-d', '--db',
                    dest='db_file',
                    help='manuplate sqlite3')
parser.add_argument('-r', '--resource',
                    dest='resource',
                    help='resource (table name)')
parser.add_argument('-v', '--keyvalue',
                    dest='value',
                    help='foo=bar')
parser.add_argument('-k', '--resource_id',
                    dest='resource_id',
                    help='resource_id')
parser.add_argument('-m', '--image',
                    dest='image',
                    action='store_true',
                    help='with images')
parser.add_argument('-o', '--output',
                    dest='output',
                    choices=['json', 'std'],
                    help='')
args = parser.parse_args()

if __name__ == '__main__':
    ret = main(args)
    if args.output:
        if args.output == 'std':
            print (ret)
        elif args.output == 'json':
            print (json.dumps(ret))

#im = Image.open("otter.JPG")
#im.thumbnail((300,300), Image.ANTIALIAS)

#im.save('thumb.jpg', "JPEG")
