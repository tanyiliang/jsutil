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
 * @param  {Boolean}  async    判断是同步还是异步执行
 *
 */
async._tasks = function(tasks, callback, param ,async) {

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
        fn(function(isSucc) {//框架注入的回调函数,如果用户不执行回调，链式将会断掉，无法返回
            var args = Array.prototype.slice.call(arguments, 1);
            if (args.length <= 1) {
                args = args[0];
            }
            results[key] = args;
            if (isSucc === false) {
                callback(isSucc,args);//这里的args在isSucc为false的时候表示错误信息
                callback = function() {};
            } else {
                completed += 1;
                if (completed >= keys.length) {
                    callback (null,results);
                } else {
                    if(func) func(); //递归的方法会传自身函数过来使用
                }
            }
        },param===undefined?results:param,results); //框架会给用户的函数注入第二个results参数,在同步的方法中可用
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