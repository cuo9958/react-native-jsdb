# react-native-jsdb
javascript database

在react-native中使用的纯js实现的数据库.

可以根据库名,表名隔离数据.

## demo

```javascript
//初始化数据库
let db=new JSDB();

//添加一个自定义数据
db.add({name:"test",key:"abc"});

//根据id获取数据
db.getById("1223467890");

//根据条件查询数据
db.get(d=>d.name==="test");

//删除对应的数据
db.delete("1223467890");

//情况所有数据
db.clear()
```

## 方法

### 添加(add)

- data,要添加的数据对象,这里必须是对象.

### 根据id获取(getById)

- id,要获取的数据id

### 根据条件获取(get)

- fn,自定义比较方法
- top,限制返回数据的个数

### 删除(delete)

- id,要删除的数据id

### 清空(clear)

清空当前表的数据