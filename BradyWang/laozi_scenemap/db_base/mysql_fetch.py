# -*- coding: utf-8 -*-
"""
Created on Wed Mar 30 15:52:24 2022

@author: JokerLord
"""

import pymysql
import re

host = 'localhost'
port = 3306
user = 'root'
password = '1723663554'
database = 'laoziscene'


poitypedict = {}
# poitypeslst = spotsdata[i].poistype.split(/;|,/)

conn = pymysql.connect(host=host, port=port, user=user, passwd=password, db=database)
cursor = conn.cursor()
name = ''
sql = f'select poistype from spots where name like "%{name}%" '
cursor.execute(sql)  # 执行sql'
for i in cursor.fetchall():
    # print(i)
    poitype = i[0]
    poitypeslst = re.split('[;,]',poitype)
    # print(poitypeslst)
    for poi in poitypeslst:
        if poi in poitypedict.keys():
            poitypedict[poi]+=1
        else:
            poitypedict[poi] = 1
    
print('共查询到：', cursor.rowcount, '条数据。')
print(poitypedict)

conn.commit()
cursor.close()
conn.close()

