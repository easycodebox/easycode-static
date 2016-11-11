# pjax修改部分

注释掉以下代码
```javascript
//增加了cacheScript参数
if (options.cacheScript) {
	obj.scripts = findAll(obj.contents, 'script[src]').remove()
	obj.contents = obj.contents.not(obj.scripts)
}
```

原因：上面if代码块中两行代码的作用是把响应内容中的script[src]（带有src的script标签）抽出来，然后判断布局页面中是否存在script标签的src与之相匹配，
如果有则直接忽略，没有则添加至布局页面head的末尾处。 此功能在某些场景下是非常好的：script[src]是公用js库。但有些项目中js是子页面所特有的，
且只会初始化子页面的相关的功能，你给我缓存起来，那我下次再请求之前的子页面时就不会执行初始化函数了。