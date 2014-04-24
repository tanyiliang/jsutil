/**
 * @class AsyncQ
 * 处理多个任务的同步和异步调用,单例模式
 * 支持同步方式和异步方式，同步执行的话，每一步能取到前面的返回值，异步则只有在最后的回调方法里面才能取到
 * 此方法正常有三个参数，第一个是目标方法组合，第二个是所有任务完成的最终回调方法，第三个是所有任务共享的变量param，可为空
 * 目标方法会默认被注入第一个参数callback，此回调方法第一个参数是表示调用是否成功，后面的参数分别表示返回值，可以传递多个值
 * 目标方法会默认被注入第二个参数param，此参数是所有任务共享的初始化变量,如果外层方法没有此变量，这里也不会出现
 * 目标方法会默认被注入第三个参数results，此参数是在同步任务中，前面任务的返回值，数组格式一一对应
 * 最终回调方法默认被注入的两个参数分别为任务是否都完成的标识和最终的任务返回值，
 * 任务返回值类型跟目标方法的组合类型一致，要么都是数组要么都是对象，数组的话顺序与目标方法列表顺序一致，对象的话，键值一致。
 */
var async = {};

/**
 * 异步执行多个任务完成后执行回调方法
 * @param  {Array}   task      任务数组
 * @param  {Function} callback 任务都执行后的回调
 * @param  {Function} param    任务中使用的参数
 */
async.parallel = function(tasks, callback , param) {
    async._tasks(tasks, callback,param,true);
}

/**
 * 同步执行多个任务完成后执行回调方法
 * @param  {Array}   task      任务数组
 * @param  {Function} callback 任务都执行后的回调
 * @param  {Function} param    任务中使用的参数
 */
async.series = function(tasks, callback,param) {
    async._tasks(tasks, callback,param,false);
}


/**
 * 内部方法不公开
 * @param  {Array}    task     任务数组
 * @param  {Function} callback 任务都执行后的回调
 * @param  {Function} param    任务中使用的参数
 * @param  {Boolean}  async    判断是阻塞执行还是同时执行
 * @param  {Array}    finalRs  all模式下返回已经执行的任务回调值
 *
 */
async._tasks = function(tasks, callback, param ,async , finalRs) {

    callback = callback || function() {};

    if (Object.prototype.toString.call(tasks) === '[object Array]') {
        var results = [];
        tasks = tasks.reduce(function(obj, k,i) {
          obj[i] = k;
          return obj;
        }, {});
    } else {
        var results = {};
    }

    var keys = [];
    for (var k in tasks) {
        if (tasks.hasOwnProperty(k)) {
            keys.push(k);
        }
    };
    if (!keys.length) {
        return callback();
    }


    var completed = 0;


    var doFn = function(fn,key,func){//执行用户的函数
        fn(function(isSucc,result) {//框架注入的回调函数,如果用户不执行回调，链式将会断掉，无法返回
            results[key] = result;//注入的回调函数第一个属性是成功标识，返回false会直接执行最终回调返回，第二个参数是用户设置的值
            if (isSucc === false) {
                callback(isSucc,results);//这里的result在isSucc为false的时候表示错误信息
                callback = function() {};
            } else {
                completed += 1;
                if (completed >= keys.length) {
                    callback (null,results);
                } else {
                    if(func) func(); //递归的方法会传自身函数过来使用
                }
            }
        },param ? param:(finalRs?finalRs:results),(finalRs?finalRs:results)); //框架会给用户的函数注入第二个results参数,在同步的方法中可用
    }

    if(async === true ){
        keys.forEach(function(key) {
            doFn(tasks[key],key,null);
        });
    } else if(async === false) {
        (function iterate() {
            var key = keys[completed];
            doFn(tasks[key],key,iterate);
        }());
    }
}


/**
 * 阻塞模式和并行模式的通用方法，支持嵌套。
 * 譬如tasks = [fn1,[fn2,fn3],fn4] 表示先执行fn1，在同时执行fn2，fn3，最后执行fn4，
 * 回调返回值也是同样格式的数组，长度为3，第2个值是长度为2的数组，类似['one',['two','three'],'four']
 * @param  {Array}   tasks     任务数组
 * @param  {Function} callback 任务都执行后的回调
 * @param  {Function} param    任务中使用的参数
 */
async.all = function(tasks, callback ,param) {

    if (Object.prototype.toString.call(tasks) !== '[object Array]')  throw new Error("first param is not an Array.");

    var completed = 0;
    var blankFunc = new function(){};
    var finalRs = [];
    var innerCallBack = function(isSucc, result){//
        if(typeof tasks[completed] === 'function'){
            finalRs[completed] = result[0];
        }else{
            finalRs[completed] = result;
        }
        if (isSucc === false) {
            callback(isSucc,finalRs);//这里的result在isSucc为false的时候表示错误信息
            callback = function() {};
        }else{
            completed += 1;
            if (completed >= tasks.length) {
                callback (null,finalRs);
            } else {
                iterate(); //递归的方法会传自身函数过来使用
            }
        }
    };

    function iterate() {
        if(typeof tasks[completed] === 'function'){
            //直接执行，保存返回值
            async._tasks([tasks[completed]],innerCallBack,param,false,finalRs);
        }else if (Object.prototype.toString.call(tasks[completed]) === '[object Array]'){
            //直接执行，保存返回值
            async._tasks(tasks[completed],innerCallBack,param,true,finalRs);
        }
    };
    iterate();
}