var async = {};
/**
 * 异步执行多个任务完成后执行回调方法
 * @param  {Array}   task      任务数组
 * @param  {Function} callback 任务都执行后的回调
 */
async.parallel = function(tasks, callback) {
    async._tasks(tasks, callback,true);
}

/**
 * 同步执行多个任务完成后执行回调方法
 * @param  {Array}   task      任务数组
 * @param  {Function} callback 任务都执行后的回调
 */
async.series = function(tasks, callback) {
    async._tasks(tasks, callback,false);
}



/**
 * 执行多个任务完成后执行回调方法
 * @param  {Array}   task      任务数组
 * @param  {Function} callback 任务都执行后的回调
 */
async._tasks = function(tasks, callback, async) {

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
        fn(function(err) {//框架注入的回调函数
            var args = Array.prototype.slice.call(arguments, 1);
            if (args.length <= 1) {
                args = args[0];
            }
            results[key] = args;
            if (err) {
                callback(err,results);//这里的result在err为true的时候表示错误信息
                callback = function() {};
            } else {
                completed += 1;
                if (completed >= keys.length) {
                    callback (null,results);
                } else {
                    if(func) func(); //递归的方法会传自身函数过来使用
                }
            }
        },results); //框架会给用户的函数注入第二个results参数,在同步的方法中可用
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
