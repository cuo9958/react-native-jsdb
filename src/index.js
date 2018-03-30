/**
 * 数据库
 */
import {
    getItem,
    setItem,
    removeItem, allKeys,
    removeItems,
    getlist
} from './Storage'

const uuid = () => `${Date.now()}${Math.random() * 1000 >> 0}`;

export default class JSDB {
    /**
     * 
     * @param {*} tableName 表名
     * @param {*} db 库名
     */
    constructor(tableName = "table", db = "db") {
        //检查库,表是否存在
        //初始化索引表
        this.db = db;
        this.tableName = tableName;
        this.tableKey = db + "_" + tableName;
        this.init();
    }
    db = "";
    //表名
    tableName = "";
    tableKey = "";
    //读,临时存储
    cacheList = new Map();
    cacheKeyList = [];
    //写入的列表
    writeList = new Map();
    backWriteList = new Map();

    /**
     * 初始化索引
     */
    async init() {
        let table = await getItem(this.tableKey);
        if (!table) {
            await setItem(this.tableKey, {
                createTime: Date.now()
            });
        }
    }
    //添加和更新
    async add(data = {}) {
        if (data.constructor !== Object) return;
        data._id = uuid();
        const key = this.tableKey + "_" + data._id
        this.writeList.set(key, data);
        this.write();
        return data;
    }
    //写入的实现,now立马写入
    write(now = false) {
        if (now || this.writeList.size > 20) {
            let tmp = this.writeList;
            this.writeList = this.backWriteList;
            this.backWriteList = tmp;
            this.backWriteList.forEach((v, k) => {
                setItem(k, v);
            })
        }
    }
    /**
     * 通过id查询
     * @param {*} id 
     */
    async getById(id) {
        if (!id) return {};
        id = this.tableKey + "_" + id;
        //如果有缓存
        if (this.cacheList.has(id)) {
            let tmp = this.cacheList.get(id);
            //如果过量了
            if (this.cacheKeyList.length > 20) {
                this.cacheKeyList.push(id);
                let k = this.cacheKeyList.shift();
                this.cacheList.delete(k);
            }
            return tmp;
        }
        this.cacheKeyList.push(id);
        this.cacheList.set(tmp);
        return await getItem(id);
    }
    /**
     * 通过过滤方法查询
     * @param {*} fn 
     */
    async get(fn, top = 0) {
        let keys = await allKeys();
        if (keys.length == 0) return [];
        if (top > 0 && keys.length > top) keys.length = top;
        const listkey = keys.filter(item => item.indexOf(this.tableKey + "_") === 0);
        if (listkey.length == 0) return [];
        let list = await getlist(listkey);
        list = list.filter(item => fn(item));
        return list;
    }
    /**
     * 删除
     * @param {*} id 
     */
    async delete(id) {
        if (!id) return {};
        await removeItem(this.tableKey + "_" + id);
    }
    /**
     * 清空表
     */
    async clear() {
        let keys = await allKeys();
        const listkey = keys.filter(item => item.indexOf(this.tableKey + "_") === 0);
        if (listkey.length == 0) return;
        removeItems(listkey);
    }
}

class Pool {
    list = [];
    //创建对象/使用旧对象
    create(tableName, db) {
        let list = this.list.filter(item => item.state = 0);
        if (list.length === 0) {
            let jsdb = {
                id: this.list.length,
                data: new JSDB(tableName, db),
                state: 0
            };
            jsdb.data.disable = this.disable(jsdb.id);
            this.list.push(jsdb)
            return jsdb.data;
        }
        let tmp = list[0];
        tmp.state = 1;
        return tmp.data;
    }
    //状态修改
    disable(id) {
        this.list[id].state = 0;
    }
}
exports.pool = new Pool();
