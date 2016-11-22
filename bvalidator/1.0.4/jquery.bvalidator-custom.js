/*
 * @author WangXiaoJin
 *
 */
;(function ($) {

    'use strict';
    
  //自定义验证函数
	$.extend(bValidator.validators, {
		//兼容老版的习惯
		regex: function(v, regex, mod) {
			return utils.regex(v, regex, mod);
		},
		alpha: function(v) { return this.regex(v, regex.alpha); },
		alphanum: function(v) { return this.regex(v, regex.alphanum); },
		alpha_u: function(v) { return this.regex(v, regex.alpha_u); },
		alpha_l: function(v) { return this.regex(v, regex.alpha_l); },
		word: function(v) { return this.regex(v, regex.word); },
		int: function(v){ return this.regex(v, regex.int); },
		int_plus: function(v){ return this.regex(v, regex.int_plus); },
		int_minus: function(v){ return this.regex(v, regex.int_minus); },
		int_no_minus: function(v){ return this.regex(v, regex.int_no_minus); },
		int_no_plus: function(v){ return this.regex(v, regex.int_no_plus); },
		number: function(v){ return this.regex(v, regex.number); },
		number_plus: function(v){ return this.regex(v, regex.number_plus); },
		number_minus: function(v){ return this.regex(v, regex.number_minus); },
		number_no_plus: function(v){ return this.regex(v, regex.number_no_plus); },
		number_no_minus: function(v){ return this.regex(v, regex.number_no_minus); },
		decemal: function(v){ return this.regex(v, regex.decemal); },
		decemal_plus: function(v){ return this.regex(v, regex.decemal_plus); },
		decemal_minus: function(v){ return this.regex(v, regex.decemal_minus); },
		decemal_no_plus: function(v){ return this.regex(v, regex.decemal_no_plus); },
		decemal_no_minus: function(v){ return this.regex(v, regex.decemal_no_minus); },
		
		chinese: function(v){
			return this.regex(v, regex.chinese);
		},
		word_zh: function(v){
			return this.regex(v, regex.word_zh);
		},
		mobile: function(v){
			return this.regex(v, regex.mobile);
		},
		idcard: function(v){
			return this.regex(v, regex.idcard);
		},
		tel: function(v){
			return this.regex(v, regex.tel );
		}
	});
	
	bValidator.defaultOptions.autoModifiers = {
		alpha : ['trim'],
		alphanum : ['trim'],
		alpha_u : ['trim'],
		alpha_l : ['trim'],
		word : ['trim'],
		int : ['trim'],
		int_plus : ['trim'],
		int_minus : ['trim'],
		int_no_minus : ['trim'],
		int_no_plus : ['trim'],
		number : ['trim'],
		number_plus : ['trim'],
		number_minus : ['trim'],
		number_no_plus : ['trim'],
		number_no_minus : ['trim'],
		decemal : ['trim'],
		decemal_plus : ['trim'],
		decemal_minus : ['trim'],
		decemal_no_plus : ['trim'],
		decemal_no_minus : ['trim'],
		chinese : ['trim'],
		word_zh : ['trim'],
		mobile : ['trim'],
		idcard : ['trim'],
		tel : ['trim'],
        digit  : ['trim'],
        email  : ['trim'],
        url    : ['trim'],
        date   : ['trim'],
        ip4    : ['trim'],
        ip6    : ['trim']
    };

})(jQuery);
