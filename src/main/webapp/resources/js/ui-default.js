if (!window.console) window.console = {};
if (!window.console.log) window.console.log = function () { };

/**
 * UI Utils
 */
var uiUtils = {
	// targetValue 가 a ~ b 만큼 변할 때 리턴수치는 c 에서 d까지 변한다.
	updateValue : function(a, b, c, d, targetValue){
		return (d - c) / (b - a) * (targetValue - a) + c;
	}
};

/**
 * UI Common
 */
var uiCommon = {
	/* IE7 ~ 9 Placeholder */
	placeholder : function() {
		jQuery.support.placeholder = false;
		test = document.createElement('input');
		if('placeholder' in test) jQuery.support.placeholder = true;
		if(!$.support.placeholder) {
			var active = document.activeElement;
			$(':text').focus(function() {
				if($(this).attr('placeholder') != '' && $(this).val() == $(this).attr('placeholder')) {
					$(this).val('');
					$(this).removeClass('hasPlaceholder');
				}
			}).blur(function() {
				if($(this).attr('placeholder') != '' && ($(this).val() == '' || $(this).val() == $(this).attr('placeholder'))) {
					$(this).val($(this).attr('placeholder'));
					$(this).addClass('hasPlaceholder');
				}
			});
			$(':text').blur();
			$(active).focus();
			$('form').submit(function() {
				$(this).find('.hasPlaceholder').each(function() {
					if( $(this).val() != '' && $(this).attr('placeholder') == $(this).val() ) {
						$(this).val('');
					}
				});
			});
		}
	}
}


/**
 * UI Toggle
 */
var uiToggle = (function() {
	var singleToggle = {
		temp : null,
		selectMenu : null,
		// 변수 선언
		getVariable : function() {
			var $wrapper = $('[data-wrapper=single-toggle]');
			var $wrapExcept = $('[data-except-click=true]');
			var $button = $('[data-button=single-toggle]');

			$wrapper.each(function(idx){
				$(this).data('idx', idx);
			});

			return {
				$wrapper : $wrapper,
				$wrapExcept : $wrapExcept,
				$button : $button
			}
		},
		// 토글 버튼 이벤트
		toggleMenu : function() {
			var self = this;
			oValue = this.temp;
			oValue.$button.click(function(e) {
				var $this = $(this);

				self.activeMenu($this, $this.parents('[data-wrapper=single-toggle]').data('idx'));
				e.stopPropagation();
			});
		},

		activeMenu : function($selector, idx) {
			var oValue = this.temp;
			var $el = $('[data-wrapper=single-toggle]').eq(idx);

			if ( idx == this.selectMenu ) {
				if ( $selector.parents('[data-wrapper=single-toggle]').hasClass('active') ) {
					this.inActiveMenu($el);
					console.log('Close', idx, this.selectMenu);
					this.selectMenu = null;
				} else {
					$el.toggleClass('active');
					this.selectMenu = idx;
					console.log('Close22', idx, this.selectMenu);
				}
			} else {
				var $prevEl = $('[data-wrapper=single-toggle]').eq(this.selectMenu);

				if ( $prevEl.attr('data-except-click') == 'true' ) {
					this.inActiveMenu($prevEl);
				}
				//$prevEl
				$el.toggleClass('active');
				this.selectMenu = idx;
				console.log('Open', idx, this.selectMenu);
			}
			//this.selectMenu
		},

		inActiveMenu : function($el) {
			if ( $el.hasClass('active') ) {
				$el.removeClass('active');
			}
		},

		// 토글 컨텐츠 이외의 영역 클릭 시 닫힘
		exceptClick : function() {
			var self = this;
			oValue = this.temp;
			$(document).click(function(e) {
				if ( $(e.target).parents('[data-wrapper=single-toggle].active').length == 0 ) {
					self.inActiveMenu(oValue.$wrapExcept);
					self.selectMenu = null;
				}
			});
		},
		init : function() {
			singleToggle.temp = singleToggle.getVariable();
			singleToggle.exceptClick();
			singleToggle.toggleMenu();
		}
	};
	return {
		singleToggle : singleToggle.init
	}
})();


/**
 * Aside 메뉴 Toggle
 */
var uiAside = (function() {
	var $elems = {
		body : null
	};

	var initElems = function() {
		$elems.body = $('.layout.body');
	};

	// 로드, 리사이즈 Function
	var sizeFunc = function(add, remove) {
		var $body = $elems.body;
		var _checkSize = 1360;
		var _isSmallWindow = $(window).width() < _checkSize;

		if (_isSmallWindow) {
			$body.addClass(add);
		} else {
			$body.removeClass(remove);
		}
	};

	// Document ready
	var initLoad = function() {
		if ($.cookie('fold_aside_menu')) {
			if ($.cookie('fold_aside_menu') == 'fold') {
				sizeFunc('window-sm aside-fold', '');
			} else {
				sizeFunc('window-sm', '');
			}
		} else {
			sizeFunc('window-sm aside-fold', '');
		}
	};

	// Window resize
	var resizeEvent = function() {
		sizeFunc('window-sm collapse-fold', 'window-sm aside-fold');
	};

	// Window scroll
	var scrollEvent = function() {
		var _left = $(window).scrollLeft();
		$('[data-button=aside-toggle]').css('margin-left', -_left);
	};

	// Cookie 생성 (메뉴 열림 닫힘 확인, 만료 : 생성일로부터 1일)
	var setMenuCookie = function(cName, cValue) {
		$.cookie(cName, cValue, { expires: 1, path: '/' })
	};

	var removeCollapse = function() {
		setTimeout(function() {
			$elems.body.removeClass('collapse-fold');
		}, 300);
	};

	var toggleMenu = function() {
		var $body = $elems.body;

		$('[data-button=aside-toggle]').click(function() {
			var showStatus = $body.hasClass('aside-fold');

			if (showStatus) {
				$body.addClass('collapse-fold');
				$body.removeClass('aside-fold');
				removeCollapse();
				setMenuCookie('fold_aside_menu', 'unfold');
			} else {
				$body.addClass('collapse-fold aside-fold');
				removeCollapse();
				setMenuCookie('fold_aside_menu', 'fold');
			}
		});
	};
	return {
		toggleAside : function() {
			initElems();
			initLoad();
			toggleMenu();
			scrollEvent();
		},
		resizeEvt : function() {
			resizeEvent();
		},
		scrollEvt : function() {
			scrollEvent();
		}
	}
}());


/**
 * 메인페이지
 */
var uiIndex = (function () {
	// 주문,클레임 현황 Scrollbar 생성
	var searchForSale = {
		// CustomScroll 상하 여백 설정
		scrollGap : 5,
		scrollControll : {
			nativeScroll : {min: 0, max: null},
			customScroll : {min: null, max: null}
		},
		setScrollbarHeight : function() {
			var $scrollbarContainer = $('[data-id=creat-scroll]');
			var $innerContent = $('[data-content=scroll-content]');
			var _wrapperHeight = $scrollbarContainer.height();
			var _contHeight = $innerContent.height();
			var _contentPercent = _wrapperHeight / _contHeight;
			var _scrollbarHeight = Math.floor(_wrapperHeight * _contentPercent - this.scrollGap);

			this.scrollControll.nativeScroll.max = $innerContent.height() - $scrollbarContainer.height();
			this.scrollControll.customScroll.min = this.scrollGap;
			this.scrollControll.customScroll.max = $scrollbarContainer.height() - _scrollbarHeight - this.scrollGap;

			if ( _wrapperHeight < _contHeight ) {
				$scrollbarContainer.append('<i class="scrollbar"></i>');
				$('.scrollbar').css('height', _scrollbarHeight);
				$innerContent.find('li:last-child').addClass('last');
			}
		},
		scrollEvt : function() {
			var self = this;
			var $wrapScroll = $('.inner-scroll');

			$wrapScroll.scroll(function() {
				var _scrollTop = $wrapScroll.scrollTop();
				$('.scrollbar').css('top', self.scrollCalu('scroll', _scrollTop) );
			});
		},
		/**
		 * [calu description] scroll 상태일때는 customScroll에 들어갈 값으로, drag 상태일때는 nativeScroll에 들어갈 값으로 변환
		 * @param  {[type]} type [description] scroll, drag
		 * @return {[type]}      [description]
		 */
		scrollCalu : function(type, value) {
			var self = this;
			var nativeScroll = self.scrollControll.nativeScroll;
			var customScroll = self.scrollControll.customScroll;

			var sourceMin = (type == 'scroll') ? nativeScroll.min:customScroll.min;
			var sourceMax = (type == 'scroll') ? nativeScroll.max:customScroll.max;
			var targetMin = (type == 'scroll') ? customScroll.min:nativeScroll.min;
			var targetMax = (type == 'scroll') ? customScroll.max:nativeScroll.max;

			return Math.floor(uiUtils.updateValue(sourceMin, sourceMax, targetMin, targetMax, value));
		},
		dragScrollbar : function() {
			var self = this;
			var moveY;
			var $scrollBar = $('.scrollbar');

			$scrollBar.bind('mousedown', function(e) {
				var $wrapScroll = $('.inner-scroll');
				var startY = e.pageY - $(this).offset().top;
				$('body').addClass('user-select-none');
				$scrollBar.addClass('active');
				$(document).bind('mousemove', function(e) {
					moveY = e.pageY - startY - $wrapScroll.offset().top;
					$wrapScroll.scrollTop(self.scrollCalu('drag', moveY));
				});
				$(document).bind('mouseup', function(e) {
					$wrapScroll.scrollTop(self.scrollCalu('drag', moveY));
					$('body').removeClass('user-select-none');
					$scrollBar.removeClass('active');
					$(document).unbind('mouseup');
					$(document).unbind('mousemove');
				});
			});
		},
		init : function() {
			searchForSale.setScrollbarHeight();
			searchForSale.scrollEvt();
			searchForSale.dragScrollbar();
		}
	};
	return {
		searchForSaleInit : searchForSale.init
	}
})();


/**
 * Document ready
 */
$(document).ready(function() {
	$('[data-id=accordion]').wmpAccordion();
	uiCommon.placeholder();
	uiToggle.singleToggle();
	uiAside.toggleAside();
	uiIndex.searchForSaleInit();
	$(window).resize(function() {
		uiAside.resizeEvt();
	});
	$(window).scroll(function() {
		uiAside.scrollEvt();
	});
});