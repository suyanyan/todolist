var swiper = new Swiper('.swiper-container', {
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});

//    数据的获取和存放
function getdata() {
    return localStorage.todo?JSON.parse(localStorage.todo):[];
}
function savedata(data) {
    localStorage.todo=JSON.stringify(data);
}

//    已完成和未完成按钮切换
var state="wait";
$(".btn div").click(function(){
    $(".btn div")
        .removeClass("active")
        .filter(this)
        .addClass("active");
    if($(".wait").hasClass("active")){
        state="wait";
        $(".trash").hide();
    }else{
        state="done";
        $(".trash").show()
    }
    rewrite();
});

//    添加信息
$(".add").click(function () {
    $(".main")
        .css("filter","blur(2px)")
        .next()
        .show()
        .find(".edit")
        .delay(500)
        .queue(function () {$(this)
            .addClass("show")
            .dequeue();
            //自动获得焦点（jQuery转化为原生的方式）
            $("#text")[0].focus()
        });
});
//    关闭按钮
$(".close").click(function () {
    $("#text").val="";
    $(".edit")
        .removeClass("show")
        .parent()
        .hide()
        .prev()
        .css("filter","none");
});
//    提交按钮
$("#button").click(function () {
    var text=$("#text").val();
    $("#text").val("");
    if(text===""){
        return;
    }
    var time=new Date().getTime();
    var data=getdata();
    var color=getcolor();
    data.push({con:text,time:time,isStar:0,isDown:0,color});
    savedata(data);
    rewrite();
    $(".edit").removeClass("show").parent().hide().prev().css("filter","");

});
//删除信息
$(".content").on("click",".del",function () {
    var data=getdata();
    var index=$(this).parent().attr("id");
    data.reverse();    //数字的顺序颠倒
    data.splice(index,1);
    data.reverse();
    savedata(data);
    rewrite();
});
//移动
$(".content").on("click",".finish",function () {
    var data=getdata();
    var index=$(this).parent().attr("id");
    data.reverse();
    data[index].isDown=1;
    data.reverse();
    savedata(data);
    rewrite();
});
//标记
$(".content").on("click","i",function () {
    var data=getdata();
    data.reverse();
    var index=$(this).parent().attr("id");
    data[index].isStar=data[index].isStar?0:1;
    data.reverse();
    savedata(data);
    rewrite();
});
//查看信息
$(".content").on("click","p",function (){
    var text=$("p").html();
    $(".main")
        .css("filter","blur(2px)")
        .next()
        .show()
        .find(".showedit")
        .delay(500)
        .queue(function () {$(this)
            .addClass("show")
            .dequeue();
            $(this).html(text);
        });
});
//清空
function clear() {
    var data = getdata();
    data = $.grep(data,function (ele,index) {
        return ele.isDown===0;
    });
    savedata(data);
    rewrite();
}
$(".trash").click(function () {
    clear();
});

//    重绘页面
function rewrite() {
    var data=getdata();
    //清空ui容器中的子元素
    $(".content ul").empty();
    data.reverse();
    //清除所有子节点
    var str="";
    //每遍历一条数据便给他连接一条li
    $.each(data,function (index,val) {
        if(state==="wait"){
            if(val.isDown===0){
                var className=val.isStar?"active":"";
                str+=" <li style='background:"+val.color+"' id='"+index+"'> <time> <span>"+getdate(val.time)+"</span> <span>"+gethour(val.time)+"</span></time><p>"+val.con+"</p><i class='"+className+"'>&#xe600;</i><div class='finish'>完成</div> </li>"
            }
        }else if(state==="done"){
            if(val.isDown===1){
                str+=" <li style='background:pink' id='"+index+"'> <time> <span>"+getdate(val.time)+"</span> <span>"+gethour(val.time)+"</span> </time><p>"+val.con+"</p><i class='"+className+"'>&#xe600;</i><div class='del'>删除</div> </li>"
            }
        }
        console.log(index);
    });

    $(".content ul").html(str);
    addEvent();
}
rewrite();

//获取时间
function getdate(ms) {
    var date=new Date();
    date.getTime(ms);
    var year=date.getFullYear();
    var month=arr(date.getMonth()+1);
    var day=arr(date.getDate());
    return year+"-"+month+"-"+day;
}
function gethour(ms) {
    var date=new Date();
    date.getTime(ms);
    var hour=arr(date.getHours());
    var min=arr(date.getMinutes());
    var sec=arr(date.getSeconds());
    return hour+":"+min+":"+sec;

}
function arr(num) {
    return num<10?"0"+num:num;
}

//颜色
function getcolor() {
    var color=[0,3,6,'9','f','c'];
    var strs="#";
    for(var i=0;i<3;i++){
        var pos=Math.round(Math.random()*color.length);
        strs+=pos;
    }
    return strs;
}

//移动函数
var max=$(window).width()/3;
function addEvent() {
    var lis=$(".content ul li");
    var mx;
    var state="start";
    lis.each(function (index,ele) {
        var obj=new Hammer(ele);
        obj.on("panstart",function (e) {
            $(ele).css("transition","none")
        });
        obj.on("pan",function (e) {
            //当前拖拽的距离
            mx=e.deltaX;
            //开始状态
            if(state==="start"){        //开始状态
                if(mx>0){
                    return
                }
            }
            //结束状态
            if(state==="end"){
                if(mx<0){
                    return;
                }
                mx=mx-max;      //设置的最大值
            }
            if(Math.abs(mx)>max){
                return;
            }
            $(ele).css("transform","translate3d("+mx+"px,0,0)");
        });
        obj.on("panend",function(){
            $(ele).css("transition","all 1s");
            if(Math.abs(mx)>max/2){     //Math.abs(mx)绝对值
                state="end";
                $(ele).css("transform","translate3d("+(-max)+"px,0,0)");
            }else{
                $(ele).css("transform","translate3d(0,0,0)")
                state="start";
            }
        })

    })
}
addEvent();

