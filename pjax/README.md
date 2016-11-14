# pjax修改部分

注释掉以下代码
```javascript
var transient = $(this).attr('transient');
//...
script.async = $(this).attr('async') !== undefined ? true : false;
var done = false;
if (transient === 'true') {
	script.onload = script.onreadystatechange = function() {
		if (!done && (!script.readyState || script.readyState == 'loaded' || script.readyState == 'complete')){
			done = true;
			script.onload = script.onreadystatechange = null;
			document.head.removeChild(this);
		}
	};
}
```

> 备注：script请求默认async参数为true，会导致多个js执行顺序与书写顺序不一致。所以我修改为默认async为false。  
> 如果script标签有transient='true'，则表明此js是瞬态的，执行完此script后会删除此script元素。**只有自己私有的js才会需要加上此属性**