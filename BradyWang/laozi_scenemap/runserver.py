from flask import Flask, render_template, request
from os import environ
import pymysql
import sqlite3 as sql
import json
from sklearn.utils import column_or_1d
# from flask_cors import CORS
from werkzeug.datastructures import LanguageAccept
app = Flask(__name__)
# CORS(app, supports_credentials=True)

# mysql config
host = 'localhost'
port = 3306
user = 'root'
password = '1723663554'
database = 'laoziscene'

# 数据库各个字段名字
columnname = ['name', 'address', 'keyword', 'poistype',
              'location', 'tel', 'website',
              'email', 'pname', 'cityname', 'adname', 'biztype',
              'business_area', 'entr_location', 'exit_location', 'alias', 'tag',
              'cost', 'rating', 'photos']


def repos(spotsname, province, lowPrice, highPrice, Scores):
    # spotsname为空也不影响where name like "%{spotsname}%"的查询 所以此处不更改
    if(('所有省份' in province) or (province == [])):
        provincesql = ''
    else:
        if(len(province)==1):
            provincesql = f' and pname = "{province[0]}"'
        else:
            provincesql = ' and pname in'+repr(tuple(province))
    # 对最高最低价格进行筛选处理
    if(lowPrice == '' and highPrice == ''):
        pricesql = ''
    elif(lowPrice == '' and highPrice != ''):
        pricesql = f' and cost<{eval(highPrice)} and cost>0'
    elif(highPrice == '' and lowPrice != ''):
        pricesql = f' and cost>{eval(lowPrice)}'
    elif(highPrice != '' and lowPrice != ''):
        pricesql = f' and cost>{eval(lowPrice)} and cost<{eval(highPrice)}'

    # 对评分进行筛选
    if(Scores[0] == 0 and Scores[1] == 5):
        scoresql = ''
    else:
        scoresql = f' and rating>={Scores[0]} and rating<={Scores[1]}'

    return provincesql+pricesql+scoresql


@app.route('/')
def cover():
    return render_template('mainmap.html')  # 设置默认网页，当打开localhost是跳转到该网页


@app.route('/index')
def cover1():
    return render_template('mainmap.html')  # 设置默认网页，当打开localhost是跳转到该网页


@app.route('/get_all_spots', methods=['get', 'post'])
def getallspots():
    if request.method == 'POST':
        post_data = request.get_json()
        spotsname = post_data.get('spotsname')
        province = post_data.get('province')
        lowPrice = post_data.get('lowPrice')
        highPrice = post_data.get('highPrice')
        Scores = post_data.get('Scores')
        print(spotsname, province, lowPrice, highPrice, Scores)

    # 对用户输入的条件进行预处理 以进行sql查询
    addsql=repos(spotsname, province, lowPrice, highPrice, Scores)

    spotsdata = []  # 用于存储搜索到的各个景点数据的列表

    conn = pymysql.connect(host=host, port=port, user=user,
                           passwd=password, db=database)
    cursor = conn.cursor()
    sql = f'select * from spots where name like "%{spotsname}%"'
    print(sql+addsql)
    cursor.execute(sql+addsql)  # 执行sql'
    for spot in cursor.fetchall():
        single_spot = {}
        for (index, attribute) in enumerate(spot):
            single_spot[columnname[index]] = attribute

        spotsdata.append(single_spot)

    return json.dumps({'success': True, 'spotsdata': spotsdata})


if __name__ == '__main__':
    HOST = environ.get('SERVER_HOST', 'localhost')
    try:
        PORT = int(environ.get('SERVER_PORT', '5123'))  # 指定端口
    except ValueError:
        PORT = 5123
    app.run(HOST, PORT, debug=True)
