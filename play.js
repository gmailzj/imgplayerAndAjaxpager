/*剧照、海报图片播放器*/


function PosterPicPlayer(dataSource, options){
  //数据源一条记录  [typeid, picUrl, thumbUrl]
	var data = [];
	//console.log(options);

	//遮罩id 
	this.floatmaskID= options.floatmaskID || 'floatmask';
	//触发player的图片list的wrapper
	this.photoListwrapperID = options.photoListwrapperID;

	//player的wrapper
	this.playerWrapperID = options.playerWrapperID;

	//项
	this.slidePhotoPrevID = options.slidePhotoPrevID;
	this.slidePhotoNextID = options.slidePhotoNextID;
	//页
	this.slidePrevID = options.slidePrevID;
	this.slideNextID = options.slideNextID;

	//关闭
	this.closeID = options.closeID;

	//标题
	this.titleID = options.titleID;

	this.dataSource = dataSource || data;

	this.stillArr = [];
	this.posterArr = [];
	this.bothTotalNum = 0;
	this.stillTotalNum = 0;
	this.posterTotalNum = 0;
	
	this.slideImgBigID = options.slideImgBigID;
	this.slideThumbWrapperID = options.slideThumbWrapperID;
	
	this.curr_item = null;
	this.curr_page = null;
	this.pernum = 7;
}



PosterPicPlayer.prototype = {
	typeid:{'still':3, 'poster':13},
	init:function(){
		var data = this.dataSource;
		var stillArr = [];
		var	posterArr= [];	
		var filter_data = [];
		var indexA = indexB = 0;
		var len = data.length;
		if(len <=0) return;
		for (var i=0; i<len; i++) {
			 if(data[i].typeid == this.typeid.still ){
			 	indexA++;
			 	data[i].typeIndex = indexA;
				stillArr.push(data[i]);
			 } else if(data[i].typeid == this.typeid.poster){
			 	indexB++;
			 	data[i].typeIndex = indexB;
				posterArr.push(data[i]);
			 }
			 filter_data.push(data[i]);
		}
		
		this.stillArr = stillArr;
		this.posterArr = posterArr;
		
		this.dataSource = this.stillArr.concat(this.posterArr);
		
		this.stillTotalNum = stillArr.length;
		this.posterTotalNum = posterArr.length;
		this.bothTotalNum = this.stillTotalNum +this.posterTotalNum;

		//页数最大值
		this.pageMaxNum = Math.ceil((this.bothTotalNum)/this.pernum);
		
		this.initialUI();
		this._bindEvents();

		
		//this.currItem(0);
		
	},
	
	//初始化缩略图列表
	initialUI:function(){
		
		
		function outputThumbListHtml(rows){
			var htmlArr = [];
			var _src = '';
			var curr_str = '';
			for(var i=0, len=rows.length; i<len; i++){
				curr_str = ''
				_src = rows[i].thumbUrl;
				i==0 && (curr_str ='class="on"') ; 
				htmlArr.push('<li '+curr_str+'><a href="javascript:void(0)" title="" index="'+i+'"><img src="'+_src+'" alt=""><span class="mask"><b></b></span></a></li>');
			}
			return htmlArr;
		};
		
		//初始化缩略图列表

		var dataSource = this.dataSource;
		var _tmpArr3 = outputThumbListHtml(dataSource);
		var _tmpHtml = _tmpArr3.join('');
		
		var e = document.getElementById(this.slideThumbWrapperID+'');
		e.innerHTML = _tmpHtml;
	},
	//事件绑定
	_bindEvents:function(){
		var _this = this;
		
		//下一个
		jQuery('#'+this.slidePhotoNextID).bind('click', function(e){
			_this._nextItem();
			e.preventDefault();
			return false;
		});
		//上一个
		jQuery('#'+this.slidePhotoPrevID).bind('click', function(e){
			_this._prevItem();
			e.preventDefault();
			return false;
		});
		
		
		//绑定当前项
		var e = document.getElementById(_this.slideThumbWrapperID+'');

		e && jQuery("a",e).bind('click',function(b){
			var index = parseInt(jQuery(this).attr('index'), 10);
			_this.currItem(index);
			b.preventDefault();
			return false;
		});
		e = null;

		//触发player打开
		var str_id_arr = _this.photoListwrapperID.split("|");

		for(var i=0, len = str_id_arr.length; i<len; i++){
			e = document.getElementById(str_id_arr[i]+'');
			if(e){
				jQuery("li a",e).bind('click',function(b){
					//此处index代表的图片的imageID
					var index = parseInt(jQuery(this).attr('index'), 10);
					_this.currItemPlayer(index);
					b.preventDefault();
				});
			}
		}
		

		e = null;

		//下一页
		//this.slideNextID = slideNextID;
		jQuery('#'+this.slideNextID).bind('click', function(e){
			_this._nextPage();
			e.preventDefault();

		});

		//上一页
		//this.slidePrevID = slidePrevID;
		jQuery('#'+this.slidePrevID).bind('click', function(e){
			_this._prevPage();
			e.preventDefault();

		});

		//关闭按钮
		jQuery('#'+this.closeID).bind('click', function(e){
			jQuery('#'+_this.floatmaskID).hide();
			jQuery('#'+_this.playerWrapperID).hide();
			_this.curr_item = null;//置空，以免关闭播放器后再打开同一个图片的时候没效果(在缩略图slide中这种情况是无效操作)

		});



	},

	_prevPage:function(){
	 	var i = this.curr_page;
	 	if(i<=1){
	 		return;
	 	}
	 	this.currPage(i-1);
	},


	_nextPage:function(){
	 	var i = this.curr_page;
	 	if(i>=this.pageMaxNum){
	 		return;
	 	}
	 	this.currPage(i+1);
	},
	currPage:function(i){
		
		var flag_next = (i > this.curr_page);//向左向右标记	
		var _this = this;
		//每一个li的宽度,也可以通过js计算出来
		var width = 92;
		var pernum = this.pernum;
		
		
		if(i == this.curr_page){
			return;
		}
		if(typeof this.clickflag !== 'undefined' && this.clickflag > 0){
			return;
		}

		this.clickflag  = 1;//标记为已经点击
		
		this.curr_page = i;
		
		var moveWidth =0;
		if(flag_next){//向右
			moveWidth = (i-1) * pernum * width;
			
		} else {
			moveWidth = (i-1) * pernum * width;


		}
		moveWidth =-moveWidth;
		var position =  moveWidth;
		scroll(this.slideThumbWrapperID, position)
		//切换以后的回调
		function scroll(containId, position){
			jQuery("#"+containId).animate(
				{
					'marginLeft': position
				}, 
				{ 
					'duration': 500 ,
					'complete': scrollCallback
				}
			);

		}
		function scrollCallback(){
			_this.clickflag  = 0;//效果执行完以后标记为0
			setBtnStatus();
		}
		
		//设置切换按钮状态
		function setBtnStatus(){
			var currP = _this.curr_page;
			var btn_prev = jQuery('#'+_this.slidePrevID);
			var btn_next = jQuery('#'+_this.slideNextID);

			if(currP <= 1){
				btn_prev.addClass('scrolltigger_L_none');
			} else {
				btn_prev.removeClass('scrolltigger_L_none');
			}

			if(currP == _this.pageMaxNum){
			 	btn_next.addClass('scrolltigger_R_none');
			} else {

			 	btn_next.removeClass('scrolltigger_R_none');
			}


		}
	},
	showTitle:function(item){
		//剧照 7/12
		var str = '';
		var typeid = item['typeid'];
		var typeIndex = item['typeIndex'];
		if(typeid == this.typeid.still){
			str+='剧照 ' + typeIndex + '/' +this.stillTotalNum;
		} else if(typeid == this.typeid.poster){
			str+='海报 ' + typeIndex + '/' +this.posterTotalNum;
		}
		jQuery('#' + this.titleID).html(str);
	},
	showFloat:function(){
		

		//遮罩
		jQuery('#'+this.floatmaskID).show();
		var elem = jQuery('#'+this.playerWrapperID);
		if(elem.css('display') =='none'){
			//设置player的location
			var scrolltop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
			var elem = jQuery('#'+this.playerWrapperID);
			elem.css('top', scrolltop);
			//player
			elem.show();

		}
		
		
	},
	getData_imgID:function(imgID){
		var data = this.dataSource;
		for(var i=0, len=data.length; i<len; i++){
			if(data[i].imageid == imgID){
				return i;
			}
		}
		return null;
	},
	currItemPlayer:function(imgID){
		var i= this.getData_imgID(imgID);
		this.currItem(i);
		return false;
	},
	loadImg2:function(src, elem){

		var e = elem;
		e.style.display ='none';
		e.onerror=function(){e.style.display = ''} ;

		if(jQuery.browser.msie){
			elem.onreadystatechange = function(){  
	            if(elem.readyState=="complete"||elem.readyState=="loaded"){ 
	                e.style.display = '';
	            } 
        	}   
		} else {

			elem.onload=function(){ 
	            if(elem.complete==true){ 
	               e.style.display = ''; 
	            } 
	        }  
		}
		
		if(e.src == src){
			e.style.display = '';
		} else {
			e.src = src;
		}

	},
	loadImg:function(src, elem){
		var e = elem;
		e.style.display ='none';
		jQuery(e).load(function(){
			e.style.display = '';
		})
		e.onerror=function(){e.style.display = ''} ;
		if(e.src == src){
			e.style.display = '';
		} else {
			e.src = src;
		}
		

	},
	currItem:function(i){

		//console.log(i)//
		i = i || 0;
		var data = this.dataSource;
		var item = data[i];

		if(i<0 || i>this.bothTotalNum) return;
		if(i==this.curr_item) return;
		var _this = this;
		var src = item['picUrl'];
		
		var e = document.getElementById(this.slideImgBigID+'');	
		setTimeout(function(){
			_this.loadImg2(src, e)
		} ,0);
	
		this.curr_item = i; 

		//设置滑动
		//高亮当前缩略图
		var wrapID = this.slideThumbWrapperID;
		var tmp = jQuery('li',document.getElementById(wrapID));
		tmp.removeClass('on');
		tmp.eq(i).addClass('on');

		//设置分页滚动
		this.currPage(Math.ceil((this.curr_item+1)/this.pernum));

		//设置项按钮状态
		var btn_item_prev = jQuery('#'+this.slidePhotoPrevID);
		var btn_item_next = jQuery('#'+this.slidePhotoNextID);

		if(this.curr_item <= 0){
			btn_item_prev.addClass('postertigger_L_none');
		} else {
			btn_item_prev.removeClass('postertigger_L_none');
		}

		if(this.curr_item == (this.bothTotalNum-1)){
		 	btn_item_next.addClass('postertigger_R_none');
		} else {
		 	btn_item_next.removeClass('postertigger_R_none');
		}

		//设置title
		this.showTitle(item);

		//显示浮层
		this.showFloat();

		return false;

	},
	_prevItem:function(){
		var i = this.curr_item;
		if(i<=0){
			return;
		}
		this.currItem(i-1);
	},
	_nextItem:function(){
		var i = this.curr_item;
		if(i>=this.bothTotalNum-1){
	 		return;
	 	}
		this.currItem(i+1);
	}

};
