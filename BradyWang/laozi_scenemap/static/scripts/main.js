var spotsdata;
var map;
var markeronMap = []; // 用于调整自适应多个点标记窗口
var highlightIcon = "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png";
var defaultIcon = "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png";

var img_fengjingmingsheng = "static/img/fengjingmingsheng.jpg"
var driving, transfer;

// AMapLoader.load({
//     "key": "c57567c14a486d93390a1001cb31c927",              // 申请好的Web端开发者Key，首次调用 load 时必填
//     "version": "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
//     "plugins": ['AMap.Scale', 'AMap.ToolBar', 'AMap.HawkEye', 'AMap.Geolocation', 'AMap.MapType'],           // 需要使用的的插件列表，如比例尺'AMap.Scale'等
//     "AMapUI": {             // 是否加载 AMapUI，缺省不加载
//         "version": '1.1',   // AMapUI 版本
//         // "plugins": ['overlay/SimpleMarker', 'control/BasicControl'],       // 需要加载的 AMapUI ui插件
//     },
//     "Loca": {                // 是否加载 Loca， 缺省不加载
//         "version": '2.0'  // Loca 版本
//     },
// }).then((AMap) => {
//     map = new AMap.Map('mymap', {
//         // pitch: 0, // 地图俯仰角度，有效范围 0 度- 83 度
//         // viewMode: '3D' // 地图模式
//     });
//     var overView = new AMap.HawkEye({
//         opened: true
//     });
//     var toolBar = new AMap.ToolBar({
//         position: {
//             bottom: '20px',
//             right: '40px'
//         }
//     })
//     map.addControl(new AMap.Scale());
//     map.addControl(toolBar);
//     map.addControl(overView);
//     //图层切换控件
//     map.addControl(new AMap.MapType({
//         position: 'rt' //right top，右上角
//     }));
//     // map.addControl(new BasicControl.LayerSwitcher({
//     //     position: 'rt' //right top，右上角
//     // }));

//     // defaultIcon = new AMap.Marker().getIcon()

//     // highlightIcon = new AMap.Icon({
//     //     size: new AMap.Size(40, 62),    // 图标尺寸
//     //     image: '/static/Markers/hl-icon.png',  // Icon的图像
//     //     imageSize: new AMap.Size(20, 31),
//     //     // anchor: 'bottom-center', // NMD，为什么没用
//     // });

// }).catch((e) => {
//     console.error(e);  //加载错误提示
// });


map = new AMap.Map('mymap', {
    // pitch: 0, // 地图俯仰角度，有效范围 0 度- 83 度
    // viewMode: '3D' // 地图模式
});

AMap.plugin(['AMap.HawkEye', 'AMap.ToolBar', 'AMap.Scale', 'AMap.MapType', 'AMap.Driving', 'AMap.Transfer', 'AMap.TransferPolicy'], function () {//异步同时加载多个插件
    var overView = new AMap.HawkEye({
        opened: true
    });
    var toolBar = new AMap.ToolBar({
        position: {
            bottom: '20px',
            right: '40px'
        }
    })
    map.addControl(new AMap.Scale());
    map.addControl(toolBar);
    map.addControl(overView);
});

//设置DomLibrary，jQuery或者Zepto
AMapUI.setDomLibrary($);

//加载BasicControl，loadUI的路径参数为模块名中 'ui/' 之后的部分
AMapUI.loadUI(['control/BasicControl'], function (BasicControl) {

    // //缩放控件
    // map.addControl(new BasicControl.Zoom({
    //     position: 'lt', //left top，左上角
    //     showZoomNum: true //显示zoom值
    // }));

    //图层切换控件
    map.addControl(new BasicControl.LayerSwitcher({
        position: 'rt' //right top，右上角
    }));

});
//图层切换控件

// AMap.plugin('AMap.Geolocation', function () {
//     var geolocation = new AMap.Geolocation({
//         // 是否使用高精度定位，默认：true
//         enableHighAccuracy: true,
//         // 设置定位超时时间，默认：无穷大
//         timeout: 10000,
//         // 定位按钮的停靠位置的偏移量
//         offset: [10, 20],
//         //  定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
//         zoomToAccuracy: true,
//         //  定位按钮的排放位置,  RB表示右下
//         position: 'RB'
//     })

//     geolocation.getCurrentPosition(function (status, result) {
//         if (status == 'complete') {
//             onComplete(result)
//         } else {
//             onError(result)
//         }
//     });

//     function onComplete(data) {
//         // data是具体的定位信息
//     }

//     function onError(data) {
//         // 定位出错
//     }
// })


// axios.create([config])
// const instance = axios.create({
//   baseURL: 'get_all_spots',
//   timeout: 1000,
//   headers: {'X-Custom-Header': 'foobar'}
// });

const search_container = new Vue({
    el: "#search_container",
    data: {
        morequery: false,
        search_content: '',
        labelPosition: 'right',
        result_lst: true,
        ratings: 0,
        province_options: [
            {
                value: '所有省份',
                label: '所有省份'
            }, {
                value: '河北省',
                label: '河北省'
            }, {
                value: '山西省',
                label: '山西省'
            }, {
                value: '内蒙古自治区',
                label: '内蒙古自治区'
            }, {
                value: '辽宁省',
                label: '辽宁省'
            }, {
                value: '吉林省',
                label: '吉林省'
            }, {
                value: '黑龙江省',
                label: '黑龙江省'
            }, {
                value: '江苏省',
                label: '江苏省'
            }, {
                value: '浙江省',
                label: '浙江省'
            }, {
                value: '安徽省',
                label: '安徽省'
            }, {
                value: '福建省',
                label: '福建省'
            }, {
                value: '江西省',
                label: '江西省'
            }, {
                value: '山东省',
                label: '山东省'
            }, {
                value: '河南省',
                label: '河南省'
            }, {
                value: '湖北省',
                label: '湖北省  '
            }, {
                value: '湖南省',
                label: '湖南省'
            }, {
                value: '广东省',
                label: '广东省'
            }, {
                value: '广西壮族自治区',
                label: '广西壮族自治区'
            }, {
                value: '海南省',
                label: '海南省'
            }, {
                value: '四川省',
                label: '四川省'
            }, {
                value: '贵州省',
                label: '贵州省'
            }, {
                value: '云南省',
                label: '云南省'
            }, {
                value: '西藏自治区',
                label: '西藏自治区'
            }, {
                value: '陕西省',
                label: '陕西省'
            }, {
                value: '甘肃省',
                label: '甘肃省'
            }, {
                value: '青海省',
                label: '青海省'
            }, {
                value: '宁夏回族自治区',
                label: '宁夏回族自治区'
            }, {
                value: '新疆维吾尔自治区',
                label: '新疆维吾尔自治区'
            }, {
                value: '北京市',
                label: '北京市'
            }, {
                value: '上海市',
                label: '上海市'
            }, {
                value: '天津市',
                label: '天津市'
            }, {
                value: '重庆市',
                label: '重庆市'
            }, {
                value: '香港特别行政区',
                label: '香港特别行政区'
            }, {
                value: '澳门特别行政区',
                label: '澳门特别行政区'
            }, {
                value: '台湾省',
                label: '台湾省'
            }],
        query_form: {
            province: '所有省份',
            lowPrice: '',
            highPrice: '',
            Scores: [0, 5]
        }
    },
    methods: {
        search_spots: function () {
            // 先把原有的结果清空
            $("#result_content").empty();
            $("#single_spot").hide(500)
            $("#plan_to").hide(500)
            console.log(this.query_form)

            if (this.search_content==''&&(this.query_form.province == ['所有省份'] ||
                this.query_form.province == '所有省份' || this.query_form.province == ''
                || this.query_form.province == [] || this.query_form.province == ['']) && this.query_form.lowPrice == ''
                && this.query_form.highPrice == '' && this.query_form.Scores[0] == 0 && this.query_form.Scores[1] == 5) {
                search_container.$message('请勿未添加任何条件进行查询');
            } else {
                axios.post('/get_all_spots', {
                    spotsname: this.search_content,
                    province: this.query_form.province,
                    Scores: this.query_form.Scores,
                    lowPrice: this.query_form.lowPrice,
                    highPrice: this.query_form.highPrice
                }).then(function (response) {
                    spotsdata = response.data.spotsdata
                    console.log(spotsdata);
                    if (spotsdata.length == 0) {
                        search_container.$message('抱歉，未查询到相关景点');
                    } else {
                        $("#result_lst").show(800);
                        showResult(spotsdata)
                    }

                    // 如果查询到的数据为0条 便弹出消息提示框
                }).catch(function (error) {
                    console.log(error);
                });
            }
        },
        show_morequery: function () {
            // 如果更多查询窗口已经关闭就显示 否则就关闭显示
            if (this.morequery == false) {
                $('#search_input2').show(800)
                this.morequery = true
            } else if (this.morequery == true) {
                $('#search_input2').hide(800)
                this.morequery = false
            }
        },
        close_all: function () {
            map.clearMap();
            markeronMap = []
            this.search_content = ''
            this.$refs['query_form'].resetFields();
            $('#result_lst').hide(800)
            $('#search_input2').hide(800)
            $("#result_content").empty();
            $("#single_spot").hide(500)

            this.morequery = false
        },
        close_drawer: async function () {
            if (this.result_lst) {
                this.result_lst = false
                $('#result_content').hide(500)
                await new Promise((resolve, reject) => {
                    setTimeout(() => {
                        $('#result_lst').css('height', '14px')
                    }, 500)
                })

            } else if (!this.result_lst) {
                this.result_lst = true
                $('#result_lst').css('height', '500px')
                await new Promise((resolve, reject) => {
                    setTimeout(() => {
                        $('#result_content').show(500)
                    }, 500)
                })

            }

        }
    }
})

// 该函数将会显示查询数据的结果
// 首先result列表中将会显示 景区名字 星级 价格（如果有）详细地址的信息 类似高德地图
function showResult(spotsdata) {
    map.clearMap();
    markeronMap = []
    var result_content_div = document.getElementById("result_content")
    for (let i = 0; i < spotsdata.length; i++) {
        let imgurl;
        let spotname_title;
        let spotname = spotsdata[i].name
        let province = spotsdata[i].pname
        let district = spotsdata[i].cityname
        let addname = spotsdata[i].adname
        let lnglat = spotsdata[i].location.split(",")
        let photos = spotsdata[i].photos
        let alias = spotsdata[i].alias // 景点的别名
        let rating = spotsdata[i].rating //景区评分
        let price = spotsdata[i].cost //景区价格
        let poitypeslst = spotsdata[i].poistype.split(/;|,/)//景区类型列表，还需去重处理
        let poitypelst = [...new Set(poitypeslst)]
        let detail_address = spotsdata[i].address
        // let city = spotsdata[i].cityname
        let tel = spotsdata[i].tel
        let poitags;
        if (photos == '-') {
            // imgurl = img_fengjingmingsheng
            if (poitypelst.includes("寺庙道观")) {
                imgurl = "static/img/simiaodaoguan.jpg"
            } else if (poitypelst.includes("公园广场")) {
                imgurl = "static/img/gongyuanguangchang.jpg"
            } else if (poitypelst.includes("科教文化服务")) {
                imgurl = "static/img/kejiaowenhua.jpg"
            } else {
                imgurl = img_fengjingmingsheng
            }
        } else {
            photos = eval(photos)
            imgurl = photos[0].url
        }
        if (alias == '-') {
            spotname_title = spotname
        } else {
            spotname_title = `${spotname} (别名:${alias})`
        }
        if (rating == '-') {
            rating = 0
        } else {
            rating = eval(rating)
        }
        if (price == '-') {
            price = "-"
        } else {
            price = eval(price)
        }
        if (poitypelst == ["-"]) {
            poitags = []
        } else {
            poitags = poitypelst
        }
        //取photos对象第一个的url作为默认的图片
        // console.log(imgurl)

        let marker = new AMap.Marker({
            position: lnglat,
            icon: defaultIcon,
            anchor: 'bottom-center',
            offset: new AMap.Pixel(0, 0),
        })
        map.add(marker)
        // marker.setTitle(spotname);
        markeronMap.push(marker)

        let infoWindow = new AMap.InfoWindow({
            content: `${spotname}<br>评分： ${spotsdata[i].rating}<br>地址：${province}-${district}-${addname} ${spotsdata[i].address}`,  //使用默认信息窗体框样式，显示信息内容
            offset: new AMap.Pixel(0, -30),
            anchor: 'bottom-center'
        });


        let itemdiv = document.createElement("div");
        itemdiv.id = "result_content" + String(i)
        let speDiv = $("#result_content" + String(i))
        itemdiv.innerID = i
        itemdiv.className = "result_content_item"
        itemdiv.innerName = "#result_content" + String(i)

        // 放置每个item的照片的div
        let img_div = document.createElement("div");
        img_div.className = 'spotitem_imgbox'
        let img_span = document.createElement("span")
        img_span.className = 'spotitem_img'
        $(img_span).css("background-image", `url(${imgurl})`)
        img_div.appendChild(img_span)
        itemdiv.appendChild(img_div)

        let titlediv = document.createElement("div");
        titlediv.className = 'spot_item_title'
        titlediv.innerText = `${String(i + 1)}. ${spotname}` //景点名称
        itemdiv.appendChild(titlediv)

        let infodiv = document.createElement("div");
        infodiv.className = 'spot_item_info'

        let ratediv = document.createElement("div");
        ratediv.className = 'spot_rate'
        $(ratediv).html(`评分：${spotsdata[i].rating}`)//景点评分

        let adddiv = document.createElement("div");
        adddiv.className = 'spot_address'
        adddiv.innerText = `地址：${province}-${district}-${addname} ${spotsdata[i].address}` //景点详细地址

        infodiv.appendChild(ratediv)
        infodiv.appendChild(adddiv)
        itemdiv.appendChild(infodiv)

        $(itemdiv).on("mouseover", function () {
            syncHighlight(this, true);
        });
        $(itemdiv).on("mouseleave", function () {
            syncHighlight(this, false);
        });
        $(itemdiv).on("click", function () {
            map.panTo(lnglat)
            map.setZoom(14);
            // $("#single_spot").show(500)
            setSinglespotInfo(imgurl, spotname_title, rating, price, poitags, detail_address, tel, lnglat, district)
        })

        marker.on("mouseover", function (e) {
            syncHighlight(itemdiv, true);
            infoWindow.open(map, lnglat);
        });
        marker.on("mouseout", function () {
            syncHighlight(itemdiv, false);
            infoWindow.close();
        });





        result_content_div.appendChild(itemdiv)
        marker.on('click', function () {
            map.panTo(lnglat)
            map.setZoom(14);
            // $("#single_spot").show(500)
            setSinglespotInfo(imgurl, spotname_title, rating, price, poitags, detail_address, tel, lnglat, district)
            // scrolltoDiv(itemdiv, marker)

        })
    }
    // 第一个参数为空，表明用图上所有覆盖物 setFitview
    // 第二个参数为false, 非立即执行
    // 第三个参数设置上左下右的空白
    map.setFitView(null, false);
}

// 设定景点信息窗的数据
function setSinglespotInfo(imgurl, spotname, rating, price, poitags, detail_address, phone_number, lnglat, city) {
    single_spot.singlespot_imgstyle.backgroundImage = `url(${imgurl})`;
    single_spot.spotname = spotname;
    single_spot.rating = rating;
    single_spot.price = `￥${price}`;
    single_spot.poitags = poitags
    single_spot.detail_address = detail_address
    single_spot.phone_number = phone_number
    single_spot.lnglat = lnglat
    single_spot.city = city
    $("#single_spot").show(500)
    $("#plan_to").hide(500)

}


// 单个景区的信息框vue对象
const single_spot = new Vue({
    el: "#single_spot",
    data: {
        btntext: "返回 >",
        singlespot_imgstyle: {
            backgroundImage: ""
        },
        spotname: "",
        rating: 0,
        price: "-",
        poitags: [],
        detail_address: "",
        phone_number: "",
        lnglat: "",
        city: ""
    },
    methods: {
        closeinfo: function () {
            $("#single_spot").hide(500)
        },
        plandrive: function () {
            $("#single_spot").hide(500)
            $("#plan_to").show(500)
            planto_box.endplace = this.detail_address
            planto_box.endlocation = this.lnglat
        }
    }
})

const planto_box = new Vue({
    el: "#plan_to",
    data: {
        current_plmethod: "drive",
        zenmequ: "开车去",
        driveopacity: 1,
        busopacity: 0.5,
        startplace: "",
        startlocation: "",
        endplace: "",
        endlocation: "",

    },
    methods: {
        setmethod: function (methods) {
            // console.log(methods)
            // 判断设定的是哪种交通方式
            if (methods == 'car') {
                this.current_plmethod = "drive"
                this.driveopacity = 1
                this.busopacity = 0.5
                this.zenmequ = "开车去"
            } else if (methods == 'bus') {
                this.current_plmethod = "bus"
                this.driveopacity = 0.5
                this.busopacity = 1
                this.zenmequ = "坐公交"
            }
        },
        closeplan: function () {
            $("#plan_to").hide(500)
            $("#single_spot").show(500)
            this.clear_driving()

        },
        deltext: function (flg) {
            if (flg == 'start') {
                this.startplace = ''
            } else if (flg == 'end') {
                this.endplace = ''
            }
        },
        clear_driving: function () {
            if (driving) {
                driving.clear()
            }
            if (transfer) {
                transfer.clear()
            }
        },
        plan_route: function () {
            if (this.current_plmethod == "drive") {
                if (driving) {
                    driving.clear()
                }
                if (transfer) {
                    transfer.clear()
                }
                //构造路线导航类
                driving = new AMap.Driving({
                    map: map,
                    panel: "panel"
                });
                // 根据起终点经纬度规划驾车导航路线
                driving.search(new AMap.LngLat(this.startlocation[0], this.startlocation[1]), new AMap.LngLat(this.endlocation[0], this.endlocation[1]), function (status, result) {
                    // result 即是对应的驾车导航信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
                    if (status === 'complete') {
                        console.log('绘制驾车路线完成')
                    } else {
                        console.log('获取驾车数据失败：' + result)
                    }
                });
            } else if (this.current_plmethod == "bus") {
                if (driving) {
                    driving.clear()
                }
                if (transfer) {
                    transfer.clear()
                }
                let transOptions = {
                    map: map,
                    city: single_spot.city,
                    panel: 'panel',
                    //cityd:'乌鲁木齐',
                    // policy: AMap.TransferPolicy.LEAST_TIME
                };
                console.log(planto_box.city)
                transfer = new AMap.Transfer(transOptions);
                //根据起、终点坐标查询公交换乘路线
                transfer.search(new AMap.LngLat(this.startlocation[0], this.startlocation[1]), new AMap.LngLat(this.endlocation[0], this.endlocation[1]), function (status, result) {
                    // result即是对应的公交路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_TransferResult
                    if (status === 'complete') {
                        console.log('绘制公交路线完成')
                    } else {
                        console.log('公交路线数据查询失败' + result)
                        planto_box.$message('抱歉，未找到该城市内的公交路线');
                    }
                });
            }

        }
    }
})



// 高亮函数
function syncHighlight(o, state) {
    // 高亮or取消高亮显示 某个marker以及他对应的信息
    if (state) {
        $(o).css("background", "#d2d4d5");
        let marker = markeronMap[o.innerID];
        marker.setIcon(highlightIcon);
        //map.panTo(marker.getPosition()); 误触太严重，去掉
    }
    else {
        $(o).css("background", "");
        let marker = markeronMap[o.innerID];
        marker.setIcon(defaultIcon);
    }
}

//控件清空函数
function clearChild() {

}

//跳转到marker对应的div 神奇的函数
function scrolltoDiv(div, emarker) {
    let scroll_offset = $(div).offset();//这里一定要用jquery的写法
    console.log(scroll_offset)
    $("#result_content").animate({
        scrollTop: scroll_offset.top //让body的scrollTop等于pos的top，就实现了滚动 
    }, 1000);
}

AMapUI.loadUI(['misc/PoiPicker'], function (PoiPicker) {

    let poiPickerstart = new PoiPicker({
        //city:'北京',
        input: 'search_input_start'
    });

    let poiPickerend = new PoiPicker({
        //city:'北京',
        input: 'search_input_end'
    });

    //初始化poiPicker
    poiPickerReady(poiPickerstart, 1);
    poiPickerReady(poiPickerend, 2);
});

function poiPickerReady(poiPicker, flg) {

    window.poiPicker = poiPicker;

    let marker = new AMap.Marker();

    let infoWindow = new AMap.InfoWindow({
        offset: new AMap.Pixel(0, -20)
    });

    //选取了某个POI
    poiPicker.on('poiPicked', function (poiResult) {

        var source = poiResult.source,
            poi = poiResult.item,
            info = {
                source: source,
                id: poi.id,
                name: poi.name,
                location: poi.location.toString(),
                address: poi.address
            };

        // marker.setMap(map);
        // infoWindow.setMap(map);

        // marker.setPosition(poi.location);
        // infoWindow.setPosition(poi.location);

        // infoWindow.setContent('POI信息: <pre>' + JSON.stringify(info, null, 2) + '</pre>');
        // infoWindow.open(map, marker.getPosition());

        //注意 最终取用的结果不是name而是location也即是经纬度
        map.setCenter(poi.location);
        if (flg == 1) {
            planto_box.startplace = poi.name
            console.log([poi.location.lng, poi.location.lat])
            planto_box.startlocation = [poi.location.lng, poi.location.lat]
        } else if (flg == 2) {
            planto_box.endplace = poi.name

            planto_box.endlocation = [poi.location.lng, poi.location.lat]
        }

    });

    // poiPicker.onCityReady(function () {
    //     poiPicker.suggest('美食');
    // });
}