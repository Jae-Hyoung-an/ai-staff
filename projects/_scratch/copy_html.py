# -*- coding: utf-8 -*-
import shutil
import os

src_dir = r'c:\Users\jaehyoung.an\Downloads\ax-leadership-sample\ax-leadership-sample\projects'
dst_dir = r'c:\Users\jaehyoung.an\Downloads\ax-leadership-sample\ax-leadership-sample\projects\_scratch'

# Find the Korean folder
for folder in os.listdir(src_dir):
    if folder.startswith('260202_b') and 'tf' in folder.lower():
        src_folder = os.path.join(src_dir, folder)
        for f in os.listdir(src_folder):
            if f.endswith('.html'):
                src_file = os.path.join(src_folder, f)
                dst_file = os.path.join(dst_dir, 'b_zone_workflow.html')
                shutil.copy(src_file, dst_file)
                print(f'Copied to {dst_file}')
                break
        break
