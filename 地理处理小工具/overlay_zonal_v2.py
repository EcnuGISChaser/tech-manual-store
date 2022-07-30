from arcpy import *
from arcpy.sa import *
from numpy import extract

env.overwriteOutput = True
# 被统计栅格的路径+文件名
raster = r"I:\DataHub\WorldPop_proj\chn_ppp_2015.tif"
# 统计至该polygon
polygon = r"C:\Users\NingchengWang\Desktop\CGSS\CGSS2015_1000.shp"
# 输出table的名字，输出到工作空间
outtable = r'zonal_result.dbf'
# 新建一个临时文件夹，存放临时工作表，运行完删除该文件夹即可。不用手动新建，写入路径即可。
dbf_folder = r"C:\Users\NingchengWang\Desktop\CGSS\dbf_folder"
if not os.path.exists(dbf_folder):
    os.mkdir(dbf_folder)

# 新建一个临时文件夹，存放临时数据，运行完删除该文件夹即可。不用手动新建，写入路径即可。
raster_folder = r"C:\Users\NingchengWang\Desktop\CGSS\raster_folder"
if not os.path.exists(raster_folder):
    os.mkdir(raster_folder)

# polygon的统计字段，即按哪个字段区分polygon单元
fields = ['FID']
cur = da.SearchCursor(polygon,fields)
for i in cur:
    objid = i[0]
    print ("{0} is being processed".format(objid))
    lyr = "Zone {0}".format(objid)
    lyr = MakeFeatureLayer_management(polygon,lyr,'"{0}" = {1}'.format(fields[0],objid))
    out_polygon = "{0}\\zone_{1}.shp".format(raster_folder, objid)
    CopyFeatures_management(lyr,out_polygon)

    # 单独裁剪出来这块栅格
    extracted_raster = "{0}\\raster_{1}.tif".format(raster_folder, objid)
    extracted = ExtractByMask(raster,out_polygon)
    extracted.save(extracted_raster)
    
    # 做zonal
    tempTable = "{0}\\DBF_{1}.dbf".format(dbf_folder, objid)
    ZonalStatisticsAsTable(lyr, "{0}".format(fields[0]), extracted_raster, tempTable, "DATA")
    print(objid)

env.workspace = dbf_folder
dbfs =ListTables()
Merge_management(dbfs,outtable)

























