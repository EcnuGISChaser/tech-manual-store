# -*- coding: utf-8 -*-
"""
Created on Mon Mar 21 16:50:15 2022

@author: JokerLord
"""

from urllib.parse import quote
import string
from urllib import request
import json
import pandas as pd


def get_poipage(key, keyword, adcode, poitype, pagenumber):
    request_url = f'https://restapi.amap.com/v3/place/text?key={key}&keywords={keyword}\
        &types={poitype}&city={adcode}&children=1&offset=20&page={pagenumber}&extensions=all'
    request_url =quote(request_url,safe=string.printable)
    
    with request.urlopen(request_url) as f:
        data = f.read()
        data = data.decode('utf-8')
    return data


# 遍历所有可能的pages的poi信息
def get_pois(key, keyword, adcode, poitype):
    index = 1
    result_lst = []
    while True:
        result = get_poipage(key, keyword, adcode, poitype, index)
        result = json.loads(result)
        print(result)
        print(index,"\n\t")
        # 注意到最后一页后，pois数量必然少于设定的offset20 所以跳出循环即可
        result_lst.append(result)
        if(len(result['pois']) < 20):
            break
        index += 1
    
    return result_lst

def defineNone(sth):
    if(sth==[]):
        return "-"
    else:
        return sth


def pois2pdfram(df,keyword,result_lst):
    for resultpage in result_lst:
        if(resultpage['pois'] != []):
            for apoi in resultpage['pois']:
                singlepoi = {}
                singlepoi['name'] = defineNone(apoi['name'])
                if 'address' in apoi.keys():
                    singlepoi['address'] = defineNone(apoi['address'])
                else:
                    singlepoi['address'] = "-"
                singlepoi['keyword'] = defineNone(keyword)
                singlepoi['poistype'] = defineNone(apoi['type'])
                singlepoi['location'] = defineNone(apoi['location'])
                singlepoi['tel'] = defineNone(apoi['tel'])
                singlepoi['website'] = defineNone(apoi['website'])
                singlepoi['email'] = defineNone(apoi['email'])
                singlepoi['pname'] = defineNone(apoi['pname'])
                singlepoi['cityname'] = defineNone(apoi['cityname'])
                singlepoi['adname'] = defineNone(apoi['adname'])
                singlepoi['biztype'] = defineNone(apoi['biz_type'])
                singlepoi['business_area'] = defineNone(apoi['business_area'])
                singlepoi['entr_location'] = defineNone(apoi['entr_location'])
                singlepoi['exit_location'] = defineNone(apoi['exit_location'])
                singlepoi['alias'] = defineNone(apoi['alias'])
                singlepoi['tag'] = defineNone(apoi['tag'])
                singlepoi['cost'] = defineNone(apoi['biz_ext']['cost'])
                singlepoi['rating'] = defineNone(apoi['biz_ext']['rating'])
                if apoi['photos'] == []:
                    singlepoi['photos'] = "-"
                else:
                    # for photo in apoi['photos']:
                    singlepoi['photos'] = defineNone(apoi['photos']) 

                # .将字典作为行添加到 Pandas DataFrame
                df = df.append(singlepoi,ignore_index=True)
    
    return df
        
        
        
if __name__ == "__main__":
    # 存储pois的类型 风景名胜为大类，其余为中类
    poi_typelstt = ['风景名胜', '博物馆', '展览馆', '美术馆', '文化宫', '档案馆']
    # 关键字列表 暂时为这五个与老子相关的关键词
    keyword_lst = ['道观', '道教', '老子', '老君', '太君']
    # 城市/省份列表，暂时以省份为adcode进行poi搜索
    adcode_lst = ['河北省','山西省','内蒙古自治区','辽宁省','吉林省','黑龙江省','江苏省',
'浙江省','安徽省','福建省','江西省','山东省','河南省','湖北省','湖南省',
'广东省','广西壮族自治区','海南省','四川省','贵州省','云南省',
'西藏自治区','陕西省','甘肃省','青海省','宁夏回族自治区','新疆维吾尔自治区',
'北京市','上海市','天津市','重庆市','香港特别行政区','澳门特别行政区','台湾省']
    key = "5a5d35395f339879bea2b4a4a34921f3"
    xlspath = f"中国老子相关旅游景点.xls"
    
    # dataframe所含有的信息：名字 地址 搜索的关键字 poi类型（api结果） poi搜索类型
    # 经纬度 电话 网址 邮箱 省份名 城市名 区县名 行业类型
    # 所属商圈 入口经纬度 出口经纬度 别名 标记 花费 评分 相片title和url
    df = pd.DataFrame(
        columns = ['name','address','keyword','poistype',
                   'location','tel','website',
                   'email','pname','cityname','adname','biztype',
                   'business_area','entr_location','exit_location','alias','tag',
                   'cost','rating','photos'])
    
    for keyword in keyword_lst:
        for adcode in adcode_lst:
            for poitype in poi_typelstt:
                result_lst = get_pois(key, keyword, adcode, poitype)
                df = pois2pdfram(df,keyword,result_lst)
    
    df.to_excel(xlspath,sheet_name=f"中国老子相关旅游景点")
    
    
    
    
    
