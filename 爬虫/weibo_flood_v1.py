# %% 导入包
from itertools import count
from selenium import webdriver
import pandas as pd 
import time
from datetime import datetime,date,timedelta
import os
from os import path
import yagmail

# %% 创建当天的dataframe，返回今天的和昨天的两个csv名字
def create_table():

    today = date.today().strftime("%Y%m%d") # 输出格式为'20220608'
    df_name = 'weibo_'+today+'.csv'

    # 检验是否已存在当天csv，若没有，则新建一个
    if not path.exists(df_name):
        # [该条微博的id（微博给的标识码），发布时间，关键词，用户id，用户昵称，用户类型（什么v），微博正文，微博话题，用户属地]
        df = pd.DataFrame(columns = ['weibo_id','pub_time','key_word','user_id','user_name','user_type','main_text','topic_text','user_location'])
        df.to_csv(df_name,index=False,encoding = 'gb18030')

    # 获取昨天的dataframe,用于跨天的微博去重检验
    yesterday = (date.today() - timedelta(days = 1)).strftime("%Y%m%d")
    df_name_yest = 'weibo_'+yesterday+'.csv'

    return df_name,df_name_yest

# %% 推算发布日期
# ref_time是刷新该网页的时间，输入为datetime type
def estimate_pub_time(ref_time, text):

    text = text.replace('\n','').replace(' ','')

    # 如果是一小时内发布的，那么文本提示是xx秒前，xx分钟前
    if '前' in text:
        if '分钟' in text:
            time_offset = timedelta(minutes=int(text.split('分钟')[0]))
        if '秒' in text:
            time_offset = timedelta(seconds=int(text.split('秒')[0]))
        pub_time = ref_time - time_offset

    # 如果是当天发布的，一小时之前发布的，那么文本提示为 今天10:03
    elif '今天' in text:
        today = datetime.now()
        start_time = datetime(today.year,today.month,today.day)
        hours_offset = int(text.split('今天')[-1].split(':')[0])
        minutes_offset = int(text.split('今天')[-1].split(':')[-1])
        time_offset = timedelta(hours=hours_offset,minutes=minutes_offset)
        pub_time = start_time + time_offset

    # 今天之前的，格式为 06月02日08:43
    else:
        text = str(datetime.now().year)+'年'+text
        pub_time =  datetime.strptime(text, '%Y年%m月%d日%H:%M')

    str_pub_time = pub_time.strftime('%Y/%m/%d %H:%M:%S')
    return str_pub_time

# %% 计算多话题(文本里有多个#话题#)
def get_topic(text):

    if text.count('#') <= 1:
        topic_list = ['']
    else:
        text_list = text.split('#')
        topic_list = []
        for i in range(len(text_list)):
            if i%2 == 1:
                topic_list.append(text_list[i])

    return ','.join(topic_list)

# %% 浏览器窗口初始化，登陆微博
def initialize_website(user_id,password):

    # 配置Chrome driver 启动参数
    options = webdriver.ChromeOptions()
    # 限制CSS加载 
    No_CSS_loading = {'permissions.default.stylesheet':2}
    options.add_experimental_option("prefs",No_CSS_loading)
    # 限制图片加载
    # options.add_argument('blink-settings=imagesEnabled=false')  
    # 限制JavaScript执行
    options.add_argument('--disable-javascript') 
    # # 窗口最大化执行
    # edge_options.add_argument('--start-maximized')
    driver = webdriver.Chrome(executable_path = r'E:\workspace\TA_2022_GIS开发\实习\实习3\chromedriver.exe',chrome_options = options)

    # 微博登陆
    driver.get('https://weibo.com/login.php')
    time.sleep(5)
    # 微博账号
    driver.find_element_by_xpath('//*[@id="loginname"]').send_keys(user_id)
    # 微博密码
    driver.find_element_by_xpath('//div[@class="info_list password"]/div/input').send_keys(password)
    # 点击登录键
    driver.find_element_by_xpath('//a[@class="W_btn_a btn_32px"]').click()
    # 扫码！
    print('30s内赶紧扫码啊！')
    time.sleep(30)
    
    return driver

# %%  爬取单个页面至当天记录csv
def crawling_single_page(driver,df_name,df_yest,key_word,page_number):

    df = pd.read_csv(df_name,encoding='gb18030')
    df_yest = pd.read_csv(df_yest,encoding='gb18030')
    # page_number = list(range(1,51))
    driver.get(f'https://s.weibo.com/realtime?q={key_word}&rd=realtime&tw=realtime&Refer=weibo_realtime&page={page_number}')
    time.sleep(1)

    # 本页所用参数
    current_index = df.shape[0] # 累加的index起始值
    ref_time = datetime.now()
    global upd_count

    # 获取每一个微博card，再遍历其中的要素
    item_cards = driver.find_elements_by_xpath('//*[@action-type="feed_list_item"]')

    for item_card in item_cards:

        # 此item的html，用于后面检索特殊要素是否存在
        html = item_card.get_attribute('innerHTML')

        # 获取微博id
        weibo_id = item_card.get_attribute('mid')
        # 判断是否已被录入,若已经被录入，则返回False
        if duplicated_check(df,df_yest,weibo_id):
            df.to_csv(df_name,index=False,encoding = 'gb18030')
            # 更新本次写入了多少条数据
            upd_count += item_cards.index(item_card)
            return False
        df.loc[current_index,'weibo_id'] = weibo_id

        # 获取发布时间
        time_text = item_card.find_element_by_css_selector('p.from').find_elements_by_css_selector('a')[0].text
        pub_time = estimate_pub_time(ref_time,time_text)
        df.loc[current_index,'pub_time'] = pub_time

        # 写入关键词
        df.loc[current_index,'key_word'] = key_word

        # 获取用户名
        user_name = item_card.find_element_by_xpath('.//*[@class="name"]').text
        df.loc[current_index,'user_name'] = user_name

        # 获取user_id 来自 'https://weibo.com/2945827367?refer_flag=1001030103_'
        user_id = item_card.find_element_by_xpath('.//*[@class="name"]').get_attribute('href').split('?')[0].split('/')[-1]
        df.loc[current_index,'user_id'] = user_id
        
        # 获取用户类型
        if '微博官方认证' in html:
            user_type = 'vblue'
        else:
            user_type = 'common'
        df.loc[current_index,'user_type'] = user_type

        # 获取微博正文
        main_text = item_card.find_element_by_xpath('.//*[@node-type="feed_list_content"]').text
        if main_text.endswith('展开c'): #判断字符串是否以指定后缀结尾
            unfold_button = item_card.find_element_by_xpath('.//*[@action-type="fl_unfold"]')
            driver.execute_script("arguments[0].click();", unfold_button)
            main_text = item_card.find_element_by_xpath('.//*[@node-type="feed_list_content_full"]').text
        df.loc[current_index,'main_text'] = main_text

        # 获取话题
        topic_text = get_topic(main_text)
        df.loc[current_index,'topic_text'] = topic_text

        current_index += 1

    df.to_csv(df_name,index=False,encoding = 'gb18030')
    # 若该页全部被录入，返回True,同时计数+20
    upd_count += 20
    return True

# %% 检验是否重复
def duplicated_check(df_today,df_yest,weibo_id):
    # 当前已有的微博id，包括今天已有的和昨天的
    weibo_ids_exist = list(df_yest['weibo_id']) + list(df_today['weibo_id'])
    if int(weibo_id) in weibo_ids_exist:
        return True
    else:
        return False

# %% 报错了就要赶快修正
def send_error_email():
    yag = yagmail.SMTP(
        host='smtp.163.com', user='wnc2016ecnu@163.com',
        password='LPBYGCFXQQTCHSOF', smtp_ssl=True
    ).send('wnc2016ecnu@163.com', '【来自微博爬虫的一封信】', '苦逼的程序员啊，你的爬虫死了，快去复活它！')
    print('mail send success')


# %% 控制台

'''
使用说明：
1. 请下载对应浏览器版本的chromedriver，修改第87行的路径
2. 下面的输入参数改成自己的
3. 有报错自动发送邮件的功能，你要是也想用就把236行的发送邮件开关打开。若想给自己的邮箱发，请参考https://blog.csdn.net/u010751000/article/details/106976838
4. 程序运行记录会写在输出文件夹的log.txt里
5. 微博登陆有30s的扫码时间，过了的话就会报错，那就重新跑一下吧
'''

#  输入参数
user_id = "13262737587"  # 微博用户名
password = "ljwncc19980306"  # 你的微博密码
key_words = ['暴雨','积水','洪水','淹','涝','蹚水','大雨','山洪','滑坡','泥石流','趟水','大水'] # 关键词列表
output_path = r'E:\workspace\Research_2022_crawling_weibo\result' # 输出文件存放的文件夹
os.chdir(output_path)

# 登陆一下微博
driver = initialize_website(user_id,password)

# 进入循环，超大一个try护住
try:
    # 不要停下来啊
    while True:

        # 创建log文件记录
        f = open('log.txt','a+')
        
        for key_word in key_words:

            # 每次重新遍历一遍关键词列表前，更新一下当前日期对应的csv
            csv_today,csv_yest = create_table()

            # 更新条目计数
            upd_count = 0

            # 不需要那么着急去遍历
            time.sleep(10)

            # 开始遍历每一个关键词
            for page_number in list(range(1,51)):
                if crawling_single_page(driver,csv_today,csv_yest,key_word,page_number):
                    continue
                else:
                    # 已经追上前面的进度，那么跳出循环，继续下一个关键词
                    finished_time = datetime.now().strftime('%Y/%m/%d %H:%M:%S')
                    print(f'{finished_time} -- 【{key_word}】本次共写入{upd_count}条微博数据.')
                    f.write(f'{finished_time} -- 【{key_word}】本次共写入{upd_count}条微博数据.\n')
                    break
        f.close()
except:
    f.write(f'{finished_time} -- 【{key_word}】出问题了。')
    f.close()
    # send_error_email() # 行吧，赶紧来修吧
                

# 修改了一下







# %%
